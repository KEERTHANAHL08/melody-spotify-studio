import os
import io
import pandas as pd
import numpy as np
from fastapi import FastAPI, Query, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from sklearn.metrics import silhouette_score, adjusted_rand_score, normalized_mutual_info_score

from preprocessing import PreprocessingPipeline
from eda import (
    compute_overview_kpis, get_genre_distribution, get_audio_feature_averages,
    get_top_artists, get_popularity_distribution, get_playlist_composition,
    generate_key_insights, get_feature_distribution_bins, get_boxplot_data, get_scatter_sample
)
from correlation import compute_correlation_matrix
from clustering import KMeansManager
from recommendations import RecommenderEngine

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "data", "spotify_dataset.csv")

app = FastAPI(title="Melody — Spotify Genre Studio API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global pipeline instances
pipeline: Optional[PreprocessingPipeline] = None
kmeans_manager: Optional[KMeansManager] = None
recommender: Optional[RecommenderEngine] = None

def init_app_state(file_path: str = DATA_FILE):
    global pipeline, kmeans_manager, recommender
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Spotify dataset not found at {file_path}")

    pipeline = PreprocessingPipeline(file_path)
    clean_df = pipeline.load_and_process()
    scaled_features = pipeline.get_scaled_features()
    feature_names = pipeline.available_features

    kmeans_manager = KMeansManager(clean_df, scaled_features, feature_names)
    kmeans_manager.train(k=6) # initial default 6 clusters

    recommender = RecommenderEngine(clean_df, scaled_features, feature_names)

# Initialize on startup
@app.on_event("startup")
def startup_event():
    try:
        init_app_state()
    except Exception as e:
        print(f"Startup initialization notice: {e}")

@app.get("/api/health")
def get_health():
    loaded = pipeline is not None and pipeline.clean_df is not None
    return {
        "status": "healthy",
        "dataset_loaded": loaded,
        "rows": len(pipeline.clean_df) if loaded else 0,
        "features": pipeline.available_features if loaded else []
    }

@app.get("/api/overview")
def get_overview():
    if pipeline is None or pipeline.clean_df is None or kmeans_manager is None:
        raise HTTPException(status_code=500, detail="Dataset not ready")

    df = pipeline.clean_df
    k = kmeans_manager.current_k
    kpis = compute_overview_kpis(df, n_clusters=k)
    genre_dist = get_genre_distribution(df)
    feature_avgs = get_audio_feature_averages(df, pipeline.available_features)
    top_artists = get_top_artists(df, limit=10)
    popularity_dist = get_popularity_distribution(df, bins=10)
    playlist_comp = get_playlist_composition(df, limit=8)
    insights = generate_key_insights(df)

    return {
        "kpis": kpis,
        "genre_distribution": genre_dist,
        "audio_feature_averages": feature_avgs,
        "top_artists": top_artists,
        "popularity_distribution": popularity_dist,
        "playlist_composition": playlist_comp,
        "insights": insights
    }

@app.get("/api/dataset")
def get_dataset(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=5, le=100),
    search: Optional[str] = None,
    genre: Optional[str] = None,
    sort_by: Optional[str] = "track_popularity",
    sort_order: Optional[str] = "desc",
    min_pop: Optional[int] = None,
    max_pop: Optional[int] = None
):
    if pipeline is None or pipeline.clean_df is None:
        raise HTTPException(status_code=500, detail="Dataset not ready")

    df = pipeline.clean_df.copy()

    # Apply search
    if search and search.strip():
        q = search.strip().lower()
        mask = (
            df['track_name'].str.lower().str.contains(q, na=False) |
            df['track_artist'].str.lower().str.contains(q, na=False) |
            df['playlist_name'].str.lower().str.contains(q, na=False)
        )
        df = df[mask]

    # Filter genre
    if genre and genre != "all" and 'playlist_genre' in df.columns:
        df = df[df['playlist_genre'] == genre]

    # Filter popularity
    if min_pop is not None and 'track_popularity' in df.columns:
        df = df[df['track_popularity'] >= min_pop]
    if max_pop is not None and 'track_popularity' in df.columns:
        df = df[df['track_popularity'] <= max_pop]

    total_records = len(df)

    # Sort
    if sort_by and sort_by in df.columns:
        ascending = (sort_order.lower() == "asc")
        df = df.sort_values(by=sort_by, ascending=ascending)

    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    sliced = df.iloc[start_idx:end_idx]

    records = sliced.to_dict(orient="records")

    return {
        "page": page,
        "page_size": page_size,
        "total_records": total_records,
        "total_pages": int(np.ceil(total_records / page_size)),
        "data": records,
        "columns": list(pipeline.clean_df.columns),
        "available_genres": sorted(list(pipeline.clean_df['playlist_genre'].unique())) if 'playlist_genre' in pipeline.clean_df.columns else []
    }

@app.get("/api/dataset/export")
def export_dataset():
    if pipeline is None or pipeline.clean_df is None:
        raise HTTPException(status_code=500, detail="Dataset not ready")

    stream = io.StringIO()
    pipeline.clean_df.to_csv(stream, index=False)
    stream.seek(0)

    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=spotify_cleaned_dataset.csv"
    return response

@app.get("/api/preprocessing")
def get_preprocessing_report():
    if pipeline is None:
        raise HTTPException(status_code=500, detail="Pipeline not initialized")
    return pipeline.get_report()

@app.get("/api/insights")
def get_insights(
    feature: Optional[str] = "danceability",
    group_by: Optional[str] = "playlist_genre",
    x_feature: Optional[str] = "danceability",
    y_feature: Optional[str] = "energy"
):
    if pipeline is None or pipeline.clean_df is None:
        raise HTTPException(status_code=500, detail="Dataset not ready")

    df = pipeline.clean_df
    hist_bins = get_feature_distribution_bins(df, feature=feature, bins=15)
    boxplot = get_boxplot_data(df, feature=feature, group_by=group_by)
    scatter = get_scatter_sample(df, x_feature=x_feature, y_feature=y_feature, sample_size=400)

    return {
        "feature": feature,
        "histogram": hist_bins,
        "boxplot": boxplot,
        "scatter": scatter,
        "available_features": pipeline.available_features,
        "groupings": ["playlist_genre", "cluster"] if "cluster" in df.columns else ["playlist_genre"]
    }

@app.get("/api/correlation")
def get_correlation(method: str = "pearson", features: Optional[str] = None):
    if pipeline is None or pipeline.clean_df is None:
        raise HTTPException(status_code=500, detail="Dataset not ready")

    feat_list = features.split(",") if features else None
    return compute_correlation_matrix(pipeline.clean_df, method=method, features=feat_list)

@app.get("/api/genres")
def get_genre_analysis(genres: Optional[str] = None):
    if pipeline is None or pipeline.clean_df is None:
        raise HTTPException(status_code=500, detail="Dataset not ready")

    df = pipeline.clean_df
    if 'playlist_genre' not in df.columns:
        raise HTTPException(status_code=400, detail="Playlist genre column missing")

    available = sorted(list(df['playlist_genre'].unique()))
    selected_genres = genres.split(",") if genres else available

    analysis_features = ['danceability', 'energy', 'acousticness', 'valence', 'speechiness', 'liveness']
    
    genre_profiles = []
    for g in selected_genres:
        sub = df[df['playlist_genre'] == g]
        if len(sub) == 0:
            continue
        means = {f: round(float(sub[f].mean()), 3) for f in analysis_features if f in sub}
        means["tempo"] = round(float(sub['tempo'].mean()), 1) if 'tempo' in sub else 0
        means["popularity"] = round(float(sub['track_popularity'].mean()), 1) if 'track_popularity' in sub else 0
        genre_profiles.append({
            "genre": g,
            "track_count": len(sub),
            "means": means
        })

    # Comparative questions derived dynamically
    comparisons = {}
    if genre_profiles:
        for f in ['energy', 'danceability', 'valence', 'acousticness']:
            best = max(genre_profiles, key=lambda x: x['means'].get(f, 0))
            worst = min(genre_profiles, key=lambda x: x['means'].get(f, 0))
            comparisons[f] = {
                "highest_genre": best['genre'],
                "highest_value": best['means'].get(f, 0),
                "lowest_genre": worst['genre'],
                "lowest_value": worst['means'].get(f, 0),
                "explanation": f"Among selected genres, {best['genre'].upper()} demonstrates the peak average {f} ({best['means'].get(f, 0)}), while {worst['genre'].upper()} displays the lowest ({worst['means'].get(f, 0)})."
            }

    return {
        "available_genres": available,
        "selected_genres": selected_genres,
        "profiles": genre_profiles,
        "comparisons": comparisons
    }

class TrainClusterRequest(BaseModel):
    k: int = 6

@app.get("/api/clustering")
def get_clustering():
    if kmeans_manager is None:
        raise HTTPException(status_code=500, detail="Clustering manager not ready")

    pca_sample = kmeans_manager.get_pca_scatter_sample(sample_size=800)
    summaries = kmeans_manager._generate_cluster_summaries()

    return {
        "current_k": kmeans_manager.current_k,
        "inertia": round(float(kmeans_manager.kmeans.inertia_), 2) if kmeans_manager.kmeans else 0,
        "pca_sample": pca_sample,
        "cluster_summaries": summaries
    }

@app.post("/api/clustering/train")
def train_clustering(req: TrainClusterRequest):
    if kmeans_manager is None:
        raise HTTPException(status_code=500, detail="Clustering manager not ready")
    if req.k < 2 or req.k > 12:
        raise HTTPException(status_code=400, detail="Cluster count k must be between 2 and 12")

    res = kmeans_manager.train(k=req.k)
    return res

@app.get("/api/clustering/crosstab")
def get_crosstabs():
    if kmeans_manager is None:
        raise HTTPException(status_code=500, detail="Clustering manager not ready")
    return kmeans_manager.get_crosstabs()

@app.get("/api/clustering/export")
def export_clusters():
    if pipeline is None or pipeline.clean_df is None:
        raise HTTPException(status_code=500, detail="Dataset not ready")

    stream = io.StringIO()
    cols_to_export = [c for c in ['track_id', 'track_name', 'track_artist', 'playlist_genre', 'playlist_name', 'cluster', 'track_popularity'] if c in pipeline.clean_df.columns]
    pipeline.clean_df[cols_to_export].to_csv(stream, index=False)
    stream.seek(0)

    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=spotify_cluster_assignments.csv"
    return response

@app.get("/api/evaluation")
def get_evaluation():
    if kmeans_manager is None:
        raise HTTPException(status_code=500, detail="Clustering manager not ready")

    # If elbow data hasn't been computed, compute it
    if kmeans_manager.elbow_data is None:
        kmeans_manager.compute_elbow_and_silhouette(k_min=2, k_max=10)

    sample_size = min(4000, len(kmeans_manager.scaled_features))
    sample_indices = np.random.choice(len(kmeans_manager.scaled_features), size=sample_size, replace=False)
    sil = float(silhouette_score(kmeans_manager.scaled_features[sample_indices], kmeans_manager.labels[sample_indices]))

    ari = float(adjusted_rand_score(pipeline.clean_df['playlist_genre'], kmeans_manager.labels)) if 'playlist_genre' in pipeline.clean_df.columns else 0.0
    nmi = float(normalized_mutual_info_score(pipeline.clean_df['playlist_genre'], kmeans_manager.labels)) if 'playlist_genre' in pipeline.clean_df.columns else 0.0

    return {
        "k": kmeans_manager.current_k,
        "features_used": pipeline.available_features,
        "features_count": len(pipeline.available_features),
        "inertia": round(float(kmeans_manager.kmeans.inertia_), 2),
        "silhouette_score": round(sil, 4),
        "elbow_curve": kmeans_manager.elbow_data,
        "silhouette_curve": kmeans_manager.silhouette_curve_data,
        "ari_vs_genre": round(ari, 4),
        "nmi_vs_genre": round(nmi, 4),
        "methodology": {
            "algorithm": "K-Means with Euclidean metric on Standardized features",
            "dimensionality_reduction": "Principal Component Analysis (PCA) for 2D visual projection",
            "feature_scaling": "StandardScaler (Z-score normalization)",
            "evaluation_principle": "Unsupervised internal cohesion (Inertia, Silhouette) + cautious external alignment (ARI, NMI vs human playlist categories)"
        }
    }

@app.get("/api/recommendations/search")
def search_tracks(query: str = Query("", min_length=0)):
    if recommender is None:
        raise HTTPException(status_code=500, detail="Recommender not ready")
    return recommender.search_tracks(query, limit=12)

class RecommendRequest(BaseModel):
    track_index: int
    top_n: int = 6
    genre_filter: Optional[str] = None
    strategy: str = "all" # "all" or "same_cluster"

@app.post("/api/recommendations")
def get_recommendations(req: RecommendRequest):
    if recommender is None:
        raise HTTPException(status_code=500, detail="Recommender not ready")
    try:
        return recommender.recommend(
            track_index=req.track_index,
            top_n=req.top_n,
            genre_filter=req.genre_filter,
            strategy=req.strategy
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/upload")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    content = await file.read()
    temp_path = os.path.join(BASE_DIR, "data", "uploaded_dataset.csv")
    with open(temp_path, "wb") as f:
        f.write(content)

    # Validate uploaded dataset has required columns
    test_df = pd.read_csv(temp_path, nrows=50)
    audio_present = [c for c in ['danceability', 'energy', 'valence'] if c in test_df.columns]
    if len(audio_present) < 2:
        os.remove(temp_path)
        raise HTTPException(status_code=400, detail="Uploaded CSV lacks required audio features (e.g. danceability, energy).")

    # Overwrite active dataset and reinitialize
    dest_path = DATA_FILE
    with open(dest_path, "wb") as f:
        f.write(content)

    init_app_state(dest_path)

    return {
        "status": "success",
        "message": f"Successfully loaded uploaded dataset with {len(pipeline.clean_df):,} tracks and {len(pipeline.available_features)} audio features."
    }

# Production / PythonAnywhere single-server frontend serving
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

FRONTEND_DIST = os.path.join(os.path.dirname(BASE_DIR), "frontend", "dist")
if os.path.exists(FRONTEND_DIST):
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="API route not found")
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))

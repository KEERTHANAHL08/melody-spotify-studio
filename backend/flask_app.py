import os
import io
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
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
FRONTEND_DIST = os.path.join(os.path.dirname(BASE_DIR), "frontend", "dist")

app = Flask(
    __name__,
    static_folder=os.path.join(FRONTEND_DIST, "assets") if os.path.exists(FRONTEND_DIST) else None,
    static_url_path="/assets"
)
CORS(app)

pipeline = None
kmeans_manager = None
recommender = None

def init_app_state(file_path: str = DATA_FILE):
    global pipeline, kmeans_manager, recommender
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Spotify dataset not found at {file_path}")

    pipeline = PreprocessingPipeline(file_path)
    clean_df = pipeline.load_and_process()
    scaled_features = pipeline.get_scaled_features()
    feature_names = pipeline.available_features

    kmeans_manager = KMeansManager(clean_df, scaled_features, feature_names)
    kmeans_manager.train(k=6)

    recommender = RecommenderEngine(clean_df, scaled_features, feature_names)

try:
    init_app_state()
except Exception as e:
    print(f"Flask init notice: {e}")

@app.route("/api/health", methods=["GET"])
def get_health():
    loaded = pipeline is not None and pipeline.clean_df is not None
    return jsonify({
        "status": "healthy",
        "dataset_loaded": loaded,
        "rows": len(pipeline.clean_df) if loaded else 0,
        "features": pipeline.available_features if loaded else []
    })

@app.route("/api/overview", methods=["GET"])
def get_overview():
    if pipeline is None or pipeline.clean_df is None or kmeans_manager is None:
        return jsonify({"detail": "Dataset not ready"}), 500

    df = pipeline.clean_df
    k = kmeans_manager.current_k
    return jsonify({
        "kpis": compute_overview_kpis(df, n_clusters=k),
        "genre_distribution": get_genre_distribution(df),
        "audio_feature_averages": get_audio_feature_averages(df, pipeline.available_features),
        "top_artists": get_top_artists(df, limit=10),
        "popularity_distribution": get_popularity_distribution(df, bins=10),
        "playlist_composition": get_playlist_composition(df, limit=8),
        "insights": generate_key_insights(df)
    })

@app.route("/api/dataset", methods=["GET"])
def get_dataset():
    if pipeline is None or pipeline.clean_df is None:
        return jsonify({"detail": "Dataset not ready"}), 500

    page = int(request.args.get("page", 1))
    page_size = int(request.args.get("page_size", 20))
    search = request.args.get("search", None)
    genre = request.args.get("genre", None)
    sort_by = request.args.get("sort_by", "track_popularity")
    sort_order = request.args.get("sort_order", "desc")
    min_pop = request.args.get("min_pop", None)
    max_pop = request.args.get("max_pop", None)

    df = pipeline.clean_df.copy()

    if search and search.strip():
        q = search.strip().lower()
        mask = (
            df['track_name'].str.lower().str.contains(q, na=False) |
            df['track_artist'].str.lower().str.contains(q, na=False) |
            df['playlist_name'].str.lower().str.contains(q, na=False)
        )
        df = df[mask]

    if genre and genre != "all" and 'playlist_genre' in df.columns:
        df = df[df['playlist_genre'] == genre]

    if min_pop is not None and 'track_popularity' in df.columns:
        df = df[df['track_popularity'] >= int(min_pop)]
    if max_pop is not None and 'track_popularity' in df.columns:
        df = df[df['track_popularity'] <= int(max_pop)]

    total_records = len(df)

    if sort_by and sort_by in df.columns:
        ascending = (sort_order.lower() == "asc")
        df = df.sort_values(by=sort_by, ascending=ascending)

    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    sliced = df.iloc[start_idx:end_idx]

    return jsonify({
        "page": page,
        "page_size": page_size,
        "total_records": total_records,
        "total_pages": int(np.ceil(total_records / page_size)),
        "data": sliced.to_dict(orient="records"),
        "columns": list(pipeline.clean_df.columns),
        "available_genres": sorted(list(pipeline.clean_df['playlist_genre'].unique())) if 'playlist_genre' in pipeline.clean_df.columns else []
    })

@app.route("/api/dataset/export", methods=["GET"])
def export_dataset():
    if pipeline is None or pipeline.clean_df is None:
        return jsonify({"detail": "Dataset not ready"}), 500

    stream = io.StringIO()
    pipeline.clean_df.to_csv(stream, index=False)
    mem = io.BytesIO(stream.getvalue().encode('utf-8'))
    return send_file(mem, mimetype="text/csv", as_attachment=True, download_name="spotify_cleaned_dataset.csv")

@app.route("/api/preprocessing", methods=["GET"])
def get_preprocessing_report():
    if pipeline is None:
        return jsonify({"detail": "Pipeline not initialized"}), 500
    return jsonify(pipeline.get_report())

@app.route("/api/insights", methods=["GET"])
def get_insights():
    if pipeline is None or pipeline.clean_df is None:
        return jsonify({"detail": "Dataset not ready"}), 500

    feature = request.args.get("feature", "danceability")
    group_by = request.args.get("group_by", "playlist_genre")
    x_feature = request.args.get("x_feature", "danceability")
    y_feature = request.args.get("y_feature", "energy")

    df = pipeline.clean_df
    return jsonify({
        "feature": feature,
        "histogram": get_feature_distribution_bins(df, feature=feature, bins=15),
        "boxplot": get_boxplot_data(df, feature=feature, group_by=group_by),
        "scatter": get_scatter_sample(df, x_feature=x_feature, y_feature=y_feature, sample_size=400),
        "available_features": pipeline.available_features,
        "groupings": ["playlist_genre", "cluster"] if "cluster" in df.columns else ["playlist_genre"]
    })

@app.route("/api/correlation", methods=["GET"])
def get_correlation():
    if pipeline is None or pipeline.clean_df is None:
        return jsonify({"detail": "Dataset not ready"}), 500

    method = request.args.get("method", "pearson")
    features = request.args.get("features", None)
    feat_list = features.split(",") if features else None
    return jsonify(compute_correlation_matrix(pipeline.clean_df, method=method, features=feat_list))

@app.route("/api/genres", methods=["GET"])
def get_genre_analysis():
    if pipeline is None or pipeline.clean_df is None:
        return jsonify({"detail": "Dataset not ready"}), 500

    df = pipeline.clean_df
    if 'playlist_genre' not in df.columns:
        return jsonify({"detail": "Playlist genre column missing"}), 400

    genres = request.args.get("genres", None)
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

    return jsonify({
        "available_genres": available,
        "selected_genres": selected_genres,
        "profiles": genre_profiles,
        "comparisons": comparisons
    })

@app.route("/api/clustering", methods=["GET"])
def get_clustering():
    if kmeans_manager is None:
        return jsonify({"detail": "Clustering manager not ready"}), 500

    return jsonify({
        "current_k": kmeans_manager.current_k,
        "inertia": round(float(kmeans_manager.kmeans.inertia_), 2) if kmeans_manager.kmeans else 0,
        "pca_sample": kmeans_manager.get_pca_scatter_sample(sample_size=800),
        "cluster_summaries": kmeans_manager._generate_cluster_summaries()
    })

@app.route("/api/clustering/train", methods=["POST"])
def train_clustering():
    if kmeans_manager is None:
        return jsonify({"detail": "Clustering manager not ready"}), 500

    data = request.get_json(silent=True) or {}
    k = int(data.get("k", 6))
    if k < 2 or k > 12:
        return jsonify({"detail": "Cluster count k must be between 2 and 12"}), 400

    return jsonify(kmeans_manager.train(k=k))

@app.route("/api/clustering/crosstab", methods=["GET"])
def get_crosstabs():
    if kmeans_manager is None:
        return jsonify({"detail": "Clustering manager not ready"}), 500
    return jsonify(kmeans_manager.get_crosstabs())

@app.route("/api/clustering/export", methods=["GET"])
def export_clusters():
    if pipeline is None or pipeline.clean_df is None:
        return jsonify({"detail": "Dataset not ready"}), 500

    stream = io.StringIO()
    cols_to_export = [c for c in ['track_id', 'track_name', 'track_artist', 'playlist_genre', 'playlist_name', 'cluster', 'track_popularity'] if c in pipeline.clean_df.columns]
    pipeline.clean_df[cols_to_export].to_csv(stream, index=False)
    mem = io.BytesIO(stream.getvalue().encode('utf-8'))
    return send_file(mem, mimetype="text/csv", as_attachment=True, download_name="spotify_cluster_assignments.csv")

@app.route("/api/evaluation", methods=["GET"])
def get_evaluation():
    if kmeans_manager is None:
        return jsonify({"detail": "Clustering manager not ready"}), 500

    if kmeans_manager.elbow_data is None:
        kmeans_manager.compute_elbow_and_silhouette(k_min=2, k_max=10)

    sample_size = min(1500, len(kmeans_manager.scaled_features))
    sample_indices = np.random.choice(len(kmeans_manager.scaled_features), size=sample_size, replace=False)
    sil = float(silhouette_score(kmeans_manager.scaled_features[sample_indices], kmeans_manager.labels[sample_indices]))

    ari = float(adjusted_rand_score(pipeline.clean_df['playlist_genre'], kmeans_manager.labels)) if 'playlist_genre' in pipeline.clean_df.columns else 0.0
    nmi = float(normalized_mutual_info_score(pipeline.clean_df['playlist_genre'], kmeans_manager.labels)) if 'playlist_genre' in pipeline.clean_df.columns else 0.0

    return jsonify({
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
    })

@app.route("/api/recommendations/search", methods=["GET"])
def search_tracks():
    if recommender is None:
        return jsonify({"detail": "Recommender not ready"}), 500
    q = request.args.get("query", "")
    return jsonify(recommender.search_tracks(q, limit=12))

@app.route("/api/recommendations", methods=["POST"])
def get_recommendations():
    if recommender is None:
        return jsonify({"detail": "Recommender not ready"}), 500

    data = request.get_json(silent=True) or {}
    track_index = data.get("track_index")
    top_n = int(data.get("top_n", 6))
    genre_filter = data.get("genre_filter", None)
    strategy = data.get("strategy", "all")

    if track_index is None:
        return jsonify({"detail": "track_index is required"}), 400

    try:
        return jsonify(recommender.recommend(
            track_index=int(track_index),
            top_n=top_n,
            genre_filter=genre_filter,
            strategy=strategy
        ))
    except Exception as e:
        return jsonify({"detail": str(e)}), 400

@app.route("/api/upload", methods=["POST"])
def upload_dataset():
    if 'file' not in request.files:
        return jsonify({"detail": "No file part"}), 400
    f = request.files['file']
    if not f.filename.endswith('.csv'):
        return jsonify({"detail": "Only CSV files are supported"}), 400

    dest_path = DATA_FILE
    f.save(dest_path)
    init_app_state(dest_path)

    return jsonify({
        "status": "success",
        "message": f"Successfully loaded uploaded dataset with {len(pipeline.clean_df):,} tracks and {len(pipeline.available_features)} audio features."
    })

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_spa(path):
    if path.startswith("api/"):
        return jsonify({"detail": "API endpoint not found"}), 404
    if path and os.path.exists(os.path.join(FRONTEND_DIST, path)):
        return send_from_directory(FRONTEND_DIST, path)
    return send_from_directory(FRONTEND_DIST, "index.html")

application = app

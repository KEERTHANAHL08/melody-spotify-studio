import pandas as pd
import numpy as np
from typing import Dict, Any, List

def compute_overview_kpis(df: pd.DataFrame, n_clusters: int = 6) -> Dict[str, Any]:
    total_tracks = int(len(df))
    unique_artists = int(df['track_artist'].nunique()) if 'track_artist' in df.columns else 0
    unique_playlists = int(df['playlist_name'].nunique()) if 'playlist_name' in df.columns else 0
    unique_genres = int(df['playlist_genre'].nunique()) if 'playlist_genre' in df.columns else 0
    avg_popularity = round(float(df['track_popularity'].mean()), 1) if 'track_popularity' in df.columns else 0.0
    avg_duration_min = round(float(df['duration_ms'].mean() / 60000.0), 2) if 'duration_ms' in df.columns else 0.0

    return {
        "total_tracks": total_tracks,
        "unique_artists": unique_artists,
        "unique_playlists": unique_playlists,
        "available_genres": unique_genres,
        "avg_popularity": avg_popularity,
        "avg_duration_minutes": avg_duration_min,
        "cluster_count": n_clusters
    }

def get_genre_distribution(df: pd.DataFrame) -> List[Dict[str, Any]]:
    if 'playlist_genre' not in df.columns:
        return []
    counts = df['playlist_genre'].value_counts()
    total = len(df)
    return [
        {"genre": str(genre), "count": int(count), "percentage": round(count / total * 100, 1)}
        for genre, count in counts.items()
    ]

def get_audio_feature_averages(df: pd.DataFrame, features: List[str]) -> List[Dict[str, Any]]:
    results = []
    # Normalized audio features that naturally reside in 0-1
    ratio_features = ['danceability', 'energy', 'speechiness', 'acousticness', 'instrumentalness', 'liveness', 'valence']
    for feat in ratio_features:
        if feat in df.columns:
            mean_val = float(df[feat].mean())
            std_val = float(df[feat].std())
            results.append({
                "feature": feat.capitalize(),
                "average": round(mean_val, 3),
                "std": round(std_val, 3)
            })
    return results

def get_top_artists(df: pd.DataFrame, limit: int = 10) -> List[Dict[str, Any]]:
    if 'track_artist' not in df.columns:
        return []
    top = df['track_artist'].value_counts().head(limit)
    res = []
    for artist, count in top.items():
        avg_pop = 0.0
        if 'track_popularity' in df.columns:
            avg_pop = round(float(df[df['track_artist'] == artist]['track_popularity'].mean()), 1)
        res.append({
            "artist": str(artist),
            "track_count": int(count),
            "avg_popularity": avg_pop
        })
    return res

def get_popularity_distribution(df: pd.DataFrame, bins: int = 10) -> List[Dict[str, Any]]:
    if 'track_popularity' not in df.columns:
        return []
    pops = df['track_popularity'].dropna().values
    counts, edges = np.histogram(pops, bins=bins, range=(0, 100))
    res = []
    for i in range(len(counts)):
        res.append({
            "bin": f"{int(edges[i])}-{int(edges[i+1])}",
            "range_start": int(edges[i]),
            "range_end": int(edges[i+1]),
            "count": int(counts[i])
        })
    return res

def get_playlist_composition(df: pd.DataFrame, limit: int = 8) -> List[Dict[str, Any]]:
    if 'playlist_name' not in df.columns:
        return []
    top = df['playlist_name'].value_counts().head(limit)
    return [
        {"playlist": str(p), "count": int(c)}
        for p, c in top.items()
    ]

def generate_key_insights(df: pd.DataFrame) -> List[Dict[str, str]]:
    insights = []

    # 1. Top genre
    if 'playlist_genre' in df.columns:
        top_genre = df['playlist_genre'].value_counts().index[0]
        top_genre_count = df['playlist_genre'].value_counts().iloc[0]
        top_genre_pct = round(top_genre_count / len(df) * 100, 1)
        insights.append({
            "category": "Genre Representation",
            "title": f"Most Prominent Genre: {top_genre.upper()}",
            "description": f"{top_genre.upper()} playlists lead the dataset with {top_genre_count:,} tracks ({top_genre_pct}% of total), followed closely by other diverse genres."
        })

    # 2. Top Artist
    if 'track_artist' in df.columns:
        top_artist = df['track_artist'].value_counts().index[0]
        artist_tracks = df['track_artist'].value_counts().iloc[0]
        insights.append({
            "category": "Artist Presence",
            "title": f"Top Catalog Artist: {top_artist}",
            "description": f"{top_artist} has the highest track representation in the catalog with {artist_tracks} curated songs."
        })

    # 3. Audio Characteristic
    if 'energy' in df.columns and 'danceability' in df.columns:
        mean_energy = round(float(df['energy'].mean()), 2)
        mean_dance = round(float(df['danceability'].mean()), 2)
        insights.append({
            "category": "Acoustic Dynamics",
            "title": "High Energy & Danceability Bias",
            "description": f"The catalog leans towards energetic, rhythmic selections, boasting an average danceability of {mean_dance} and energy of {mean_energy} on a 0–1 scale."
        })

    # 4. Valence / Mood
    if 'valence' in df.columns:
        mean_val = round(float(df['valence'].mean()), 2)
        mood_desc = "balanced between melancholic and cheerful" if 0.45 <= mean_val <= 0.55 else ("predominantly upbeat" if mean_val > 0.55 else "subdued and reflective")
        insights.append({
            "category": "Emotional Tone",
            "title": f"Musical Valence at {mean_val}",
            "description": f"Overall musical sentiment is {mood_desc}, indicating an even emotional distribution across playlist listeners."
        })

    # 5. Tempo & Rhythm
    if 'tempo' in df.columns:
        mean_tempo = round(float(df['tempo'].mean()), 1)
        insights.append({
            "category": "Rhythmic Pace",
            "title": f"Average Tempo: {mean_tempo} BPM",
            "description": f"The mean tempo aligns with standard club and modern radio pop tempos (~120–128 BPM)."
        })

    return insights

def get_feature_distribution_bins(df: pd.DataFrame, feature: str, bins: int = 15) -> List[Dict[str, Any]]:
    if feature not in df.columns:
        return []
    series = df[feature].dropna()
    min_val, max_val = float(series.min()), float(series.max())
    counts, edges = np.histogram(series.values, bins=bins)
    res = []
    for i in range(len(counts)):
        mid = (edges[i] + edges[i+1]) / 2.0
        label = f"{round(edges[i], 2)} - {round(edges[i+1], 2)}"
        res.append({
            "bin": label,
            "midpoint": round(mid, 3),
            "count": int(counts[i])
        })
    return res

def get_boxplot_data(df: pd.DataFrame, feature: str, group_by: str = 'playlist_genre') -> List[Dict[str, Any]]:
    if feature not in df.columns or group_by not in df.columns:
        return []
    res = []
    groups = df[group_by].dropna().unique()
    for grp in sorted(groups):
        subset = df[df[group_by] == grp][feature].dropna().values
        if len(subset) == 0:
            continue
        q1 = float(np.percentile(subset, 25))
        median = float(np.median(subset))
        q3 = float(np.percentile(subset, 75))
        iqr = q3 - q1
        lower_whisker = float(max(np.min(subset), q1 - 1.5 * iqr))
        upper_whisker = float(min(np.max(subset), q3 + 1.5 * iqr))
        mean = float(np.mean(subset))
        res.append({
            "group": str(grp),
            "min": round(lower_whisker, 3),
            "q1": round(q1, 3),
            "median": round(median, 3),
            "q3": round(q3, 3),
            "max": round(upper_whisker, 3),
            "mean": round(mean, 3),
            "count": len(subset)
        })
    return res

def get_scatter_sample(df: pd.DataFrame, x_feature: str, y_feature: str, sample_size: int = 600) -> List[Dict[str, Any]]:
    if x_feature not in df.columns or y_feature not in df.columns:
        return []
    cols = list(dict.fromkeys(['track_name', 'track_artist', 'playlist_genre', x_feature, y_feature]))
    sub_df = df[cols].dropna()
    if len(sub_df) > sample_size:
        sub_df = sub_df.sample(n=sample_size, random_state=42)
    res = []
    for _, row in sub_df.iterrows():
        res.append({
            "name": str(row['track_name']),
            "artist": str(row['track_artist']),
            "genre": str(row.get('playlist_genre', 'Unknown')),
            "x": round(float(row[x_feature]), 3),
            "y": round(float(row[y_feature]), 3)
        })
    return res

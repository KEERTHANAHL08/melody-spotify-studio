import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score, adjusted_rand_score, normalized_mutual_info_score
from typing import Dict, Any, List, Optional

PASTEL_CLUSTER_PALETTES = [
    "#B8A6E8", # Lavender
    "#F7DCE8", # Pastel pink
    "#FFE7D6", # Pastel peach
    "#DDF3E4", # Pastel mint
    "#DDEBFA", # Pastel blue
    "#FFF1C9", # Pastel yellow
    "#E2D4F0", # Soft lilac
    "#FAD4D8", # Rose pastel
    "#D5E8D4", # Sage pastel
    "#E1D5E7", # Muted purple
    "#FFE6CC", # Apricot
    "#DAE8FC"  # Powder blue
]

class KMeansManager:
    def __init__(self, df: pd.DataFrame, scaled_features: np.ndarray, feature_names: List[str]):
        self.df = df
        self.scaled_features = scaled_features
        self.feature_names = feature_names
        self.current_k: int = 6
        self.kmeans: Optional[KMeans] = None
        self.labels: Optional[np.ndarray] = None
        self.pca_model: Optional[PCA] = None
        self.pca_coords: Optional[np.ndarray] = None
        self.elbow_data: Optional[List[Dict[str, Any]]] = None
        self.silhouette_curve_data: Optional[List[Dict[str, Any]]] = None

    def train(self, k: int = 6) -> Dict[str, Any]:
        self.current_k = k
        self.kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
        self.labels = self.kmeans.fit_predict(self.scaled_features)
        self.df['cluster'] = self.labels

        # Compute sample silhouette score for responsiveness
        sample_size = min(4000, len(self.scaled_features))
        np.random.seed(42)
        sample_indices = np.random.choice(len(self.scaled_features), size=sample_size, replace=False)
        sil_score = float(silhouette_score(self.scaled_features[sample_indices], self.labels[sample_indices]))

        # Fit 2D PCA for visual mapping
        self.pca_model = PCA(n_components=2, random_state=42)
        self.pca_coords = self.pca_model.fit_transform(self.scaled_features)
        var_ratio = [round(float(v), 3) for v in self.pca_model.explained_variance_ratio_]

        # Calculate cluster statistics and profiles
        cluster_summaries = self._generate_cluster_summaries()

        # Academic supervised comparisons against playlist_genre
        ari = 0.0
        nmi = 0.0
        if 'playlist_genre' in self.df.columns:
            ari = float(adjusted_rand_score(self.df['playlist_genre'], self.labels))
            nmi = float(normalized_mutual_info_score(self.df['playlist_genre'], self.labels))

        return {
            "k": k,
            "inertia": round(float(self.kmeans.inertia_), 2),
            "silhouette_score": round(sil_score, 4),
            "pca_explained_variance": var_ratio,
            "cluster_count": k,
            "total_tracks": len(self.df),
            "cluster_summaries": cluster_summaries,
            "ari_vs_genre": round(ari, 4),
            "nmi_vs_genre": round(nmi, 4),
            "evaluation_note": (
                "K-Means partitions tracks based on objective acoustic signals (e.g. tempo, acousticness, loudness). "
                "Because human playlist genres are cultural and sociological categories containing diverse track types, "
                "a low ARI/NMI is methodologically expected and highlights distinct acoustic sub-groupings within genres."
            )
        }

    def _generate_cluster_summaries(self) -> List[Dict[str, Any]]:
        global_means = self.df[self.feature_names].mean()
        summaries = []

        for cid in range(self.current_k):
            cluster_subset = self.df[self.df['cluster'] == cid]
            count = len(cluster_subset)
            pct = round(count / len(self.df) * 100, 1)
            color = PASTEL_CLUSTER_PALETTES[cid % len(PASTEL_CLUSTER_PALETTES)]

            c_means = cluster_subset[self.feature_names].mean()

            # Find notable deviations (+/- %)
            deviations = []
            for feat in self.feature_names:
                g_val = global_means[feat]
                c_val = c_means[feat]
                if abs(g_val) > 1e-4:
                    pct_diff = round(((c_val - g_val) / abs(g_val)) * 100, 1)
                else:
                    pct_diff = 0.0
                deviations.append({
                    "feature": feat,
                    "cluster_mean": round(float(c_val), 3),
                    "global_mean": round(float(g_val), 3),
                    "deviation_pct": pct_diff
                })

            # Identify top distinct traits
            sorted_by_impact = sorted(deviations, key=lambda d: abs(d['deviation_pct']), reverse=True)
            top_traits = sorted_by_impact[:3]

            # Generate objective, cautious description
            trait_strs = []
            for t in top_traits:
                direction = "higher" if t['deviation_pct'] > 0 else "lower"
                trait_strs.append(f"{abs(t['deviation_pct'])}% {direction} {t['feature']}")
            description = (
                f"Cluster {cid} contains {count:,} tracks ({pct}%). Characterized by "
                f"{', '.join(trait_strs)} compared to the catalog-wide benchmark."
            )

            # Top genres and artists in this cluster
            top_genres = []
            if 'playlist_genre' in cluster_subset.columns:
                top_genres = [
                    {"genre": g, "count": int(c), "pct": round(c / count * 100, 1)}
                    for g, c in cluster_subset['playlist_genre'].value_counts().head(4).items()
                ]

            top_artists = []
            if 'track_artist' in cluster_subset.columns:
                top_artists = [
                    {"artist": a, "count": int(c)}
                    for a, c in cluster_subset['track_artist'].value_counts().head(4).items()
                ]

            summaries.append({
                "cluster_id": cid,
                "label": f"Cluster {cid}",
                "count": count,
                "percentage": pct,
                "color": color,
                "description": description,
                "deviations": deviations,
                "top_traits": top_traits,
                "top_genres": top_genres,
                "top_artists": top_artists
            })

        return summaries

    def get_pca_scatter_sample(self, sample_size: int = 1000) -> List[Dict[str, Any]]:
        if self.pca_coords is None:
            return []
        n = len(self.df)
        if n > sample_size:
            np.random.seed(42)
            indices = np.random.choice(n, size=sample_size, replace=False)
        else:
            indices = np.arange(n)

        results = []
        for idx in indices:
            row = self.df.iloc[idx]
            cid = int(self.labels[idx])
            results.append({
                "id": str(row.get('track_id', idx)),
                "name": str(row.get('track_name', 'Unknown Track')),
                "artist": str(row.get('track_artist', 'Unknown Artist')),
                "genre": str(row.get('playlist_genre', 'Unknown')),
                "cluster": cid,
                "cluster_label": f"Cluster {cid}",
                "color": PASTEL_CLUSTER_PALETTES[cid % len(PASTEL_CLUSTER_PALETTES)],
                "x": round(float(self.pca_coords[idx, 0]), 3),
                "y": round(float(self.pca_coords[idx, 1]), 3),
                "danceability": round(float(row.get('danceability', 0)), 3),
                "energy": round(float(row.get('energy', 0)), 3),
                "valence": round(float(row.get('valence', 0)), 3),
                "tempo": round(float(row.get('tempo', 0)), 1)
            })
        return results

    def compute_elbow_and_silhouette(self, k_min: int = 2, k_max: int = 10) -> Dict[str, Any]:
        elbow = []
        sil_curve = []
        sample_size = min(2500, len(self.scaled_features))
        np.random.seed(42)
        sample_indices = np.random.choice(len(self.scaled_features), size=sample_size, replace=False)
        sample_X = self.scaled_features[sample_indices]
        scale_factor = len(self.scaled_features) / float(sample_size)

        for k in range(k_min, k_max + 1):
            km = KMeans(n_clusters=k, random_state=42, n_init=3)
            preds_sample = km.fit_predict(sample_X)
            elbow.append({
                "k": k,
                "inertia": round(float(km.inertia_ * scale_factor), 1)
            })
            s = float(silhouette_score(sample_X, preds_sample))
            sil_curve.append({
                "k": k,
                "silhouette": round(s, 4)
            })

        self.elbow_data = elbow
        self.silhouette_curve_data = sil_curve
        return {
            "elbow_curve": elbow,
            "silhouette_curve": sil_curve
        }

    def get_crosstabs(self) -> Dict[str, Any]:
        if 'cluster' not in self.df.columns:
            return {}

        res = {}
        # 1. Cluster vs playlist_genre
        if 'playlist_genre' in self.df.columns:
            ct = pd.crosstab(self.df['cluster'], self.df['playlist_genre'])
            genres = list(ct.columns)
            table_data = []
            for cid in sorted(self.df['cluster'].unique()):
                row_dict = {"cluster": f"Cluster {cid}"}
                for g in genres:
                    row_dict[g] = int(ct.loc[cid, g])
                table_data.append(row_dict)
            res["cluster_vs_genre"] = {
                "genres": genres,
                "data": table_data
            }

        # 2. Cluster vs top playlist names
        if 'playlist_name' in self.df.columns:
            top_playlists = self.df['playlist_name'].value_counts().head(8).index.tolist()
            filtered = self.df[self.df['playlist_name'].isin(top_playlists)]
            ct_p = pd.crosstab(filtered['cluster'], filtered['playlist_name'])
            p_data = []
            for cid in sorted(self.df['cluster'].unique()):
                row_dict = {"cluster": f"Cluster {cid}"}
                for p in top_playlists:
                    row_dict[p] = int(ct_p.loc[cid, p]) if cid in ct_p.index and p in ct_p.columns else 0
                p_data.append(row_dict)
            res["cluster_vs_playlist"] = {
                "playlists": top_playlists,
                "data": p_data
            }

        return res

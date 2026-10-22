import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from typing import Dict, Any, List, Optional

class RecommenderEngine:
    def __init__(self, df: pd.DataFrame, scaled_features: np.ndarray, feature_names: List[str]):
        self.df = df
        self.scaled_features = scaled_features
        self.feature_names = feature_names

    def search_tracks(self, query: str, limit: int = 15) -> List[Dict[str, Any]]:
        if not query or len(query.strip()) < 1:
            # Return top popular sample tracks
            sub = self.df.sort_values(by='track_popularity', ascending=False).drop_duplicates(subset=['track_name', 'track_artist']).head(limit)
        else:
            q = query.strip().lower()
            mask = (
                self.df['track_name'].str.lower().str.contains(q, na=False) |
                self.df['track_artist'].str.lower().str.contains(q, na=False)
            )
            sub = self.df[mask].drop_duplicates(subset=['track_name', 'track_artist']).head(limit)

        results = []
        for idx, row in sub.iterrows():
            results.append({
                "index": int(idx),
                "track_id": str(row.get('track_id', idx)),
                "track_name": str(row['track_name']),
                "track_artist": str(row['track_artist']),
                "playlist_genre": str(row.get('playlist_genre', 'Unknown')),
                "playlist_name": str(row.get('playlist_name', 'Unknown')),
                "track_popularity": int(row.get('track_popularity', 0)),
                "cluster": int(row.get('cluster', 0))
            })
        return results

    def recommend(
        self,
        track_index: int,
        top_n: int = 6,
        genre_filter: Optional[str] = None,
        strategy: str = "all" # "all" (pure similarity) or "same_cluster"
    ) -> Dict[str, Any]:
        if track_index < 0 or track_index >= len(self.df):
            raise IndexError("Track index out of bounds")

        target_row = self.df.iloc[track_index]
        target_vec = self.scaled_features[track_index].reshape(1, -1)
        target_cluster = int(target_row.get('cluster', 0))

        # Candidate indices
        candidate_indices = np.arange(len(self.df))

        # Exclude exact same track (name & artist)
        t_name = str(target_row['track_name']).lower()
        t_artist = str(target_row['track_artist']).lower()

        # Apply strategy filter
        if strategy == "same_cluster" and 'cluster' in self.df.columns:
            candidate_indices = candidate_indices[self.df['cluster'].values == target_cluster]

        # Apply genre filter if requested
        if genre_filter and genre_filter != "all" and 'playlist_genre' in self.df.columns:
            candidate_indices = candidate_indices[self.df.iloc[candidate_indices]['playlist_genre'].values == genre_filter]

        if len(candidate_indices) == 0:
            candidate_indices = np.arange(len(self.df))

        # Compute cosine similarity
        candidate_vecs = self.scaled_features[candidate_indices]
        sim_scores = cosine_similarity(target_vec, candidate_vecs)[0]

        # Sort descending
        sorted_order = np.argsort(sim_scores)[::-1]

        recommendations = []
        seen_songs = {f"{t_name}::{t_artist}"}

        for order_idx in sorted_order:
            orig_idx = candidate_indices[order_idx]
            cand_row = self.df.iloc[orig_idx]
            cand_name = str(cand_row['track_name']).lower()
            cand_artist = str(cand_row['track_artist']).lower()
            key = f"{cand_name}::{cand_artist}"

            if key in seen_songs:
                continue
            seen_songs.add(key)

            # Similarity percentage normalized roughly from [-1, 1] to [0, 100]
            raw_sim = float(sim_scores[order_idx])
            sim_pct = round(max(0.0, min(100.0, (raw_sim + 1.0) / 2.0 * 100.0)), 1)

            # Compute audio feature alignment & reasons
            reasons = self._generate_recommendation_reasons(target_row, cand_row)

            # Feature radar comparison
            comparison_features = ['danceability', 'energy', 'speechiness', 'acousticness', 'valence']
            feature_comparison = [
                {
                    "feature": f.capitalize(),
                    "selected_track": round(float(target_row.get(f, 0)), 3),
                    "recommended_track": round(float(cand_row.get(f, 0)), 3)
                }
                for f in comparison_features if f in self.df.columns
            ]

            recommendations.append({
                "index": int(orig_idx),
                "track_id": str(cand_row.get('track_id', orig_idx)),
                "track_name": str(cand_row['track_name']),
                "track_artist": str(cand_row['track_artist']),
                "playlist_genre": str(cand_row.get('playlist_genre', 'Unknown')),
                "playlist_name": str(cand_row.get('playlist_name', 'Unknown')),
                "track_popularity": int(cand_row.get('track_popularity', 0)),
                "cluster": int(cand_row.get('cluster', 0)),
                "similarity_score": round(raw_sim, 4),
                "similarity_percentage": sim_pct,
                "reasons": reasons,
                "feature_comparison": feature_comparison
            })

            if len(recommendations) >= top_n:
                break

        # Selected track summary
        target_summary = {
            "index": track_index,
            "track_id": str(target_row.get('track_id', track_index)),
            "track_name": str(target_row['track_name']),
            "track_artist": str(target_row['track_artist']),
            "playlist_genre": str(target_row.get('playlist_genre', 'Unknown')),
            "playlist_name": str(target_row.get('playlist_name', 'Unknown')),
            "track_popularity": int(target_row.get('track_popularity', 0)),
            "cluster": target_cluster,
            "features": {
                f: round(float(target_row.get(f, 0)), 3)
                for f in self.feature_names if f in target_row
            }
        }

        return {
            "selected_track": target_summary,
            "recommendations": recommendations,
            "strategy": strategy,
            "genre_filter": genre_filter or "all",
            "total_candidates_analyzed": len(candidate_indices)
        }

    def _generate_recommendation_reasons(self, target: pd.Series, candidate: pd.Series) -> List[str]:
        reasons = []

        # Tempo match
        if 'tempo' in target and 'tempo' in candidate:
            diff_bpm = abs(float(target['tempo']) - float(candidate['tempo']))
            if diff_bpm <= 5.0:
                reasons.append(f"Near-identical tempo match (Δ {diff_bpm:.1f} BPM)")
            elif diff_bpm <= 12.0:
                reasons.append(f"Harmonious rhythm and pace (Δ {diff_bpm:.1f} BPM)")

        # Energy & Danceability
        if 'energy' in target and 'energy' in candidate:
            diff_energy = abs(float(target['energy']) - float(candidate['energy']))
            if diff_energy <= 0.08:
                level = "high" if float(target['energy']) > 0.65 else "mellow"
                reasons.append(f"Shared {level} acoustic energy level")

        if 'danceability' in target and 'danceability' in candidate:
            diff_dance = abs(float(target['danceability']) - float(candidate['danceability']))
            if diff_dance <= 0.08:
                reasons.append("Closely matched groove and danceability structure")

        # Valence / Mood
        if 'valence' in target and 'valence' in candidate:
            diff_val = abs(float(target['valence']) - float(candidate['valence']))
            if diff_val <= 0.10:
                reasons.append("Comparable emotional mood and tonal valence")

        # Acousticness
        if 'acousticness' in target and 'acousticness' in candidate:
            diff_ac = abs(float(target['acousticness']) - float(candidate['acousticness']))
            if diff_ac <= 0.10:
                style = "organic acoustic" if float(target['acousticness']) > 0.5 else "electronic/studio"
                reasons.append(f"Similar {style} production timbre")

        if len(reasons) == 0:
            reasons.append("High overall vector proximity across multiple normalized audio dimensions")

        return reasons[:3]

import pandas as pd
import numpy as np
from typing import Dict, Any, List

DEFAULT_CORRELATION_FEATURES = [
    'danceability', 'energy', 'loudness', 'speechiness',
    'acousticness', 'instrumentalness', 'liveness', 'valence', 'tempo'
]

def compute_correlation_matrix(df: pd.DataFrame, method: str = 'pearson', features: List[str] = None) -> Dict[str, Any]:
    if features is None or len(features) < 2:
        features = [f for f in DEFAULT_CORRELATION_FEATURES if f in df.columns]
    else:
        features = [f for f in features if f in df.columns]

    corr_df = df[features].corr(method=method)

    # Format matrix as nodes/links or 2D grid
    grid = []
    pairs = []

    for i, row_feat in enumerate(features):
        row_data = {"feature": row_feat}
        for j, col_feat in enumerate(features):
            val = round(float(corr_df.loc[row_feat, col_feat]), 3)
            row_data[col_feat] = val
            if i < j:
                pairs.append({
                    "feat1": row_feat,
                    "feat2": col_feat,
                    "value": val,
                    "abs_value": abs(val)
                })
        grid.append(row_data)

    # Sort pairs by absolute correlation strength
    pairs_sorted = sorted(pairs, key=lambda x: x['abs_value'], reverse=True)
    top_positive = [p for p in pairs_sorted if p['value'] > 0][:5]
    top_negative = [p for p in pairs_sorted if p['value'] < 0][:5]

    def build_narrative(p, direction):
        f1, f2, v = p['feat1'], p['feat2'], p['value']
        strength = "Very strong" if abs(v) >= 0.7 else ("Moderate" if abs(v) >= 0.4 else "Subtle")
        if direction == 'positive':
            return (
                f"{strength} positive association between {f1.capitalize()} and {f2.capitalize()} (r = +{v:.2f}). "
                f"As {f1} increases in a track, {f2} consistently trends upward. "
                "Note: Correlation indicates joint variation, not physical causation."
            )
        else:
            return (
                f"{strength} inverse relationship between {f1.capitalize()} and {f2.capitalize()} (r = {v:.2f}). "
                f"Tracks with higher {f1} typically exhibit substantially lower {f2}."
            )

    narratives = {
        "strongest_positive": [
            {"pair": f"{p['feat1']} & {p['feat2']}", "r": p['value'], "explanation": build_narrative(p, 'positive')}
            for p in top_positive
        ],
        "strongest_negative": [
            {"pair": f"{p['feat1']} & {p['feat2']}", "r": p['value'], "explanation": build_narrative(p, 'negative')}
            for p in top_negative
        ],
        "academic_note": "Pearson evaluates linear relationships; Spearman assesses monotonic rank relationships. Neither establishes directional causation."
    }

    return {
        "method": method,
        "features": features,
        "matrix": grid,
        "narratives": narratives
    }

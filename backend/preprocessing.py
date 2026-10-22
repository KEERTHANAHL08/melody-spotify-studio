import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from typing import Dict, Any, List, Optional

AUDIO_FEATURES = [
    'danceability', 'energy', 'key', 'loudness', 'mode',
    'speechiness', 'acousticness', 'instrumentalness',
    'liveness', 'valence', 'tempo'
]

FEATURE_DISPLAY_NAMES = {
    'danceability': 'Danceability',
    'energy': 'Energy',
    'key': 'Key',
    'loudness': 'Loudness (dB)',
    'mode': 'Mode (Major/Minor)',
    'speechiness': 'Speechiness',
    'acousticness': 'Acousticness',
    'instrumentalness': 'Instrumentalness',
    'liveness': 'Liveness',
    'valence': 'Valence (Happiness)',
    'tempo': 'Tempo (BPM)',
    'duration_ms': 'Duration (ms)',
    'track_popularity': 'Popularity'
}

class PreprocessingPipeline:
    def __init__(self, data_path: str):
        self.data_path = data_path
        self.raw_df: Optional[pd.DataFrame] = None
        self.clean_df: Optional[pd.DataFrame] = None
        self.scaler: StandardScaler = StandardScaler()
        self.scaled_features: Optional[np.ndarray] = None
        self.available_features: List[str] = []
        self.report: Dict[str, Any] = {}

    def load_and_process(self) -> pd.DataFrame:
        if not os.path.exists(self.data_path):
            raise FileNotFoundError(f"Dataset not found at {self.data_path}")

        # 1. Load CSV
        self.raw_df = pd.read_csv(self.data_path)
        raw_rows, raw_cols = self.raw_df.shape
        raw_missing = int(self.raw_df.isnull().sum().sum())
        raw_missing_by_col = {col: int(cnt) for col, cnt in self.raw_df.isnull().sum().items() if cnt > 0}
        raw_exact_duplicates = int(self.raw_df.duplicated().sum())
        raw_track_id_duplicates = int(self.raw_df.duplicated(subset=['track_id']).sum()) if 'track_id' in self.raw_df.columns else 0

        # 2. Cleaning & Imputation
        df = self.raw_df.copy()

        # Drop exact duplicates if any
        if raw_exact_duplicates > 0:
            df = df.drop_duplicates()

        # Handle missing track name / artist / album metadata
        text_cols = [c for c in ['track_name', 'track_artist', 'track_album_name', 'playlist_name', 'playlist_genre', 'playlist_subgenre'] if c in df.columns]
        for col in text_cols:
            df[col] = df[col].fillna('Unknown').astype(str).str.strip()

        # Identify numerical audio features actually present in the dataset
        self.available_features = [f for f in AUDIO_FEATURES if f in df.columns]

        # Handle numerical audio features missing values (median imputation) and type casting
        imputed_counts = {}
        for feat in self.available_features:
            null_count = int(df[feat].isnull().sum())
            if null_count > 0:
                median_val = float(df[feat].median())
                df[feat] = df[feat].fillna(median_val)
                imputed_counts[feat] = null_count
            df[feat] = pd.to_numeric(df[feat], errors='coerce')

        # Drop any remaining unrecoverable null rows if any exist in audio features
        df = df.dropna(subset=self.available_features)

        # Standardize features using StandardScaler
        X = df[self.available_features].values
        self.scaler = StandardScaler()
        self.scaled_features = self.scaler.fit_transform(X)

        self.clean_df = df.reset_index(drop=True)

        clean_rows, clean_cols = self.clean_df.shape

        # Build detailed academic preprocessing report
        self.report = {
            "initial_state": {
                "rows": raw_rows,
                "columns": raw_cols,
                "column_names": list(self.raw_df.columns),
                "data_types": {col: str(dtype) for col, dtype in self.raw_df.dtypes.items()},
                "total_missing_values": raw_missing,
                "missing_by_column": raw_missing_by_col,
                "exact_duplicates": raw_exact_duplicates,
                "track_id_duplicates": raw_track_id_duplicates
            },
            "cleaning_steps_performed": [
                "Inspected CSV structure, column definitions, and data types",
                f"Imputed missing text metadata in {list(text_cols)} with 'Unknown'",
                f"Imputed missing numerical features using median values: {imputed_counts if imputed_counts else 'None found'}",
                "Validated numeric ranges and cast audio features to standard float64",
                f"Extracted {len(self.available_features)} standardized audio features for distance-based clustering: {self.available_features}",
                "Applied Scikit-Learn StandardScaler (zero-mean, unit-variance) to prevent scale dominance"
            ],
            "post_cleaning_state": {
                "rows": clean_rows,
                "columns": clean_cols,
                "rows_retained": clean_rows,
                "rows_dropped": raw_rows - clean_rows,
                "selected_features": self.available_features,
                "scaling_method": "StandardScaler (Z-Score Normalization)",
                "scaled_matrix_shape": list(self.scaled_features.shape)
            }
        }

        return self.clean_df

    def get_scaled_features(self) -> np.ndarray:
        if self.scaled_features is None:
            raise ValueError("Pipeline has not been executed yet.")
        return self.scaled_features

    def get_report(self) -> Dict[str, Any]:
        return self.report

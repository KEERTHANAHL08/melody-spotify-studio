export interface HealthResponse {
  status: string;
  dataset_loaded: boolean;
  rows: number;
  features: string[];
}

export interface KPIOverview {
  total_tracks: number;
  unique_artists: number;
  unique_playlists: number;
  available_genres: number;
  avg_popularity: number;
  avg_duration_minutes: number;
  cluster_count: number;
}

export interface GenreDistributionItem {
  genre: string;
  count: number;
  percentage: number;
}

export interface FeatureAverageItem {
  feature: string;
  average: number;
  std: number;
}

export interface TopArtistItem {
  artist: string;
  track_count: number;
  avg_popularity: number;
}

export interface PopularityBinItem {
  bin: string;
  range_start: number;
  range_end: number;
  count: number;
}

export interface PlaylistCompositionItem {
  playlist: string;
  count: number;
}

export interface InsightItem {
  category: string;
  title: string;
  description: string;
}

export interface OverviewData {
  kpis: KPIOverview;
  genre_distribution: GenreDistributionItem[];
  audio_feature_averages: FeatureAverageItem[];
  top_artists: TopArtistItem[];
  popularity_distribution: PopularityBinItem[];
  playlist_composition: PlaylistCompositionItem[];
  insights: InsightItem[];
}

export interface TrackRecord {
  track_id: string;
  track_name: string;
  track_artist: string;
  track_popularity: number;
  playlist_name: string;
  playlist_genre: string;
  playlist_subgenre?: string;
  danceability: number;
  energy: number;
  loudness: number;
  valence: number;
  tempo: number;
  acousticness: number;
  speechiness: number;
  cluster?: number;
  [key: string]: any;
}

export interface DatasetResponse {
  page: number;
  page_size: number;
  total_records: number;
  total_pages: number;
  data: TrackRecord[];
  columns: string[];
  available_genres: string[];
}

export interface PreprocessingReport {
  initial_state: {
    rows: number;
    columns: number;
    column_names: string[];
    data_types: Record<string, string>;
    total_missing_values: number;
    missing_by_column: Record<string, number>;
    exact_duplicates: number;
    track_id_duplicates: number;
  };
  cleaning_steps_performed: string[];
  post_cleaning_state: {
    rows: number;
    columns: number;
    rows_retained: number;
    rows_dropped: number;
    selected_features: string[];
    scaling_method: string;
    scaled_matrix_shape: number[];
  };
}

export interface CorrelationNarrative {
  pair: string;
  r: number;
  explanation: string;
}

export interface CorrelationData {
  method: string;
  features: string[];
  matrix: Record<string, any>[];
  narratives: {
    strongest_positive: CorrelationNarrative[];
    strongest_negative: CorrelationNarrative[];
    academic_note: string;
  };
}

export interface ClusterSummary {
  cluster_id: number;
  label: string;
  count: number;
  percentage: number;
  color: string;
  description: string;
  deviations: {
    feature: string;
    cluster_mean: number;
    global_mean: number;
    deviation_pct: number;
  }[];
  top_traits: {
    feature: string;
    cluster_mean: number;
    global_mean: number;
    deviation_pct: number;
  }[];
  top_genres: {
    genre: string;
    count: number;
    pct: number;
  }[];
  top_artists: {
    artist: string;
    count: number;
  }[];
}

export interface ClusteringResponse {
  current_k: number;
  inertia: number;
  pca_sample: {
    id: string;
    name: string;
    artist: string;
    genre: string;
    cluster: number;
    cluster_label: string;
    color: string;
    x: number;
    y: number;
    danceability: number;
    energy: number;
    valence: number;
    tempo: number;
  }[];
  cluster_summaries: ClusterSummary[];
}

export interface RecommendationItem {
  index: number;
  track_id: string;
  track_name: string;
  track_artist: string;
  playlist_genre: string;
  playlist_name: string;
  track_popularity: number;
  cluster: number;
  similarity_score: number;
  similarity_percentage: number;
  reasons: string[];
  feature_comparison: {
    feature: string;
    selected_track: number;
    recommended_track: number;
  }[];
}

export interface RecommendationResponse {
  selected_track: {
    index: number;
    track_id: string;
    track_name: string;
    track_artist: string;
    playlist_genre: string;
    playlist_name: string;
    track_popularity: number;
    cluster: number;
    features: Record<string, number>;
  };
  recommendations: RecommendationItem[];
  strategy: string;
  genre_filter: string;
  total_candidates_analyzed: number;
}

export interface EvaluationData {
  k: number;
  features_used: string[];
  features_count: number;
  inertia: number;
  silhouette_score: number;
  elbow_curve: { k: number; inertia: number }[];
  silhouette_curve: { k: number; silhouette: number }[];
  ari_vs_genre: number;
  nmi_vs_genre: number;
  methodology: {
    algorithm: string;
    dimensionality_reduction: string;
    feature_scaling: string;
    evaluation_principle: string;
  };
}

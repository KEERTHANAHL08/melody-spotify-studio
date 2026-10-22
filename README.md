# Melody — Spotify Genre Studio

> **An Academic Machine Learning & Audio Analytics Web Application**  
> *Unsupervised Genre Segmentation, PCA Dimensionality Reduction & Multidimensional Similarity Recommendations*

---

## 🎵 1. Project Overview

**Melody — Spotify Genre Studio** is a full-stack, data-science web application designed to analyze Spotify songs and playlist datasets, uncover acoustic distributions, discover natural musical clusters using unsupervised machine learning (**K-Means** with **StandardScaler**), and provide similarity-driven song recommendations via multidimensional cosine proximity.

Built with a light pastel aesthetic (`#FAF9FF` background, `#FFFFFF` rounded cards, soft lavender `#B8A6E8`, and gentle lilac `#E9E1FA`), the interface delivers a visual design coupled with empirical data science.

---

## 🎨 2. Visual Aesthetic & Design System

The application strictly implements the requested modern light pastel palette:
- **Background:** `#FAF9FF` (Lightest tint of lavender-white)
- **Cards & Surfaces:** `#FFFFFF` with 20px rounded corners (`rounded-3xl`), soft borders (`#EEEAF5`), and subtle elevation
- **Primary Brand Accents:** Lavender (`#B8A6E8`), Soft Lilac (`#E9E1FA`), Purple Accent (`#8B75C9`)
- **Pastel Chart Palette:** Soft Mint (`#DDF3E4`), Pastel Pink (`#F7DCE8`), Peach (`#FFE7D6`), Powder Blue (`#DDEBFA`), Soft Yellow (`#FFF1C9`)
- **Typography:** Modern Plus Jakarta Sans / Inter hierarchy with comfortable whitespace

---

## 🔬 3. Machine Learning & Data Science Methodology

1. **Dataset Ingestion & Inspection:**
   - 32,833 real Spotify playlist tracks across 23 continuous and categorical dimensions (`danceability`, `energy`, `loudness`, `valence`, `tempo`, `speechiness`, `acousticness`, `instrumentalness`, `liveness`, `key`, `mode`, etc.).
2. **Preprocessing & Cleaning:**
   - Handled missing text metadata and verified duplicate records.
   - Preserved track and artist identifiers while isolating 11 normalized audio features for distance computations.
   - Applied **`StandardScaler`** (Z-score normalization) to prevent higher-magnitude attributes (e.g., tempo ~120 BPM, loudness ~-6 dB) from artificially dominating Euclidean distance metrics.
3. **Exploratory Data Analysis (EDA):**
   - Empirical histograms (15 equal bins), box plots (Q1, median, Q3, IQR whiskers), and bivariate interactive scatter plots.
4. **Correlation Analysis:**
   - Pearson (linear) and Spearman (rank monotonic) correlation matrices with pastel diverging heatmaps and automated narrative deductions.
5. **K-Means Clustering:**
   - Tested cluster counts $K=2$ to $10$. Computed within-cluster sum of squares (**Inertia**) for the Elbow method and **Silhouette coefficients** to validate separation.
   - Projected 11-dimensional audio vectors onto 2D space using **Principal Component Analysis (PCA)**.
   - Generated cautious, data-driven cluster descriptions comparing cluster centroids against dataset-wide averages.
6. **Song Recommendation Engine:**
   - Computed normalized **Cosine Similarity** on scaled feature vectors.
   - Supports global search, cluster-constrained recommendations, and genre filtering.
   - Provides plain-language explanations for match factors (e.g., tempo alignment $\Delta \le 5$ BPM, matching energy level, shared acousticness timbre).
7. **Model Evaluation & Diagnostics:**
   - Internal cohesion: Inertia and Silhouette score curves.
   - External alignment against playlist categories: **Adjusted Rand Index (ARI)** and **Normalized Mutual Information (NMI)**, accompanied by rigorous academic explanations clarifying why playlist curation differs from pure audio feature clustering.

---

## 🚀 4. Technology Stack

### Backend
- **Python 3.13**
- **FastAPI**: High-performance asynchronous REST API
- **Uvicorn**: Lightning-fast ASGI web server
- **Pandas & NumPy**: In-memory vector operations and statistics
- **Scikit-Learn**: `StandardScaler`, `KMeans`, `PCA`, `silhouette_score`, `adjusted_rand_score`, `cosine_similarity`

### Frontend
- **React 18** with **TypeScript**
- **Vite 6**: Instant HMR and optimized bundler
- **Tailwind CSS**: Custom pastel token system
- **Recharts 2.15**: Interactive bar charts, scatter plots, line curves, and tooltips
- **Lucide React**: Clean, minimal iconography

---

## 📂 5. Directory Structure

```
melody-spotify-studio/
├── backend/
│   ├── app.py                 # FastAPI application & REST endpoints
│   ├── preprocessing.py       # Data pipeline, cleaning, and StandardScaler
│   ├── eda.py                 # Descriptive statistics, histograms, boxplots
│   ├── correlation.py         # Pearson & Spearman correlation engine
│   ├── clustering.py          # KMeansManager, PCA projection, cluster profiling
│   ├── recommendations.py     # Cosine similarity recommendation engine
│   └── data/
│       └── spotify_dataset.csv # Curated 32k track Spotify dataset
├── frontend/
│   ├── index.html             # HTML5 template with Plus Jakarta Sans
│   ├── package.json           # Frontend dependencies & scripts
│   ├── vite.config.ts         # Vite configuration with proxy to FastAPI
│   ├── tailwind.config.js     # Custom pastel theme colors
│   └── src/
│       ├── types.ts           # Complete TypeScript interfaces
│       ├── index.css          # Pastel scrollbars, card utilities
│       ├── main.tsx           # React entry point
│       ├── App.tsx            # Navigation state and page router
│       ├── components/
│       │   ├── Sidebar.tsx    # Left navigation with active lavender indicators
│       │   └── Navbar.tsx     # Top breadcrumbs, dataset status, CSV upload
│       └── pages/
│           ├── OverviewPage.tsx          # 6 KPI cards, 5 charts, auto-insights
│           ├── DatasetExplorerPage.tsx   # Search, filter, sort, paginate, export CSV
│           ├── MusicInsightsPage.tsx     # Histograms, boxplots, bivariate scatters
│           ├── GenreAnalysisPage.tsx     # Multi-genre comparison, bar charts
│           ├── ClusterExplorerPage.tsx   # K-Means K selector, PCA map, profiles
│           ├── CorrelationMatrixPage.tsx # Heatmap, Pearson/Spearman toggles
│           ├── RecommendationsPage.tsx   # Similarity studio, match %, explanations
│           ├── ModelEvaluationPage.tsx   # Elbow curve, Silhouette, ARI/NMI
│           └── AboutPage.tsx             # 9-stage ML methodology, tech stack
├── requirements.txt           # Python dependencies
└── README.md                  # Comprehensive documentation
```

---

## 💻 6. Installation & Execution Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Step 1: Clone or Navigate to the Workspace
```bash
cd /Users/keerthanahl/melody-spotify-studio
```
*(Or open `/Users/keerthanahl/melody-spotify-studio` directly in VS Code)*

### Step 2: Set up the Backend
```bash
cd backend
python3 -m pip install -r ../requirements.txt
python3 -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```
*The FastAPI backend will start at `http://127.0.0.1:8000`.*

### Step 3: Set up the Frontend
Open a second terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The Vite development server will start at `http://127.0.0.1:5173`.*

Open your browser and navigate to **`http://127.0.0.1:5173`** to access **Melody — Spotify Genre Studio**.

---

## 📡 7. Core API Reference

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/health` | `GET` | Service status, track count, feature list |
| `/api/overview` | `GET` | Catalog KPIs, distributions, top artists, empirical insights |
| `/api/dataset` | `GET` | Paginated search, sorting, filtering across 32k tracks |
| `/api/dataset/export` | `GET` | Streaming download of cleaned dataset CSV |
| `/api/preprocessing` | `GET` | Before/after diagnostics, imputation, scaling summary |
| `/api/insights` | `GET` | Dynamic feature histograms, boxplot quartiles, bivariate scatter |
| `/api/correlation` | `GET` | Pearson / Spearman correlation matrix & ranked associations |
| `/api/genres` | `GET` | Comparative multi-genre feature benchmarks & answers |
| `/api/clustering` | `GET` | Current K-Means state, 2D PCA scatter points, cluster profiles |
| `/api/clustering/train`| `POST` | Retrain K-Means model with custom $K \in [2, 12]$ |
| `/api/clustering/export`| `GET` | Download CSV containing track cluster assignments |
| `/api/recommendations/search` | `GET` | Autocomplete / search tracks by title or artist |
| `/api/recommendations` | `POST` | Cosine similarity recommendations with factor explanations |
| `/api/evaluation` | `GET` | Inertia Elbow curve, Silhouette curve, ARI, NMI scores |
| `/api/upload` | `POST` | Upload and validate a new custom CSV dataset |

---

## 🎓 8. Academic Notes & Ethical Disclaimers
- **Playlists vs. Track Genres:** Playlist labels in the Spotify dataset reflect curator choices. Clusters generated by this application reflect objective, measured audio features.
- **Audio Previews:** In accordance with academic guidelines and without requiring proprietary Spotify credentials, the application visualizes feature data without streaming copyrighted audio.

import React from 'react';
import {
  Info,
  CheckCircle2,
  Code2,
  Database,
  Layers,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  BookOpen
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const steps = [
    { num: '01', title: 'Data Inspection', desc: 'Loaded raw Spotify CSV with 32,833 tracks and 23 attributes.' },
    { num: '02', title: 'Preprocessing', desc: 'Imputed missing values, handled duplicates, verified numerical integrity.' },
    { num: '03', title: 'EDA & Visuals', desc: 'Computed genre distributions, box plot quartiles, and bivariate scatters.' },
    { num: '04', title: 'Correlation', desc: 'Assessed Pearson and Spearman matrices to uncover acoustic interactions.' },
    { num: '05', title: 'Standardization', desc: 'StandardScaler applied to 11 audio dimensions for fair Euclidean distances.' },
    { num: '06', title: 'K-Means Clustering', desc: 'Unsupervised partitioning into distinct, cohesive acoustic segments.' },
    { num: '07', title: 'PCA & Profiling', desc: 'Projected vectors to 2D PCA space and computed centroid deviations.' },
    { num: '08', title: 'Recommendations', desc: 'Built cosine similarity engine with feature comparison explanations.' },
    { num: '09', title: 'Evaluation', desc: 'Measured Inertia, Silhouette curve, ARI, and NMI against playlist genres.' },
  ];

  const techStack = [
    { category: 'Data Science & ML', items: ['Python 3.13', 'Pandas 2.3', 'NumPy 2.3', 'Scikit-Learn 1.7'] },
    { category: 'API Backend', items: ['FastAPI', 'Uvicorn ASGI', 'RESTful Endpoints', 'Streaming CSV'] },
    { category: 'Frontend Interface', items: ['React 18', 'TypeScript', 'Vite 6', 'Tailwind CSS'] },
    { category: 'Visualization & UX', items: ['Recharts 2.15', 'Lucide React Icons', 'Custom Pastel System'] }
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#302C3F]">About the Project</h1>
        <p className="text-sm text-[#777487] mt-1">
          Academic documentation, architectural methodology, and dataset provenance.
        </p>
      </div>

      {/* Main Project Overview Card */}
      <div className="bg-white border border-[#EEEAF5] p-8 rounded-3xl shadow-card space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E9E1FA] flex items-center justify-center text-[#8B75C9]">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#302C3F]">
              Spotify Songs’ Genre Segmentation & Recommendation System
            </h2>
            <p className="text-xs text-[#8B75C9] font-semibold">Academic Machine Learning Project</p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-[#777487] leading-relaxed">
          <p>
            <strong className="text-[#302C3F]">Primary Objective:</strong> Analyze Spotify playlist and song data, identify patterns in musical audio characteristics, group similar songs using unsupervised machine learning (K-Means), and recommend tracks based on multidimensional feature proximity.
          </p>
          <p>
            This system demonstrates real data engineering, exploratory analysis, unsupervised clustering, and cosine similarity-based information retrieval without relying on external streaming APIs or mock static numbers.
          </p>
        </div>

        {/* Tech Stack Grid */}
        <div className="pt-4 border-t border-[#EEEAF5]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#777487] mb-3">
            Technology Stack & Tools
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {techStack.map((tech) => (
              <div key={tech.category} className="p-4 rounded-2xl bg-[#FAF9FF] border border-[#EEEAF5]">
                <h4 className="text-xs font-bold text-[#8B75C9] mb-2">{tech.category}</h4>
                <ul className="space-y-1">
                  {tech.items.map((it) => (
                    <li key={it} className="text-xs text-[#302C3F] flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B8A6E8]" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Methodology Flow Diagram */}
      <div className="bg-white border border-[#EEEAF5] p-8 rounded-3xl shadow-card space-y-6">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-[#8B75C9]" />
          <h3 className="text-base font-bold text-[#302C3F]">9-Stage Machine Learning Methodology</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step) => (
            <div
              key={step.num}
              className="p-4 rounded-2xl bg-[#FAF9FF] border border-[#EEEAF5] hover:border-[#B8A6E8] transition-colors"
            >
              <span className="text-xs font-bold text-[#8B75C9]">{step.num}</span>
              <h4 className="text-xs font-bold text-[#302C3F] mt-1">{step.title}</h4>
              <p className="text-[11px] text-[#777487] mt-1 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dataset Limitations & Academic Ethics */}
      <div className="bg-white border border-[#EEEAF5] p-6 rounded-3xl shadow-card flex items-start space-x-4">
        <ShieldAlert className="w-5 h-5 text-[#C9794B] shrink-0 mt-1" />
        <div className="space-y-2 text-xs text-[#777487]">
          <h4 className="text-sm font-bold text-[#302C3F]">Dataset Limitations & Scope</h4>
          <p>
            • <strong>Playlist Labels vs Track Genres:</strong> The provided Spotify CSV groups tracks according to playlist curation (e.g. "Pop", "Rock", "EDM"). Playlists are compiled by human curators and frequently include cross-genre songs. The clustering algorithm operates on objective audio features, not subjective marketing tags.
          </p>
          <p>
            • <strong>Streaming & Playback:</strong> In accordance with academic guidelines and without requiring private Spotify developer credentials, this application does not stream copyrighted MP3 audio or fabricate fake album cover images. It uses lightweight pastel music placeholders and real audio analytics.
          </p>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Network,
  Download,
  RotateCw,
  Layers,
  Sparkles,
  Users,
  Disc,
  Info,
  TrendingUp,
  Table as TableIcon
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { ClusteringResponse, ClusterSummary } from '../types';

export const ClusterExplorerPage: React.FC = () => {
  const [data, setData] = useState<ClusteringResponse | null>(null);
  const [crosstabs, setCrosstabs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [selectedClusterId, setSelectedClusterId] = useState<number>(0);
  const [inputK, setInputK] = useState<number>(6);

  const fetchClustering = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/clustering');
      const json = await res.json();
      setData(json);
      setInputK(json.current_k);
      const ctRes = await fetch('/api/clustering/crosstab');
      const ctJson = await ctRes.json();
      setCrosstabs(ctJson);
    } catch (err) {
      console.error('Error fetching clustering:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClustering();
  }, []);

  const handleTrainK = async () => {
    if (inputK < 2 || inputK > 12) {
      alert('Please select a K value between 2 and 12');
      return;
    }
    setTraining(true);
    try {
      const res = await fetch('/api/clustering/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ k: inputK })
      });
      if (!res.ok) throw new Error('Training failed');
      await fetchClustering();
      setSelectedClusterId(0);
    } catch (err: any) {
      alert(err.message || 'Error retraining K-Means model');
    } finally {
      setTraining(false);
    }
  };

  const handleExportClusters = () => {
    window.location.href = '/api/clustering/export';
  };

  const selectedSummary: ClusterSummary | undefined = data?.cluster_summaries.find(
    (c) => c.cluster_id === selectedClusterId
  );

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#302C3F]">K-Means Cluster Explorer</h1>
          <p className="text-sm text-[#777487] mt-1">
            Unsupervised segmentation of Spotify songs based on 11 standardized musical characteristics.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white border border-[#EEEAF5] px-3 py-1.5 rounded-xl shadow-sm">
            <span className="text-xs text-[#777487] font-medium">Clusters (K):</span>
            <select
              value={inputK}
              onChange={(e) => setInputK(Number(e.target.value))}
              disabled={training}
              className="text-xs font-bold text-[#302C3F] bg-[#FAF9FF] border border-[#EEEAF5] rounded-md px-2 py-1 focus:outline-none"
            >
              {[3, 4, 5, 6, 7, 8, 9, 10].map((k) => (
                <option key={k} value={k}>
                  K = {k}
                </option>
              ))}
            </select>
            <button
              onClick={handleTrainK}
              disabled={training}
              className="text-xs px-3 py-1 bg-[#8B75C9] hover:bg-[#765DB8] text-white font-medium rounded-md transition-colors disabled:opacity-50"
            >
              {training ? 'Fitting...' : 'Apply K'}
            </button>
          </div>
          <button
            onClick={handleExportClusters}
            className="flex items-center space-x-2 px-4 py-2 bg-[#FAF9FF] border border-[#EEEAF5] hover:bg-[#E9E1FA] text-[#8B75C9] font-medium text-xs rounded-xl shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Assignments</span>
          </button>
        </div>
      </div>

      {/* Cluster Overview Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {data?.cluster_summaries.map((c) => {
          const isSelected = c.cluster_id === selectedClusterId;
          return (
            <button
              key={c.cluster_id}
              onClick={() => setSelectedClusterId(c.cluster_id)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 ${
                isSelected
                  ? 'bg-white border-[#B8A6E8] shadow-card ring-2 ring-[#B8A6E8]/30'
                  : 'bg-white border-[#EEEAF5] hover:border-[#B8A6E8]/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                <span className="text-[11px] text-[#777487] font-medium">{c.percentage}%</span>
              </div>
              <h4 className="font-bold text-[#302C3F] text-sm mt-2">{c.label}</h4>
              <p className="text-xs text-[#777487] mt-0.5">{c.count.toLocaleString()} songs</p>
            </button>
          );
        })}
      </div>

      {/* Selected Cluster Detail Inspection Card */}
      {selectedSummary && (
        <div className="bg-white border border-[#EEEAF5] p-6 rounded-3xl shadow-card space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EEEAF5]">
            <div className="flex items-center space-x-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-xs"
                style={{ backgroundColor: selectedSummary.color }}
              >
                C{selectedSummary.cluster_id}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#302C3F]">
                  Profile of {selectedSummary.label}
                </h3>
                <p className="text-xs text-[#777487]">
                  {selectedSummary.count.toLocaleString()} tracks ({selectedSummary.percentage}% of catalog)
                </p>
              </div>
            </div>
            <div className="inline-flex items-center space-x-2 bg-[#FAF9FF] border border-[#EEEAF5] px-3 py-1 rounded-full text-xs text-[#777487]">
              <Info className="w-3.5 h-3.5 text-[#8B75C9]" />
              <span>Statistical Audio Signature</span>
            </div>
          </div>

          <div className="bg-[#FAF9FF] p-4 rounded-2xl border border-[#EEEAF5]">
            <p className="text-xs font-semibold text-[#8B75C9] uppercase tracking-wide">
              Data-Driven Analytical Summary:
            </p>
            <p className="text-xs text-[#302C3F] mt-1 leading-relaxed">
              {selectedSummary.description}
            </p>
          </div>

          {/* Deviations vs Benchmark Grid */}
          <div>
            <h4 className="text-xs font-bold text-[#777487] uppercase tracking-wide mb-3">
              Audio Feature Centroid Deviations (vs Global Average):
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {selectedSummary.deviations.map((d) => {
                const isPositive = d.deviation_pct >= 0;
                return (
                  <div key={d.feature} className="p-3 bg-white border border-[#EEEAF5] rounded-xl text-xs">
                    <span className="text-[11px] text-[#777487] uppercase">{d.feature}</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="font-bold text-[#302C3F]">{d.cluster_mean}</span>
                      <span
                        className={`text-[11px] font-bold ${
                          isPositive ? 'text-[#3E8B5E]' : 'text-[#C95B8C]'
                        }`}
                      >
                        {isPositive ? `+${d.deviation_pct}%` : `${d.deviation_pct}%`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Genres and Top Artists in this cluster */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <h4 className="text-xs font-bold text-[#777487] uppercase tracking-wide mb-3 flex items-center space-x-1.5">
                <Disc className="w-3.5 h-3.5 text-[#8B75C9]" />
                <span>Predominant Playlist Genres in Cluster:</span>
              </h4>
              <div className="space-y-2">
                {selectedSummary.top_genres.map((g) => (
                  <div
                    key={g.genre}
                    className="flex items-center justify-between bg-[#FAF9FF] p-2.5 rounded-xl border border-[#EEEAF5] text-xs"
                  >
                    <span className="font-bold uppercase text-[#302C3F]">{g.genre}</span>
                    <span className="text-[#8B75C9] font-medium">
                      {g.count.toLocaleString()} tracks ({g.pct}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-[#777487] uppercase tracking-wide mb-3 flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-[#8B75C9]" />
                <span>Common Artists in Cluster:</span>
              </h4>
              <div className="space-y-2">
                {selectedSummary.top_artists.map((a) => (
                  <div
                    key={a.artist}
                    className="flex items-center justify-between bg-[#FAF9FF] p-2.5 rounded-xl border border-[#EEEAF5] text-xs"
                  >
                    <span className="font-medium text-[#302C3F] truncate max-w-[200px]">{a.artist}</span>
                    <span className="text-[#777487] font-semibold">{a.count} tracks</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PCA 2D Cluster Space Scatter Plot */}
      <div className="bg-white border border-[#EEEAF5] p-6 rounded-3xl shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#302C3F]">PCA 2D Dimensionality Projection</h3>
            <p className="text-xs text-[#777487]">
              Tracks projected onto the first two principal components. Points are colored by assigned K-Means cluster.
            </p>
          </div>
          <span className="text-xs bg-[#E9E1FA] text-[#8B75C9] font-semibold px-2.5 py-1 rounded-full">
            Principal Components 1 & 2
          </span>
        </div>

        <div className="h-96 w-full">
          {loading ? (
            <div className="h-full bg-[#FAF9FF] rounded-2xl animate-pulse" />
          ) : data?.pca_sample ? (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1EDF8" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="PC1"
                  tick={{ fill: '#777487', fontSize: 11 }}
                  axisLine={{ stroke: '#EEEAF5' }}
                  label={{ value: 'Principal Component 1 (Acoustic Variance)', position: 'insideBottom', offset: -10, fill: '#777487', fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="PC2"
                  tick={{ fill: '#777487', fontSize: 11 }}
                  axisLine={{ stroke: '#EEEAF5' }}
                  label={{ value: 'Principal Component 2', angle: -90, position: 'insideLeft', fill: '#777487', fontSize: 11 }}
                />
                <ZAxis range={[28, 28]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-white border border-[#EEEAF5] p-3 rounded-xl shadow-lg text-xs space-y-1">
                          <p className="font-bold text-[#302C3F]">{item.name}</p>
                          <p className="text-[#777487]">{item.artist}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="font-semibold text-[#302C3F]">{item.cluster_label}</span>
                            <span className="text-[#777487] uppercase">({item.genre})</span>
                          </div>
                          <p className="text-[#777487] text-[11px] pt-1">
                            Energy: {item.energy} | Dance: {item.danceability} | Tempo: {item.tempo}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Tracks" data={data.pca_sample}>
                  {data.pca_sample.map((entry, index) => (
                    <Cell key={`pca-cell-${index}`} fill={entry.color} opacity={0.7} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      </div>

      {/* Cluster vs Playlist Genre Cross-Tabulation */}
      {crosstabs?.cluster_vs_genre && (
        <div className="bg-white border border-[#EEEAF5] p-6 rounded-3xl shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#302C3F]">Cluster vs Playlist Genre Crosstab</h3>
              <p className="text-xs text-[#777487]">
                Track distribution across clusters and playlist categories. Demonstrates mixed acoustic diversity.
              </p>
            </div>
            <TableIcon className="w-4 h-4 text-[#8B75C9]" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF9FF] border-b border-[#EEEAF5] text-[#777487] font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Cluster</th>
                  {crosstabs.cluster_vs_genre.genres.map((g: string) => (
                    <th key={g} className="py-2.5 px-3 uppercase">
                      {g}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEEAF5]">
                {crosstabs.cluster_vs_genre.data.map((row: any) => (
                  <tr key={row.cluster} className="hover:bg-[#FAF9FF]">
                    <td className="py-2.5 px-3 font-bold text-[#302C3F]">{row.cluster}</td>
                    {crosstabs.cluster_vs_genre.genres.map((g: string) => (
                      <td key={g} className="py-2.5 px-3 text-[#777487]">
                        {row[g]?.toLocaleString() || 0}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

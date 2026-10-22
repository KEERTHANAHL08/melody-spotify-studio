import React, { useState, useEffect } from 'react';
import {
  Grid,
  Check,
  TrendingUp,
  TrendingDown,
  Info,
  HelpCircle
} from 'lucide-react';
import { CorrelationData } from '../types';

export const CorrelationMatrixPage: React.FC = () => {
  const [method, setMethod] = useState<'pearson' | 'spearman'>('pearson');
  const [data, setData] = useState<CorrelationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState<{ feat1: string; feat2: string; val: number } | null>(null);

  const ALL_FEATURES = [
    'danceability',
    'energy',
    'loudness',
    'speechiness',
    'acousticness',
    'instrumentalness',
    'liveness',
    'valence',
    'tempo'
  ];
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(ALL_FEATURES);

  const fetchCorrelation = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        method: method,
        features: selectedFeatures.join(',')
      });
      const res = await fetch(`/api/correlation?${params.toString()}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Error fetching correlation matrix:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCorrelation();
  }, [method, selectedFeatures]);

  const toggleFeature = (feat: string) => {
    if (selectedFeatures.includes(feat)) {
      if (selectedFeatures.length > 2) {
        setSelectedFeatures(selectedFeatures.filter((f) => f !== feat));
      }
    } else {
      setSelectedFeatures([...selectedFeatures, feat]);
    }
  };

  // Diverging pastel color helper: -1.0 (pastel pink) to 0 (white) to +1.0 (pastel lavender/purple)
  const getCellColor = (val: number) => {
    if (val === 1) return '#E9E1FA';
    if (val > 0) {
      const alpha = Math.min(1, Math.max(0.1, val * 0.85));
      return `rgba(184, 166, 232, ${alpha})`;
    } else {
      const alpha = Math.min(1, Math.max(0.1, Math.abs(val) * 0.85));
      return `rgba(247, 220, 232, ${alpha})`;
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#302C3F]">Correlation Matrix Heatmap</h1>
        <p className="text-sm text-[#777487] mt-1">
          Evaluate linear (Pearson) or monotonic (Spearman) relationships between continuous audio metrics.
        </p>
      </div>

      {/* Control Toolbar */}
      <div className="bg-white border border-[#EEEAF5] p-5 rounded-2xl shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Method toggle */}
        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold text-[#302C3F]">Method:</span>
          <div className="flex bg-[#FAF9FF] p-1 rounded-xl border border-[#EEEAF5]">
            <button
              onClick={() => setMethod('pearson')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                method === 'pearson'
                  ? 'bg-white text-[#8B75C9] font-bold shadow-xs'
                  : 'text-[#777487] hover:text-[#302C3F]'
              }`}
            >
              Pearson (Linear)
            </button>
            <button
              onClick={() => setMethod('spearman')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                method === 'spearman'
                  ? 'bg-white text-[#8B75C9] font-bold shadow-xs'
                  : 'text-[#777487] hover:text-[#302C3F]'
              }`}
            >
              Spearman (Rank)
            </button>
          </div>
        </div>

        {/* Feature Checkboxes */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-[#777487] mr-1">Include:</span>
          {ALL_FEATURES.map((feat) => {
            const active = selectedFeatures.includes(feat);
            return (
              <button
                key={feat}
                onClick={() => toggleFeature(feat)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                  active
                    ? 'bg-[#E9E1FA] border-[#B8A6E8] text-[#8B75C9]'
                    : 'bg-[#FAF9FF] border-[#EEEAF5] text-[#777487]'
                }`}
              >
                {feat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="bg-white border border-[#EEEAF5] p-6 rounded-3xl shadow-card overflow-x-auto">
        <div className="min-w-[650px]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-[#302C3F]">
                {method.toUpperCase()} Coefficient Heatmap
              </h3>
              <p className="text-xs text-[#777487]">Scale ranging from -1.00 to +1.00</p>
            </div>
            {/* Color Legend */}
            <div className="flex items-center space-x-2 text-xs text-[#777487]">
              <span>Inverse (-1.0)</span>
              <div className="w-24 h-3 rounded-full bg-gradient-to-r from-[#F7DCE8] via-white to-[#B8A6E8] border border-[#EEEAF5]" />
              <span>Direct (+1.0)</span>
            </div>
          </div>

          {loading ? (
            <div className="h-72 bg-[#FAF9FF] rounded-2xl animate-pulse" />
          ) : data ? (
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-left text-xs font-bold text-[#777487] uppercase">Feature</th>
                    {data.features.map((f) => (
                      <th
                        key={f}
                        className="p-2 text-xs font-semibold text-[#302C3F] capitalize max-w-[70px] truncate"
                        title={f}
                      >
                        {f.slice(0, 7)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.matrix.map((row) => (
                    <tr key={row.feature}>
                      <td className="p-2 text-left text-xs font-semibold text-[#302C3F] capitalize border-r border-[#EEEAF5]">
                        {row.feature}
                      </td>
                      {data.features.map((colFeat) => {
                        const val = row[colFeat];
                        const isHovered =
                          hoveredCell?.feat1 === row.feature && hoveredCell?.feat2 === colFeat;
                        return (
                          <td
                            key={colFeat}
                            onMouseEnter={() =>
                              setHoveredCell({ feat1: row.feature, feat2: colFeat, val })
                            }
                            onMouseLeave={() => setHoveredCell(null)}
                            style={{ backgroundColor: getCellColor(val) }}
                            className={`p-2.5 text-xs font-bold transition-all cursor-pointer border border-white ${
                              Math.abs(val) > 0.4 ? 'text-[#302C3F]' : 'text-[#777487]'
                            } ${isHovered ? 'scale-105 shadow-md z-10' : ''}`}
                          >
                            {val.toFixed(2)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>

      {/* Strongest Relationships & Statistical Explanation */}
      {data?.narratives && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Positive */}
          <div className="bg-white border border-[#EEEAF5] p-6 rounded-3xl shadow-card space-y-4">
            <div className="flex items-center space-x-2 text-[#8B75C9]">
              <TrendingUp className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wide">
                Strongest Positive Associations
              </h3>
            </div>
            <div className="space-y-3">
              {data.narratives.strongest_positive.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-[#FAF9FF] rounded-2xl border border-[#EEEAF5]">
                  <div className="flex items-center justify-between text-xs font-bold text-[#302C3F]">
                    <span className="capitalize">{item.pair}</span>
                    <span className="text-[#8B75C9] bg-[#E9E1FA] px-2 py-0.5 rounded-md">
                      r = +{item.r.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-[#777487] mt-1.5 leading-relaxed">{item.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Negative */}
          <div className="bg-white border border-[#EEEAF5] p-6 rounded-3xl shadow-card space-y-4">
            <div className="flex items-center space-x-2 text-[#C95B8C]">
              <TrendingDown className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wide">
                Strongest Inverse Relationships
              </h3>
            </div>
            <div className="space-y-3">
              {data.narratives.strongest_negative.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-[#FAF9FF] rounded-2xl border border-[#EEEAF5]">
                  <div className="flex items-center justify-between text-xs font-bold text-[#302C3F]">
                    <span className="capitalize">{item.pair}</span>
                    <span className="text-[#C95B8C] bg-[#F7DCE8] px-2 py-0.5 rounded-md">
                      r = {item.r.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-[#777487] mt-1.5 leading-relaxed">{item.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Academic Methodology Alert */}
      <div className="bg-[#FAF9FF] border border-[#EEEAF5] p-4 rounded-2xl flex items-start space-x-3 text-xs text-[#777487]">
        <Info className="w-4 h-4 text-[#8B75C9] shrink-0 mt-0.5" />
        <p>
          <strong className="text-[#302C3F]">Methodological Integrity Note:</strong> High correlation
          indicates that two musical metrics vary concurrently (e.g. tracks engineered with higher
          energy also tend to undergo compression to achieve higher loudness). It does not imply that
          one attribute mechanically forces the other.
        </p>
      </div>
    </div>
  );
};

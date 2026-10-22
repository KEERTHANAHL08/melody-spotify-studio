import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  Sliders,
  ScatterChart as ScatterIcon,
  HelpCircle,
  Activity
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';

export const MusicInsightsPage: React.FC = () => {
  const [feature, setFeature] = useState('danceability');
  const [xFeature, setXFeature] = useState('danceability');
  const [yFeature, setYFeature] = useState('energy');
  const [groupBy, setGroupBy] = useState('playlist_genre');
  const [insightsData, setInsightsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        feature: feature,
        group_by: groupBy,
        x_feature: xFeature,
        y_feature: yFeature
      });
      const res = await fetch(`/api/insights?${params.toString()}`);
      const json = await res.json();
      setInsightsData(json);
    } catch (err) {
      console.error('Error fetching insights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [feature, groupBy, xFeature, yFeature]);

  const AUDIO_FEATURES = [
    { id: 'danceability', label: 'Danceability (0 - 1)' },
    { id: 'energy', label: 'Energy (0 - 1)' },
    { id: 'valence', label: 'Valence / Happiness (0 - 1)' },
    { id: 'acousticness', label: 'Acousticness (0 - 1)' },
    { id: 'speechiness', label: 'Speechiness (0 - 1)' },
    { id: 'liveness', label: 'Liveness (0 - 1)' },
    { id: 'loudness', label: 'Loudness (dB)' },
    { id: 'tempo', label: 'Tempo (BPM)' }
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#302C3F]">Music Insights & Exploratory Data Analysis</h1>
        <p className="text-sm text-[#777487] mt-1">
          Investigate statistical audio distributions, genre-level variance, and cross-feature relationships.
        </p>
      </div>

      {/* Feature Selector Toolbar */}
      <div className="bg-white border border-[#EEEAF5] p-5 rounded-2xl shadow-card flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Sliders className="w-4 h-4 text-[#8B75C9]" />
          <span className="text-xs font-semibold text-[#302C3F]">Analyze Audio Feature:</span>
          <select
            value={feature}
            onChange={(e) => setFeature(e.target.value)}
            className="bg-[#FAF9FF] border border-[#EEEAF5] text-xs font-medium text-[#302C3F] rounded-xl px-3 py-2 focus:outline-none focus:border-[#B8A6E8]"
          >
            {AUDIO_FEATURES.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2 text-xs text-[#777487]">
          <Activity className="w-3.5 h-3.5 text-[#8B75C9]" />
          <span>Dynamically derived from 32,000+ verified Spotify observations</span>
        </div>
      </div>

      {/* Row 1: Histogram Distribution & Boxplot Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Histogram */}
        <div className="bg-white border border-[#EEEAF5] p-6 rounded-3xl shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#302C3F] capitalize">{feature} Distribution</h3>
              <p className="text-xs text-[#777487]">Frequency density histogram (15 equal bins)</p>
            </div>
            <BarChart2 className="w-4 h-4 text-[#8B75C9]" />
          </div>
          <div className="h-72 w-full">
            {loading ? (
              <div className="h-full bg-[#FAF9FF] rounded-2xl animate-pulse" />
            ) : insightsData?.histogram ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={insightsData.histogram} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1EDF8" vertical={false} />
                  <XAxis
                    dataKey="bin"
                    tick={{ fill: '#777487', fontSize: 10 }}
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                    axisLine={{ stroke: '#EEEAF5' }}
                  />
                  <YAxis tick={{ fill: '#777487', fontSize: 11 }} axisLine={{ stroke: '#EEEAF5' }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-white border border-[#EEEAF5] p-2.5 rounded-xl shadow-lg text-xs">
                            <p className="font-bold text-[#302C3F]">{item.bin}</p>
                            <p className="text-[#8B75C9] mt-0.5">{item.count.toLocaleString()} tracks</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" fill="#B8A6E8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>

        {/* Boxplot Quartiles Comparison */}
        <div className="bg-white border border-[#EEEAF5] p-6 rounded-3xl shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#302C3F] capitalize">{feature} Across Genres</h3>
              <p className="text-xs text-[#777487]">Quartile range (Min, Q1, Median, Q3, Max)</p>
            </div>
            <span className="text-[11px] font-semibold bg-[#E9E1FA] text-[#8B75C9] px-2.5 py-1 rounded-full">
              Box Plot Metrics
            </span>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
            {loading ? (
              <div className="h-60 bg-[#FAF9FF] rounded-2xl animate-pulse" />
            ) : insightsData?.boxplot ? (
              insightsData.boxplot.map((b: any) => (
                <div key={b.group} className="bg-[#FAF9FF] p-3 rounded-2xl border border-[#EEEAF5]">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#302C3F] mb-1.5">
                    <span className="uppercase text-[#8B75C9]">{b.group}</span>
                    <span className="text-[#777487]">
                      Median: <strong className="text-[#302C3F]">{b.median}</strong> | Mean: {b.mean}
                    </span>
                  </div>
                  {/* Visual Range representation */}
                  <div className="flex items-center space-x-2 text-[11px] text-[#777487]">
                    <span>Q1: {b.q1}</span>
                    <div className="flex-1 h-3 bg-white rounded-full border border-[#EEEAF5] relative overflow-hidden">
                      <div
                        className="h-full bg-[#B8A6E8]/40 border-l-2 border-r-2 border-[#8B75C9]"
                        style={{
                          marginLeft: `${Math.max(0, Math.min(100, b.q1 * 100))}%`,
                          width: `${Math.max(5, Math.min(100, (b.q3 - b.q1) * 100))}%`
                        }}
                      />
                    </div>
                    <span>Q3: {b.q3}</span>
                  </div>
                </div>
              ))
            ) : null}
          </div>
        </div>
      </div>

      {/* Row 2: Bivariate Scatter Plot with Selectable Dimensions */}
      <div className="bg-white border border-[#EEEAF5] p-6 rounded-3xl shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-[#302C3F]">Bivariate Audio Scatter Plot</h3>
            <p className="text-xs text-[#777487]">
              Inspect empirical correlation and clustering patterns between two dimensions.
            </p>
          </div>
          {/* Scatter axes selectors */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs text-[#777487]">X-Axis:</span>
              <select
                value={xFeature}
                onChange={(e) => setXFeature(e.target.value)}
                className="bg-[#FAF9FF] border border-[#EEEAF5] text-xs font-medium text-[#302C3F] rounded-lg px-2 py-1"
              >
                {AUDIO_FEATURES.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.id}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs text-[#777487]">Y-Axis:</span>
              <select
                value={yFeature}
                onChange={(e) => setYFeature(e.target.value)}
                className="bg-[#FAF9FF] border border-[#EEEAF5] text-xs font-medium text-[#302C3F] rounded-lg px-2 py-1"
              >
                {AUDIO_FEATURES.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.id}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="h-80 w-full">
          {loading ? (
            <div className="h-full bg-[#FAF9FF] rounded-2xl animate-pulse" />
          ) : insightsData?.scatter ? (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1EDF8" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name={xFeature}
                  tick={{ fill: '#777487', fontSize: 11 }}
                  axisLine={{ stroke: '#EEEAF5' }}
                  label={{ value: xFeature.toUpperCase(), position: 'insideBottom', offset: -10, fill: '#777487', fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name={yFeature}
                  tick={{ fill: '#777487', fontSize: 11 }}
                  axisLine={{ stroke: '#EEEAF5' }}
                  label={{ value: yFeature.toUpperCase(), angle: -90, position: 'insideLeft', fill: '#777487', fontSize: 11 }}
                />
                <ZAxis range={[25, 25]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-white border border-[#EEEAF5] p-3 rounded-xl shadow-lg text-xs space-y-1">
                          <p className="font-bold text-[#302C3F]">{item.name}</p>
                          <p className="text-[#777487]">{item.artist}</p>
                          <p className="text-[#8B75C9] font-medium uppercase">Genre: {item.genre}</p>
                          <p className="text-[#302C3F]">
                            {xFeature}: {item.x} | {yFeature}: {item.y}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Tracks" data={insightsData.scatter} fill="#8B75C9" opacity={0.65} />
              </ScatterChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      </div>
    </div>
  );
};

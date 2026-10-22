import React from 'react';
import {
  Music,
  Users,
  ListMusic,
  Disc,
  Flame,
  Layers,
  Sparkles,
  TrendingUp,
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
  Cell
} from 'recharts';
import { OverviewData } from '../types';

interface OverviewPageProps {
  data: OverviewData | null;
  loading: boolean;
}

const PASTEL_COLORS = ['#B8A6E8', '#F7DCE8', '#FFE7D6', '#DDF3E4', '#DDEBFA', '#FFF1C9', '#E2D4F0', '#FAD4D8'];

export const OverviewPage: React.FC<OverviewPageProps> = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-28 bg-[#E9E1FA]/40 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-white border border-[#EEEAF5] rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-white border border-[#EEEAF5] rounded-2xl animate-pulse" />
          <div className="h-80 bg-white border border-[#EEEAF5] rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  const { kpis, genre_distribution, audio_feature_averages, top_artists, popularity_distribution, playlist_composition, insights } = data;

  const metricCards = [
    { label: 'Total Tracks', value: kpis.total_tracks.toLocaleString(), icon: Music, bg: 'bg-[#E9E1FA]', text: 'text-[#8B75C9]' },
    { label: 'Unique Artists', value: kpis.unique_artists.toLocaleString(), icon: Users, bg: 'bg-[#F7DCE8]', text: 'text-[#C95B8C]' },
    { label: 'Playlists Curated', value: kpis.unique_playlists.toLocaleString(), icon: ListMusic, bg: 'bg-[#FFE7D6]', text: 'text-[#C9794B]' },
    { label: 'Playlist Genres', value: kpis.available_genres.toString(), icon: Disc, bg: 'bg-[#DDF3E4]', text: 'text-[#3E8B5E]' },
    { label: 'Avg Popularity', value: `${kpis.avg_popularity}/100`, icon: Flame, bg: 'bg-[#DDEBFA]', text: 'text-[#4878BA]' },
    { label: 'Active Clusters', value: kpis.cluster_count.toString(), icon: Layers, bg: 'bg-[#FFF1C9]', text: 'text-[#A07A2A]' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#E9E1FA] via-[#F7DCE8]/60 to-[#FAF9FF] p-8 border border-[#EEEAF5] shadow-sm">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-[#8B75C9] mb-3 border border-[#EEEAF5]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Melody Music Analytics Studio</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#302C3F] tracking-tight">
            Discover the Patterns Behind Your Music
          </h1>
          <p className="text-sm md:text-base text-[#777487] mt-2 font-normal leading-relaxed">
            Explore song characteristics, uncover musical clusters, and find your next favorite track using unsupervised machine learning on verified Spotify audio attributes.
          </p>
        </div>
        <div className="absolute right-4 -bottom-6 opacity-10 pointer-events-none">
          <Disc className="w-64 h-64 text-[#8B75C9]" />
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metricCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-white border border-[#EEEAF5] p-5 rounded-2xl shadow-card hover:shadow-hover transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center ${card.text}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xl font-bold text-[#302C3F] tracking-tight">{card.value}</p>
                <p className="text-xs text-[#777487] font-medium mt-0.5">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1: Genre Distribution & Audio Feature Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Genre Distribution */}
        <div className="bg-white border border-[#EEEAF5] p-6 rounded-3xl shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#302C3F]">Genre Distribution</h3>
              <p className="text-xs text-[#777487]">Track frequency across curated playlist genres</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-[#FAF9FF] text-[#8B75C9] rounded-lg border border-[#EEEAF5]">
              {genre_distribution.length} Genres
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genre_distribution} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1EDF8" vertical={false} />
                <XAxis dataKey="genre" tick={{ fill: '#777487', fontSize: 12 }} axisLine={{ stroke: '#EEEAF5' }} tickLine={false} />
                <YAxis tick={{ fill: '#777487', fontSize: 12 }} axisLine={{ stroke: '#EEEAF5' }} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#FAF9FF' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-white border border-[#EEEAF5] p-3 rounded-xl shadow-lg text-xs">
                          <p className="font-bold text-[#302C3F] uppercase">{item.genre}</p>
                          <p className="text-[#8B75C9] font-semibold mt-1">{item.count.toLocaleString()} tracks ({item.percentage}%)</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {genre_distribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PASTEL_COLORS[index % PASTEL_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Audio Feature Overview */}
        <div className="bg-white border border-[#EEEAF5] p-6 rounded-3xl shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#302C3F]">Audio Feature Benchmark</h3>
              <p className="text-xs text-[#777487]">Mean normalized acoustic dimensions (0.0 to 1.0 scale)</p>
            </div>
            <Activity className="w-4 h-4 text-[#8B75C9]" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={audio_feature_averages} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1EDF8" vertical={false} />
                <XAxis dataKey="feature" tick={{ fill: '#777487', fontSize: 11 }} axisLine={{ stroke: '#EEEAF5' }} tickLine={false} />
                <YAxis domain={[0, 1]} tick={{ fill: '#777487', fontSize: 12 }} axisLine={{ stroke: '#EEEAF5' }} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#FAF9FF' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-white border border-[#EEEAF5] p-3 rounded-xl shadow-lg text-xs">
                          <p className="font-bold text-[#302C3F]">{item.feature}</p>
                          <p className="text-[#8B75C9] font-semibold mt-1">Average: {item.average}</p>
                          <p className="text-[#777487]">Std Dev: ±{item.std}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="average" fill="#B8A6E8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Popular Artists & Popularity Distribution & Playlist Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 3: Top Artists */}
        <div className="bg-white border border-[#EEEAF5] p-6 rounded-3xl shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#302C3F]">Most Represented Artists</h3>
              <p className="text-xs text-[#777487]">Artists with highest catalog track counts</p>
            </div>
            <TrendingUp className="w-4 h-4 text-[#C95B8C]" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={top_artists.slice(0, 6)}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1EDF8" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#777487', fontSize: 11 }} axisLine={{ stroke: '#EEEAF5' }} />
                <YAxis dataKey="artist" type="category" width={80} tick={{ fill: '#302C3F', fontSize: 11 }} axisLine={{ stroke: '#EEEAF5' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-white border border-[#EEEAF5] p-2.5 rounded-xl shadow-lg text-xs">
                          <p className="font-bold text-[#302C3F]">{item.artist}</p>
                          <p className="text-[#8B75C9] mt-0.5">{item.track_count} tracks</p>
                          <p className="text-[#777487]">Avg Popularity: {item.avg_popularity}/100</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="track_count" fill="#F7DCE8" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Popularity Distribution */}
        <div className="bg-white border border-[#EEEAF5] p-6 rounded-3xl shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#302C3F]">Popularity Distribution</h3>
              <p className="text-xs text-[#777487]">Frequency across 0–100 score brackets</p>
            </div>
            <Flame className="w-4 h-4 text-[#C9794B]" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularity_distribution} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1EDF8" vertical={false} />
                <XAxis dataKey="bin" tick={{ fill: '#777487', fontSize: 10 }} axisLine={{ stroke: '#EEEAF5' }} tickLine={false} />
                <YAxis tick={{ fill: '#777487', fontSize: 11 }} axisLine={{ stroke: '#EEEAF5' }} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-white border border-[#EEEAF5] p-2.5 rounded-xl shadow-lg text-xs">
                          <p className="font-bold text-[#302C3F]">Bracket: {item.bin}</p>
                          <p className="text-[#8B75C9] mt-0.5">{item.count.toLocaleString()} tracks</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#FFE7D6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Playlist Composition */}
        <div className="bg-white border border-[#EEEAF5] p-6 rounded-3xl shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#302C3F]">Top Curated Playlists</h3>
              <p className="text-xs text-[#777487]">Playlists contributing the highest volume</p>
            </div>
            <ListMusic className="w-4 h-4 text-[#3E8B5E]" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={playlist_composition.slice(0, 6)}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1EDF8" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#777487', fontSize: 11 }} axisLine={{ stroke: '#EEEAF5' }} />
                <YAxis
                  dataKey="playlist"
                  type="category"
                  width={85}
                  tick={{ fill: '#302C3F', fontSize: 10 }}
                  tickFormatter={(val) => (val.length > 12 ? `${val.slice(0, 12)}…` : val)}
                  axisLine={{ stroke: '#EEEAF5' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-white border border-[#EEEAF5] p-2.5 rounded-xl shadow-lg text-xs">
                          <p className="font-bold text-[#302C3F]">{item.playlist}</p>
                          <p className="text-[#3E8B5E] mt-0.5">{item.count} tracks</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#DDF3E4" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Key Insights Panel */}
      <div className="bg-white border border-[#EEEAF5] p-6 rounded-3xl shadow-card">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="w-5 h-5 text-[#8B75C9]" />
          <h3 className="text-base font-bold text-[#302C3F]">Empirical Catalog Insights</h3>
          <span className="text-xs bg-[#E9E1FA] text-[#8B75C9] font-medium px-2 py-0.5 rounded-md">
            Auto-Generated From Data
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#FAF9FF] border border-[#EEEAF5] hover:border-[#B8A6E8]/40 transition-colors"
            >
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#8B75C9]">
                {insight.category}
              </span>
              <h4 className="text-sm font-bold text-[#302C3F] mt-1">{insight.title}</h4>
              <p className="text-xs text-[#777487] mt-1.5 leading-relaxed">{insight.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

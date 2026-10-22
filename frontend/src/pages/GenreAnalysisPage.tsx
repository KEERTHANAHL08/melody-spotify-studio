import React, { useState, useEffect } from 'react';
import {
  Disc,
  Check,
  Zap,
  Smile,
  Radio,
  Sparkles,
  BarChart3
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';

const PASTEL_GENRE_COLORS: Record<string, string> = {
  edm: '#B8A6E8',
  rap: '#F7DCE8',
  pop: '#FFE7D6',
  'r&b': '#DDF3E4',
  latin: '#DDEBFA',
  rock: '#FFF1C9',
};

export const GenreAnalysisPage: React.FC = () => {
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['pop', 'edm', 'rock', 'rap']);
  const [genreData, setGenreData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchGenreAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/genres?genres=${selectedGenres.join(',')}`);
      const json = await res.json();
      setGenreData(json);
      if (availableGenres.length === 0 && json.available_genres) {
        setAvailableGenres(json.available_genres);
      }
    } catch (err) {
      console.error('Error fetching genre analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenreAnalysis();
  }, [selectedGenres]);

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      if (selectedGenres.length > 1) {
        setSelectedGenres(selectedGenres.filter((g) => g !== genre));
      }
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  // Prepare grouped bar chart data (features on X-axis, genres as bars)
  const chartFeatures = ['danceability', 'energy', 'valence', 'acousticness', 'speechiness'];
  const groupedChartData = chartFeatures.map((feat) => {
    const row: Record<string, any> = { feature: feat.toUpperCase() };
    if (genreData?.profiles) {
      genreData.profiles.forEach((p: any) => {
        row[p.genre] = p.means[feat] || 0;
      });
    }
    return row;
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#302C3F]">Genre Profile & Comparison Studio</h1>
        <p className="text-sm text-[#777487] mt-1">
          Compare acoustic fingerprints and structural attributes across curated Spotify playlist genres.
        </p>
      </div>

      {/* Genre Selector Pills */}
      <div className="bg-white border border-[#EEEAF5] p-5 rounded-2xl shadow-card">
        <div className="flex items-center space-x-2 mb-3">
          <Disc className="w-4 h-4 text-[#8B75C9]" />
          <h3 className="text-xs font-bold text-[#302C3F] uppercase tracking-wide">
            Select Genres to Compare:
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {availableGenres.map((g) => {
            const isSelected = selectedGenres.includes(g);
            return (
              <button
                key={g}
                onClick={() => toggleGenre(g)}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                  isSelected
                    ? 'bg-[#E9E1FA] border-[#B8A6E8] text-[#8B75C9] font-semibold shadow-xs'
                    : 'bg-[#FAF9FF] border-[#EEEAF5] text-[#777487] hover:border-[#B8A6E8]'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-[#8B75C9]" />}
                <span className="uppercase">{g}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grouped Comparison Chart */}
      <div className="bg-white border border-[#EEEAF5] p-6 rounded-3xl shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#302C3F]">Acoustic Dimensions by Genre</h3>
            <p className="text-xs text-[#777487]">Mean normalized scores across selected genres</p>
          </div>
          <BarChart3 className="w-4 h-4 text-[#8B75C9]" />
        </div>
        <div className="h-80 w-full">
          {loading ? (
            <div className="h-full bg-[#FAF9FF] rounded-2xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={groupedChartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1EDF8" vertical={false} />
                <XAxis dataKey="feature" tick={{ fill: '#777487', fontSize: 11 }} axisLine={{ stroke: '#EEEAF5' }} />
                <YAxis domain={[0, 1]} tick={{ fill: '#777487', fontSize: 11 }} axisLine={{ stroke: '#EEEAF5' }} />
                <Tooltip
                  cursor={{ fill: '#FAF9FF' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border border-[#EEEAF5] p-3 rounded-xl shadow-lg text-xs space-y-1">
                          <p className="font-bold text-[#302C3F] border-b border-[#EEEAF5] pb-1">{label}</p>
                          {payload.map((entry: any) => (
                            <div key={entry.name} className="flex items-center justify-between space-x-4">
                              <span className="capitalize font-medium text-[#777487]">{entry.name}:</span>
                              <span className="font-bold text-[#302C3F]">{entry.value}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                {selectedGenres.map((g) => (
                  <Bar
                    key={g}
                    dataKey={g}
                    fill={PASTEL_GENRE_COLORS[g] || '#B8A6E8'}
                    radius={[6, 6, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Comparative Key Answers */}
      {genreData?.comparisons && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-[#EEEAF5] p-5 rounded-2xl shadow-card">
            <div className="flex items-center space-x-2 text-[#C95B8C] mb-2">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Peak Energy</span>
            </div>
            <p className="text-xl font-bold text-[#302C3F] uppercase">
              {genreData.comparisons.energy?.highest_genre}
            </p>
            <p className="text-xs text-[#8B75C9] font-medium mt-0.5">
              Avg score: {genreData.comparisons.energy?.highest_value}
            </p>
            <p className="text-[11px] text-[#777487] mt-2 leading-relaxed">
              {genreData.comparisons.energy?.explanation}
            </p>
          </div>

          <div className="bg-white border border-[#EEEAF5] p-5 rounded-2xl shadow-card">
            <div className="flex items-center space-x-2 text-[#8B75C9] mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Peak Danceability</span>
            </div>
            <p className="text-xl font-bold text-[#302C3F] uppercase">
              {genreData.comparisons.danceability?.highest_genre}
            </p>
            <p className="text-xs text-[#8B75C9] font-medium mt-0.5">
              Avg score: {genreData.comparisons.danceability?.highest_value}
            </p>
            <p className="text-[11px] text-[#777487] mt-2 leading-relaxed">
              {genreData.comparisons.danceability?.explanation}
            </p>
          </div>

          <div className="bg-white border border-[#EEEAF5] p-5 rounded-2xl shadow-card">
            <div className="flex items-center space-x-2 text-[#3E8B5E] mb-2">
              <Smile className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Highest Valence (Mood)</span>
            </div>
            <p className="text-xl font-bold text-[#302C3F] uppercase">
              {genreData.comparisons.valence?.highest_genre}
            </p>
            <p className="text-xs text-[#3E8B5E] font-medium mt-0.5">
              Avg score: {genreData.comparisons.valence?.highest_value}
            </p>
            <p className="text-[11px] text-[#777487] mt-2 leading-relaxed">
              {genreData.comparisons.valence?.explanation}
            </p>
          </div>

          <div className="bg-white border border-[#EEEAF5] p-5 rounded-2xl shadow-card">
            <div className="flex items-center space-x-2 text-[#C9794B] mb-2">
              <Radio className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Most Acoustic</span>
            </div>
            <p className="text-xl font-bold text-[#302C3F] uppercase">
              {genreData.comparisons.acousticness?.highest_genre}
            </p>
            <p className="text-xs text-[#C9794B] font-medium mt-0.5">
              Avg score: {genreData.comparisons.acousticness?.highest_value}
            </p>
            <p className="text-[11px] text-[#777487] mt-2 leading-relaxed">
              {genreData.comparisons.acousticness?.explanation}
            </p>
          </div>
        </div>
      )}

      {/* Genre Summary Cards */}
      <div className="bg-white border border-[#EEEAF5] p-6 rounded-3xl shadow-card">
        <h3 className="text-base font-bold text-[#302C3F] mb-4">Detailed Genre Summaries</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {genreData?.profiles?.map((p: any) => (
            <div key={p.genre} className="p-4 rounded-2xl bg-[#FAF9FF] border border-[#EEEAF5] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#302C3F] uppercase text-sm">{p.genre}</span>
                <span className="text-xs font-medium bg-white px-2 py-0.5 rounded-md border border-[#EEEAF5] text-[#8B75C9]">
                  {p.track_count.toLocaleString()} tracks
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-[#777487]">
                <div className="flex justify-between">
                  <span>Tempo:</span>
                  <span className="font-semibold text-[#302C3F]">{p.means.tempo} BPM</span>
                </div>
                <div className="flex justify-between">
                  <span>Popularity:</span>
                  <span className="font-semibold text-[#302C3F]">{p.means.popularity}/100</span>
                </div>
                <div className="flex justify-between">
                  <span>Danceability:</span>
                  <span className="font-semibold text-[#302C3F]">{p.means.danceability}</span>
                </div>
                <div className="flex justify-between">
                  <span>Energy:</span>
                  <span className="font-semibold text-[#302C3F]">{p.means.energy}</span>
                </div>
                <div className="flex justify-between">
                  <span>Valence:</span>
                  <span className="font-semibold text-[#302C3F]">{p.means.valence}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

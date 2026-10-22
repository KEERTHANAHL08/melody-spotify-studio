import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Music,
  Sliders,
  Check,
  Disc,
  Flame,
  ArrowRight,
  Layers,
  Heart
} from 'lucide-react';
import { RecommendationResponse, RecommendationItem } from '../types';

export const RecommendationsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number | null>(null);
  const [selectedTrackMeta, setSelectedTrackMeta] = useState<any | null>(null);
  const [topN, setTopN] = useState<number>(6);
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [strategy, setStrategy] = useState<'all' | 'same_cluster'>('all');
  const [recResult, setRecResult] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // Initial search recommendations (popular tracks)
  useEffect(() => {
    fetchTracks('');
  }, []);

  const fetchTracks = async (q: string) => {
    setSearching(true);
    try {
      const res = await fetch(`/api/recommendations/search?query=${encodeURIComponent(q)}`);
      const json = await res.json();
      setSearchResults(json);
      // Select first track by default if none selected
      if (selectedTrackIndex === null && json.length > 0) {
        setSelectedTrackIndex(json[0].index);
        setSelectedTrackMeta(json[0]);
      }
    } catch (err) {
      console.error('Error searching tracks:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracks(searchQuery);
  };

  const handleSelectTrack = (track: any) => {
    setSelectedTrackIndex(track.index);
    setSelectedTrackMeta(track);
  };

  const handleGenerateRecommendations = async () => {
    if (selectedTrackIndex === null) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track_index: selectedTrackIndex,
          top_n: topN,
          genre_filter: genreFilter === 'all' ? null : genreFilter,
          strategy: strategy
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || 'Failed to generate recommendations');
      setRecResult(json);
    } catch (err: any) {
      console.error('Error generating recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Run automatically when selected track changes or parameters update
  useEffect(() => {
    if (selectedTrackIndex !== null) {
      handleGenerateRecommendations();
    }
  }, [selectedTrackIndex, topN, genreFilter, strategy]);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#302C3F]">Song Recommendation Studio</h1>
        <p className="text-sm text-[#777487] mt-1">
          Generate similarity-driven recommendations using standardized multidimensional Euclidean & Cosine distance metrics.
        </p>
      </div>

      {/* Track Search & Selection Bar */}
      <div className="bg-white border border-[#EEEAF5] p-5 md:p-6 rounded-3xl shadow-card space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#777487] absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search catalog by song title or artist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9FF] border border-[#EEEAF5] rounded-xl text-xs text-[#302C3F] placeholder-[#777487] focus:outline-none focus:border-[#B8A6E8]"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#8B75C9] hover:bg-[#765DB8] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
          >
            {searching ? 'Searching...' : 'Find Track'}
          </button>
        </form>

        {/* Search Results Ribbon */}
        {searchResults.length > 0 && (
          <div>
            <span className="text-[11px] font-bold text-[#777487] uppercase tracking-wider block mb-2">
              Select Seed Track From Catalog:
            </span>
            <div className="flex gap-2.5 overflow-x-auto pb-2">
              {searchResults.map((t) => {
                const isSelected = selectedTrackIndex === t.index;
                return (
                  <button
                    key={t.index}
                    onClick={() => handleSelectTrack(t)}
                    className={`flex-shrink-0 text-left p-3 rounded-2xl border transition-all text-xs w-[190px] ${
                      isSelected
                        ? 'bg-[#E9E1FA] border-[#B8A6E8] ring-2 ring-[#B8A6E8]/30 shadow-xs'
                        : 'bg-[#FAF9FF] border-[#EEEAF5] hover:border-[#B8A6E8]/40'
                    }`}
                  >
                    <p className="font-bold text-[#302C3F] truncate">{t.track_name}</p>
                    <p className="text-[#777487] truncate text-[11px] mt-0.5">{t.track_artist}</p>
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#EEEAF5]/70">
                      <span className="text-[10px] uppercase font-bold text-[#8B75C9]">
                        {t.playlist_genre}
                      </span>
                      <span className="text-[10px] text-[#777487] font-medium">
                        Pop: {t.track_popularity}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Selected Seed Track & Recommendation Settings in a 2-card balanced layout */}
      {selectedTrackMeta && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Seed Track Card - 5 cols */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#E9E1FA] via-[#F7DCE8]/30 to-white border border-[#EEEAF5] p-6 rounded-3xl shadow-card flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs bg-white text-[#8B75C9] font-bold px-3 py-1 rounded-full border border-[#EEEAF5] shadow-xs">
                  Target Seed Track
                </span>
                <span className="text-xs font-bold text-[#8B75C9] bg-white/70 px-2.5 py-0.5 rounded-md">
                  Cluster {selectedTrackMeta.cluster}
                </span>
              </div>
              <div className="mt-4 flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#EEEAF5] flex items-center justify-center text-[#8B75C9] shadow-sm shrink-0">
                  <Music className="w-6 h-6" />
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-bold text-base text-[#302C3F] truncate">
                    {selectedTrackMeta.track_name}
                  </h3>
                  <p className="text-xs text-[#777487] truncate">{selectedTrackMeta.track_artist}</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#EEEAF5] space-y-2 text-xs">
              <div className="flex justify-between text-[#777487]">
                <span>Playlist:</span>
                <span className="font-medium text-[#302C3F] truncate max-w-[200px]">
                  {selectedTrackMeta.playlist_name}
                </span>
              </div>
              <div className="flex justify-between text-[#777487]">
                <span>Genre:</span>
                <span className="font-bold text-[#8B75C9] uppercase">
                  {selectedTrackMeta.playlist_genre}
                </span>
              </div>
              <div className="flex justify-between text-[#777487]">
                <span>Popularity:</span>
                <span className="font-semibold text-[#302C3F]">{selectedTrackMeta.track_popularity}/100</span>
              </div>
            </div>
          </div>

          {/* Recommendation Engine Parameters - 7 cols */}
          <div className="lg:col-span-7 bg-white border border-[#EEEAF5] p-6 rounded-3xl shadow-card flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sliders className="w-4 h-4 text-[#8B75C9]" />
                <h3 className="text-xs font-bold text-[#302C3F] uppercase tracking-wide">
                  Recommendation Filters & Strategy:
                </h3>
              </div>

              {/* 2-column grid for dropdowns so nothing is squeezed or truncated */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Count selector */}
                <div>
                  <label className="text-xs font-semibold text-[#777487] block mb-1.5">Results Count:</label>
                  <select
                    value={topN}
                    onChange={(e) => setTopN(Number(e.target.value))}
                    className="w-full bg-[#FAF9FF] border border-[#EEEAF5] text-xs font-medium text-[#302C3F] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#B8A6E8]"
                  >
                    <option value={4}>Top 4 Songs</option>
                    <option value={6}>Top 6 Songs</option>
                    <option value={8}>Top 8 Songs</option>
                    <option value={12}>Top 12 Songs</option>
                  </select>
                </div>

                {/* Genre filter */}
                <div>
                  <label className="text-xs font-semibold text-[#777487] block mb-1.5">Genre Filter:</label>
                  <select
                    value={genreFilter}
                    onChange={(e) => setGenreFilter(e.target.value)}
                    className="w-full bg-[#FAF9FF] border border-[#EEEAF5] text-xs font-medium text-[#302C3F] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#B8A6E8]"
                  >
                    <option value="all">Any Genre (Natural Audio Fit)</option>
                    <option value="pop">Pop</option>
                    <option value="edm">EDM</option>
                    <option value="rap">Rap</option>
                    <option value="rock">Rock</option>
                    <option value="r&b">R&B</option>
                    <option value="latin">Latin</option>
                  </select>
                </div>

                {/* Strategy selector (Full span) */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-[#777487] block mb-1.5">Clustering Scope:</label>
                  <select
                    value={strategy}
                    onChange={(e) => setStrategy(e.target.value as any)}
                    className="w-full bg-[#FAF9FF] border border-[#EEEAF5] text-xs font-medium text-[#302C3F] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#B8A6E8]"
                  >
                    <option value="all">Global Similarity (Search Across All 32k Songs)</option>
                    <option value="same_cluster">Cluster Restricted (Cluster {selectedTrackMeta.cluster} Only)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#EEEAF5] flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-[#777487]">
                Analyzed {recResult?.total_candidates_analyzed.toLocaleString() || '32,833'} candidate vectors
              </span>
              <button
                onClick={handleGenerateRecommendations}
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 bg-[#8B75C9] hover:bg-[#765DB8] text-white text-xs font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? 'Computing Proximity...' : 'Find Similar Songs'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recommendation Results Grid */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#8B75C9]" />
            <h3 className="text-base font-bold text-[#302C3F]">
              Recommended Songs ({recResult?.recommendations.length || 0})
            </h3>
          </div>
          <span className="text-xs text-[#777487]">
            Ranked by normalized cosine similarity score
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(topN || 6)].map((_, i) => (
              <div key={i} className="h-64 bg-white border border-[#EEEAF5] rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : recResult && recResult.recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recResult.recommendations.map((rec) => (
              <div
                key={rec.index}
                className="bg-white border border-[#EEEAF5] p-5 rounded-3xl shadow-card hover:shadow-hover transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top ribbon: Similarity percentage badge & Cluster */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#DDF3E4] text-[#2A6B3E] border border-[#C5E8D0]">
                      {rec.similarity_percentage}% Match
                    </span>
                    <span className="text-[11px] font-semibold text-[#8B75C9] bg-[#E9E1FA] px-2.5 py-0.5 rounded-md">
                      Cluster {rec.cluster}
                    </span>
                  </div>

                  {/* Track Info & Music Icon Placeholder */}
                  <div className="mt-3.5 flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#B8A6E8] to-[#E9E1FA] flex items-center justify-center text-[#8B75C9] shrink-0 shadow-xs">
                      <Music className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-sm text-[#302C3F] truncate">{rec.track_name}</h4>
                      <p className="text-xs text-[#777487] truncate">{rec.track_artist}</p>
                      <span className="text-[10px] font-bold text-[#8B75C9] uppercase">
                        {rec.playlist_genre}
                      </span>
                    </div>
                  </div>

                  {/* Rationale Reasons */}
                  <div className="mt-3.5 space-y-1.5 bg-[#FAF9FF] p-3 rounded-2xl border border-[#EEEAF5]">
                    <span className="text-[10px] uppercase font-bold text-[#777487] block mb-1">
                      Algorithmic Match Factors:
                    </span>
                    {rec.reasons.map((r, idx) => (
                      <p key={idx} className="text-[11px] text-[#302C3F] flex items-start space-x-1.5 leading-snug">
                        <span className="text-[#8B75C9] font-bold">•</span>
                        <span>{r}</span>
                      </p>
                    ))}
                  </div>
                </div>

                {/* Seed button */}
                <button
                  onClick={() => {
                    setSelectedTrackIndex(rec.index);
                    setSelectedTrackMeta(rec);
                  }}
                  className="w-full py-2.5 bg-[#FAF9FF] hover:bg-[#E9E1FA] text-[#8B75C9] text-xs font-semibold rounded-xl border border-[#EEEAF5] transition-colors flex items-center justify-center space-x-1.5"
                >
                  <span>Use As Next Seed Track</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#EEEAF5] p-12 rounded-3xl text-center space-y-2">
            <Music className="w-10 h-10 text-[#B8A6E8] mx-auto opacity-50" />
            <h4 className="text-sm font-bold text-[#302C3F]">No Recommendations Generated</h4>
            <p className="text-xs text-[#777487]">Select a seed song from the catalog above to view similar audio matches.</p>
          </div>
        )}
      </div>
    </div>
  );
};

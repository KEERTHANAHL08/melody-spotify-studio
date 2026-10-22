import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Database,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import { DatasetResponse, PreprocessingReport } from '../types';

export const DatasetExplorerPage: React.FC = () => {
  const [data, setData] = useState<DatasetResponse | null>(null);
  const [report, setReport] = useState<PreprocessingReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('all');
  const [sortBy, setSortBy] = useState('track_popularity');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [minPop, setMinPop] = useState<number>(0);
  const [showHealthModal, setShowHealthModal] = useState(false);

  const fetchDataset = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: '15',
        sort_by: sortBy,
        sort_order: sortOrder,
        genre: genre,
      });
      if (search) params.append('search', search);
      if (minPop > 0) params.append('min_pop', minPop.toString());

      const res = await fetch(`/api/dataset?${params.toString()}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Error fetching dataset:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReport = async () => {
    try {
      const res = await fetch('/api/preprocessing');
      const json = await res.json();
      setReport(json);
    } catch (err) {
      console.error('Error fetching report:', err);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  useEffect(() => {
    fetchDataset();
  }, [page, genre, sortBy, sortOrder, minPop]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDataset();
  };

  const handleExportCSV = () => {
    window.location.href = '/api/dataset/export';
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header and Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#302C3F]">Dataset Explorer</h1>
          <p className="text-sm text-[#777487] mt-1">
            Query, filter, and inspect verified Spotify records, audio features, and metadata.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowHealthModal(!showHealthModal)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-[#EEEAF5] text-[#8B75C9] font-medium text-xs rounded-xl shadow-sm hover:bg-[#FAF9FF] transition-colors"
          >
            <Database className="w-4 h-4" />
            <span>Health & Diagnostics</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-[#B8A6E8] hover:bg-[#8B75C9] text-white font-medium text-xs rounded-xl shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Clean CSV</span>
          </button>
        </div>
      </div>

      {/* Dataset Health Summary Panel */}
      {report && (
        <div className="bg-white border border-[#EEEAF5] p-6 rounded-3xl shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="w-4 h-4 text-[#8B75C9]" />
              <h3 className="text-sm font-bold text-[#302C3F]">Dataset Health Status</h3>
            </div>
            <span className="text-xs bg-[#DDF3E4] text-[#2A6B3E] font-medium px-2.5 py-0.5 rounded-full flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Standardized & Verified</span>
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-[#FAF9FF] p-3 rounded-2xl border border-[#EEEAF5]">
              <span className="text-[11px] text-[#777487]">Total Rows</span>
              <p className="text-base font-bold text-[#302C3F] mt-0.5">{report.post_cleaning_state.rows.toLocaleString()}</p>
            </div>
            <div className="bg-[#FAF9FF] p-3 rounded-2xl border border-[#EEEAF5]">
              <span className="text-[11px] text-[#777487]">Total Columns</span>
              <p className="text-base font-bold text-[#302C3F] mt-0.5">{report.post_cleaning_state.columns}</p>
            </div>
            <div className="bg-[#FAF9FF] p-3 rounded-2xl border border-[#EEEAF5]">
              <span className="text-[11px] text-[#777487]">Missing Handled</span>
              <p className="text-base font-bold text-[#8B75C9] mt-0.5">{report.initial_state.total_missing_values} values</p>
            </div>
            <div className="bg-[#FAF9FF] p-3 rounded-2xl border border-[#EEEAF5]">
              <span className="text-[11px] text-[#777487]">Exact Duplicates</span>
              <p className="text-base font-bold text-[#302C3F] mt-0.5">{report.initial_state.exact_duplicates}</p>
            </div>
            <div className="bg-[#FAF9FF] p-3 rounded-2xl border border-[#EEEAF5]">
              <span className="text-[11px] text-[#777487]">Audio Features</span>
              <p className="text-base font-bold text-[#302C3F] mt-0.5">{report.post_cleaning_state.selected_features.length}</p>
            </div>
            <div className="bg-[#FAF9FF] p-3 rounded-2xl border border-[#EEEAF5]">
              <span className="text-[11px] text-[#777487]">Scaling Strategy</span>
              <p className="text-xs font-semibold text-[#8B75C9] mt-1 truncate">StandardScaler</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#EEEAF5] p-5 rounded-2xl shadow-card space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#777487] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by track name, artist, or playlist..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#FAF9FF] border border-[#EEEAF5] rounded-xl text-xs text-[#302C3F] placeholder-[#777487] focus:outline-none focus:border-[#B8A6E8]"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-[#8B75C9] text-white text-xs font-medium rounded-xl hover:bg-[#765DB8] transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#EEEAF5]/60">
          <div className="flex flex-wrap items-center gap-3">
            {/* Genre Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-[#777487]" />
              <span className="text-xs text-[#777487] font-medium">Genre:</span>
              <select
                value={genre}
                onChange={(e) => {
                  setGenre(e.target.value);
                  setPage(1);
                }}
                className="bg-[#FAF9FF] border border-[#EEEAF5] text-xs text-[#302C3F] rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="all">All Genres</option>
                {data?.available_genres.map((g) => (
                  <option key={g} value={g}>
                    {g.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Popularity Filter */}
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#777487]" />
              <span className="text-xs text-[#777487] font-medium">Min Pop:</span>
              <select
                value={minPop}
                onChange={(e) => {
                  setMinPop(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-[#FAF9FF] border border-[#EEEAF5] text-xs text-[#302C3F] rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value={0}>Any Popularity</option>
                <option value={30}>30+ (Moderate)</option>
                <option value={50}>50+ (Popular)</option>
                <option value={70}>70+ (Hit Songs)</option>
              </select>
            </div>

            {/* Sorting */}
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#777487]" />
              <span className="text-xs text-[#777487] font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="bg-[#FAF9FF] border border-[#EEEAF5] text-xs text-[#302C3F] rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="track_popularity">Popularity</option>
                <option value="danceability">Danceability</option>
                <option value="energy">Energy</option>
                <option value="valence">Valence (Mood)</option>
                <option value="tempo">Tempo (BPM)</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="text-xs px-2 py-1 bg-[#FAF9FF] border border-[#EEEAF5] rounded-lg text-[#777487] hover:text-[#8B75C9]"
              >
                {sortOrder.toUpperCase()}
              </button>
            </div>
          </div>

          <span className="text-xs text-[#777487]">
            Showing {data?.data.length || 0} of {data?.total_records.toLocaleString() || 0} tracks
          </span>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-[#EEEAF5] rounded-3xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9FF] border-b border-[#EEEAF5] text-[#777487] uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Track</th>
                <th className="py-3 px-4">Artist</th>
                <th className="py-3 px-4">Genre</th>
                <th className="py-3 px-4">Popularity</th>
                <th className="py-3 px-4">Dance</th>
                <th className="py-3 px-4">Energy</th>
                <th className="py-3 px-4">Valence</th>
                <th className="py-3 px-4">Tempo</th>
                <th className="py-3 px-4">Cluster</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEEAF5]">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={9} className="py-4 px-4 bg-white">
                      <div className="h-4 bg-[#FAF9FF] rounded" />
                    </td>
                  </tr>
                ))
              ) : data && data.data.length > 0 ? (
                data.data.map((track, i) => (
                  <tr key={i} className="hover:bg-[#FAF9FF]/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#302C3F] max-w-xs truncate">
                      {track.track_name}
                    </td>
                    <td className="py-3 px-4 text-[#777487] max-w-[150px] truncate">
                      {track.track_artist}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-[#E9E1FA] text-[#8B75C9] rounded-md text-[11px] font-semibold uppercase">
                        {track.playlist_genre}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-medium text-[#302C3F]">{track.track_popularity}</span>
                        <div className="w-12 h-1.5 bg-[#FAF9FF] border border-[#EEEAF5] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#B8A6E8] rounded-full"
                            style={{ width: `${track.track_popularity}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#302C3F]">{track.danceability}</td>
                    <td className="py-3 px-4 text-[#302C3F]">{track.energy}</td>
                    <td className="py-3 px-4 text-[#302C3F]">{track.valence}</td>
                    <td className="py-3 px-4 text-[#302C3F]">{Math.round(track.tempo)} BPM</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-[#DDF3E4] text-[#2A6B3E] rounded-md font-medium text-[11px]">
                        C{track.cluster ?? 0}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#777487]">
                    No tracks found matching query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {data && (
          <div className="p-4 border-t border-[#EEEAF5] bg-[#FAF9FF]/40 flex items-center justify-between">
            <span className="text-xs text-[#777487]">
              Page {data.page} of {data.total_pages}
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 bg-white border border-[#EEEAF5] rounded-lg text-[#777487] hover:text-[#302C3F] disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= data.total_pages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 bg-white border border-[#EEEAF5] rounded-lg text-[#777487] hover:text-[#302C3F] disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Diagnostics Modal */}
      {showHealthModal && report && (
        <div className="fixed inset-0 z-50 bg-[#302C3F]/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full border border-[#EEEAF5] shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEEAF5]">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-[#8B75C9]" />
                <h3 className="font-bold text-[#302C3F]">Pipeline Preprocessing Summary</h3>
              </div>
              <button
                onClick={() => setShowHealthModal(false)}
                className="text-xs text-[#777487] hover:text-[#302C3F]"
              >
                Close
              </button>
            </div>
            <div className="space-y-3 text-xs text-[#777487]">
              <div>
                <h4 className="font-semibold text-[#302C3F] mb-1">Execution Steps:</h4>
                <ul className="list-disc pl-4 space-y-1">
                  {report.cleaning_steps_performed.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-[#FAF9FF] p-3 rounded-xl border border-[#EEEAF5]">
                <p className="font-semibold text-[#302C3F]">Initial Missing Breakdown:</p>
                {Object.keys(report.initial_state.missing_by_column).length > 0 ? (
                  Object.entries(report.initial_state.missing_by_column).map(([col, cnt]) => (
                    <p key={col} className="mt-0.5">
                      • {col}: {cnt} missing values
                    </p>
                  ))
                ) : (
                  <p className="mt-0.5 text-[#2A6B3E]">No missing values detected in raw input.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

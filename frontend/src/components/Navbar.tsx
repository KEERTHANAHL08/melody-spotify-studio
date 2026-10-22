import React, { useState } from 'react';
import { Search, RotateCw, Music2, Upload, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  currentTabName: string;
  totalTracks: number;
  onRefresh: () => void;
  onSelectTrackSearch?: (trackName: string) => void;
  onUploadSuccess?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTabName,
  totalTracks,
  onRefresh,
  onUploadSuccess
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    setUploadMsg(null);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Upload failed');
      setUploadMsg('Dataset updated successfully!');
      setTimeout(() => setUploadMsg(null), 4000);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err: any) {
      alert(err.message || 'Error uploading dataset');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-[#EEEAF5] sticky top-0 z-20 px-8 flex items-center justify-between shadow-[0_2px_8px_rgba(184,166,232,0.03)]">
      {/* Breadcrumb & Page Title */}
      <div className="flex items-center space-x-3">
        <span className="text-xs font-semibold text-[#8B75C9] uppercase tracking-wider bg-[#E9E1FA] px-2.5 py-1 rounded-full">
          Melody Studio
        </span>
        <span className="text-[#B8A6E8] text-sm">/</span>
        <h2 className="text-base font-bold text-[#302C3F] tracking-tight">{currentTabName}</h2>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        {/* Dataset Status Indicator */}
        <div className="flex items-center space-x-2 bg-[#DDF3E4] border border-[#C5E8D0] px-3 py-1.5 rounded-full text-xs text-[#2A6B3E] font-medium shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#2A6B3E]" />
          <span>Catalog: {totalTracks > 0 ? `${totalTracks.toLocaleString()} tracks` : 'Connected'}</span>
        </div>

        {/* Upload New CSV */}
        <label className="flex items-center space-x-1.5 text-xs font-medium text-[#777487] hover:text-[#8B75C9] bg-[#FAF9FF] hover:bg-[#E9E1FA] border border-[#EEEAF5] px-3 py-1.5 rounded-full cursor-pointer transition-colors shadow-sm">
          <Upload className="w-3.5 h-3.5" />
          <span>{isUploading ? 'Loading...' : 'Upload CSV'}</span>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isUploading}
          />
        </label>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          title="Reload data"
          className="p-2 rounded-full text-[#777487] hover:text-[#8B75C9] hover:bg-[#E9E1FA] transition-colors"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        {/* User / Studio Badge */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#B8A6E8] to-[#F7DCE8] flex items-center justify-center text-white font-bold text-xs shadow-sm ring-2 ring-white">
          <Music2 className="w-4 h-4 text-[#8B75C9]" />
        </div>
      </div>

      {uploadMsg && (
        <div className="absolute right-8 top-18 bg-[#DDF3E4] border border-[#2A6B3E]/20 text-[#2A6B3E] text-xs px-4 py-2 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2">
          {uploadMsg}
        </div>
      )}
    </header>
  );
};

import React from 'react';
import {
  LayoutDashboard,
  Database,
  BarChart3,
  Disc3,
  Network,
  Grid,
  Sparkles,
  Award,
  Info,
  Waves
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'dataset', label: 'Dataset Explorer', icon: Database },
  { id: 'insights', label: 'Music Insights', icon: BarChart3 },
  { id: 'genres', label: 'Genre Analysis', icon: Disc3 },
  { id: 'clusters', label: 'Cluster Explorer', icon: Network },
  { id: 'correlation', label: 'Correlation Matrix', icon: Grid },
  { id: 'recommendations', label: 'Song Recommendations', icon: Sparkles },
  { id: 'evaluation', label: 'Model Evaluation', icon: Award },
  { id: 'about', label: 'About Project', icon: Info },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="w-64 bg-white border-r border-[#EEEAF5] flex flex-col justify-between h-screen fixed left-0 top-0 z-30 select-none shadow-[2px_0_12px_rgba(184,166,232,0.06)]">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-[#EEEAF5] flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#B8A6E8] to-[#E9E1FA] flex items-center justify-center text-[#8B75C9] shadow-sm">
            <Waves className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#302C3F] tracking-tight leading-none">Melody</h1>
            <p className="text-xs text-[#8B75C9] font-medium tracking-wide mt-1">Spotify Genre Studio</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-170px)]">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 text-left ${
                  isActive
                    ? 'bg-[#E9E1FA] text-[#8B75C9] font-semibold shadow-sm'
                    : 'text-[#777487] hover:bg-[#FAF9FF] hover:text-[#302C3F]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#8B75C9]' : 'text-[#777487]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#EEEAF5] bg-[#FAF9FF]/60 mx-3 mb-3 rounded-2xl">
        <div className="flex items-center space-x-2 text-xs text-[#777487]">
          <div className="w-2 h-2 rounded-full bg-[#B8A6E8] animate-pulse" />
          <span className="font-medium text-[#302C3F]">Academic ML Project</span>
        </div>
        <p className="text-[11px] text-[#777487] mt-1">Unsupervised Audio Analytics</p>
      </div>
    </aside>
  );
};

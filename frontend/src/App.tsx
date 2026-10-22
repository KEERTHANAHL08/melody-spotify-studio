import React, { useState, useEffect } from 'react';
import { Sidebar, NAV_ITEMS } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { OverviewPage } from './pages/OverviewPage';
import { DatasetExplorerPage } from './pages/DatasetExplorerPage';
import { MusicInsightsPage } from './pages/MusicInsightsPage';
import { GenreAnalysisPage } from './pages/GenreAnalysisPage';
import { ClusterExplorerPage } from './pages/ClusterExplorerPage';
import { CorrelationMatrixPage } from './pages/CorrelationMatrixPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { ModelEvaluationPage } from './pages/ModelEvaluationPage';
import { AboutPage } from './pages/AboutPage';
import { OverviewData } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/overview');
      const json = await res.json();
      setOverviewData(json);
    } catch (err) {
      console.error('Error fetching overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const currentTabObj = NAV_ITEMS.find((n) => n.id === activeTab) || NAV_ITEMS[0];

  const renderActivePage = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPage data={overviewData} loading={loading} />;
      case 'dataset':
        return <DatasetExplorerPage />;
      case 'insights':
        return <MusicInsightsPage />;
      case 'genres':
        return <GenreAnalysisPage />;
      case 'clusters':
        return <ClusterExplorerPage />;
      case 'correlation':
        return <CorrelationMatrixPage />;
      case 'recommendations':
        return <RecommendationsPage />;
      case 'evaluation':
        return <ModelEvaluationPage />;
      case 'about':
        return <AboutPage />;
      default:
        return <OverviewPage data={overviewData} loading={loading} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9FF] relative">
      {/* Sidebar (Desktop left fixed navigation) */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area properly offset by padding-left so right edge is never cut */}
      <div className="pl-64 flex flex-col min-h-screen w-full box-border">
        <Navbar
          currentTabName={currentTabObj.label}
          totalTracks={overviewData?.kpis.total_tracks || 0}
          onRefresh={fetchOverview}
          onUploadSuccess={fetchOverview}
        />
        <main className="flex-1 pb-16 w-full box-border">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
};
export default App;

import React, { useState } from 'react';
import { SeoAnalysisResult, KeywordCluster, ContentRecommendation, CompetitorAnalysisResult } from '../types';
import { KeywordTable } from './KeywordTable';
import { ContentCards } from './ContentCards';
import { ClusterViz } from './ClusterViz';
import { ClusterCards } from './ClusterCards';
import { ContentOptimizer } from './ContentOptimizer';
import { DeepDiscoveryView } from './DeepDiscoveryView';
import { CompetitorAnalysisModal } from './CompetitorAnalysisModal';
import { analyzeCompetitors, generateMoreIdeas } from '../services/geminiService';
import { Activity, Database, Download, Layers, Microscope, TrendingUp, Loader2, List, Grid, PieChart, FileText, PenTool, Plus, AlertCircle } from 'lucide-react';

interface AnalysisDashboardProps {
  data: SeoAnalysisResult;
  topic: string;
  isDark?: boolean;
  onUpdateData: (newData: Partial<SeoAnalysisResult>) => void;
  language: string;
  platform: string;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ 
  data, 
  topic, 
  isDark = true, 
  onUpdateData,
  language,
  platform
}) => {
  const [activeTab, setActiveTab] = useState<'keywords' | 'clusters' | 'visual' | 'optimizer' | 'gaps' | 'strategy'>('keywords');
  
  // Competitor Analysis State
  const [competitorData, setCompetitorData] = useState<CompetitorAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingKeyword, setAnalyzingKeyword] = useState<string | null>(null);
  const [generatingMore, setGeneratingMore] = useState(false);
  
  // Local Error States
  const [actionError, setActionError] = useState<string | null>(null);

  const totalKeywords = data.clusters.reduce((acc, c) => acc + c.keywords.length, 0);
  const avgKd = Math.round(
    data.clusters.flatMap(c => c.keywords).reduce((acc, k) => acc + k.kd, 0) / totalKeywords || 0
  );

  // Determine top cluster by keyword count
  const topCluster = [...data.clusters].sort((a, b) => b.keywords.length - a.keywords.length)[0]?.name || "N/A";

  const handleCompetitorAnalysis = async (keyword: string) => {
    setIsAnalyzing(true);
    setAnalyzingKeyword(keyword);
    setActionError(null);
    try {
      const result = await analyzeCompetitors(keyword);
      setCompetitorData(result);
    } catch (e: any) {
      console.error(e);
      const isQuota = e?.message?.includes('429') || e?.message?.includes('quota');
      setActionError(isQuota 
        ? "Quota limit reached. Please try again later." 
        : "Analysis failed. Please try again.");
      
      // Clear error after 5 seconds
      setTimeout(() => setActionError(null), 5000);
    } finally {
      setIsAnalyzing(false);
      setAnalyzingKeyword(null);
    }
  };

  const handleGenerateMore = async () => {
    setGeneratingMore(true);
    setActionError(null);
    try {
        const existingClusters = data.clusters.map(c => c.name);
        const newData = await generateMoreIdeas(topic, existingClusters, language, platform);
        onUpdateData(newData);
    } catch (e: any) {
        console.error("Failed to generate more ideas", e);
        const isQuota = e?.message?.includes('429') || e?.message?.includes('quota');
        setActionError(isQuota 
          ? "Quota limit reached. Please wait a moment." 
          : "Failed to expand ideas. Please try again.");
          
        setTimeout(() => setActionError(null), 5000);
    } finally {
        setGeneratingMore(false);
    }
  };

  const exportToCsv = () => {
    const headers = ["Keyword", "Cluster", "Intent", "Volume", "KD", "Language"];
    const rows = data.clusters.flatMap(c => 
      c.keywords.map(k => [
        `"${k.term}"`, 
        `"${c.name}"`, 
        `"${k.intent}"`, 
        `"${k.volume}"`, 
        k.kd, 
        `"${k.language}"`
      ].join(","))
    );
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `seo_export_${topic.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full animate-fade-in relative">
      
      {/* Action Error Toast */}
      {actionError && (
        <div className="fixed bottom-6 right-6 z-[70] bg-red-100 dark:bg-red-900/80 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up backdrop-blur-md">
           <AlertCircle size={20} />
           <span className="font-medium">{actionError}</span>
        </div>
      )}

      {/* Global Loading Overlay for Competitor Analysis */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white dark:bg-charcoal p-6 rounded-xl border border-gray-200 dark:border-accent/20 flex flex-col items-center shadow-2xl">
            <Loader2 className="animate-spin text-blue-600 dark:text-accent mb-4" size={40} />
            <h3 className="text-gray-900 dark:text-white font-bold mb-1">Analyzing SERP Competitors</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-mono">"{analyzingKeyword}"</p>
          </div>
        </div>
      )}

      {/* Modal */}
      {competitorData && (
        <CompetitorAnalysisModal 
          data={competitorData} 
          onClose={() => setCompetitorData(null)} 
        />
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        
        {/* Keywords */}
        <div className="bg-white dark:bg-charcoal text-gray-900 dark:text-white p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 flex flex-col justify-between transition-colors">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-wider mb-2">
                <List size={14} /> Keywords
            </div>
            <div className="text-4xl font-extrabold">{totalKeywords}</div>
        </div>

        {/* Difficulty */}
        <div className="bg-white dark:bg-charcoal text-gray-900 dark:text-white p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 flex flex-col justify-between transition-colors">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-wider mb-2">
                <Activity size={14} /> Difficulty
            </div>
            <div className="flex items-baseline gap-3">
                <div className="text-4xl font-extrabold">{avgKd}</div>
                <div className={`px-2 py-1 rounded text-xs font-bold ${
                    avgKd > 60 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 
                    avgKd > 30 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                }`}>
                    {avgKd > 60 ? 'Hard' : avgKd > 30 ? 'Medium' : 'Easy'}
                </div>
            </div>
        </div>

        {/* Top Cluster */}
        <div className="bg-white dark:bg-charcoal text-gray-900 dark:text-white p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 flex flex-col justify-between transition-colors">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-wider mb-2">
                <Layers size={14} /> Top Cluster
            </div>
            <div className="text-lg font-bold leading-tight">{topCluster}</div>
        </div>

        {/* Export Action */}
        <div className="bg-gray-800 dark:bg-charcoal p-6 rounded-xl shadow-lg border border-gray-700 dark:border-gray-800 flex flex-col items-center justify-center gap-3 text-center transition-colors">
             <button 
                onClick={exportToCsv}
                className="flex flex-col items-center gap-2 group"
             >
                <div className="p-3 bg-gray-700 dark:bg-gray-800 rounded-full group-hover:bg-gray-600 dark:group-hover:bg-gray-700 transition-colors">
                    <Download className="text-white" size={24} />
                </div>
                <span className="text-white font-bold text-sm">Export CSV</span>
             </button>
        </div>

      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-charcoal rounded-t-xl border-b border-gray-200 dark:border-gray-800 mb-6 sticky top-0 z-10 overflow-x-auto shadow-sm transition-colors">
        <div className="flex px-2">
            <TabButton active={activeTab === 'keywords'} onClick={() => setActiveTab('keywords')} label="All Keywords" />
            <TabButton active={activeTab === 'clusters'} onClick={() => setActiveTab('clusters')} label="Topic Clusters" />
            <TabButton active={activeTab === 'visual'} onClick={() => setActiveTab('visual')} label="Visual Map" />
            <TabButton active={activeTab === 'optimizer'} onClick={() => setActiveTab('optimizer')} label="Content Optimizer" />
            <TabButton active={activeTab === 'gaps'} onClick={() => setActiveTab('gaps')} label="Gaps & Questions" />
            <TabButton active={activeTab === 'strategy'} onClick={() => setActiveTab('strategy')} label="Content Strategy" />
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[600px] mb-8">

        {activeTab === 'keywords' && (
          <KeywordTable clusters={data.clusters} onAnalyze={handleCompetitorAnalysis} />
        )}

        {activeTab === 'clusters' && (
           <ClusterCards clusters={data.clusters} />
        )}

        {activeTab === 'visual' && (
           <div className="h-[700px] w-full bg-white dark:bg-charcoal rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden relative shadow-inner transition-colors">
              <ClusterViz clusters={data.clusters} topic={topic} isDark={isDark} />
           </div>
        )}

        {activeTab === 'optimizer' && (
           <ContentOptimizer clusters={data.clusters} />
        )}
        
        {activeTab === 'gaps' && data.deepDiscovery && (
            <DeepDiscoveryView data={data.deepDiscovery} />
        )}

        {activeTab === 'strategy' && (
          <ContentCards recommendations={data.recommendations} />
        )}
      </div>

      {/* Generate More Options Button */}
      <div className="flex flex-col items-center justify-center pb-8 animate-fade-in gap-3">
        <button 
           onClick={handleGenerateMore}
           disabled={generatingMore}
           className={`flex items-center gap-2 px-6 py-3 bg-white dark:bg-charcoal border rounded-lg text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm hover:shadow disabled:opacity-70 disabled:cursor-not-allowed ${
             actionError ? 'border-red-300 dark:border-red-800' : 'border-gray-200 dark:border-gray-700'
           }`}
        >
           {generatingMore ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
           {generatingMore ? "Scouting for more ideas..." : "Generate More Ideas"}
        </button>
        
        {actionError && (
          <span className="text-xs text-red-500 font-medium animate-pulse">{actionError}</span>
        )}
      </div>

    </div>
  );
};

// Sub-components for AnalysisDashboard

const TabButton = ({ active, onClick, label, icon }: any) => (
  <button
    onClick={onClick}
    className={`px-6 py-4 font-bold text-sm transition-colors relative flex items-center gap-2 whitespace-nowrap ${
      active ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
    }`}
  >
    {icon}
    {label}
  </button>
);
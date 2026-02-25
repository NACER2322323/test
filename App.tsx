import React, { useState, useEffect, useRef } from 'react';
import { analyzeSeo } from './services/geminiService';
import { SeoAnalysisResult } from './types';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Search, Loader2, Settings, History, X, Trash2, ArrowUpRight, ChevronDown, Sparkles, Sun, Moon } from 'lucide-react';

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState('English');
  const [platform, setPlatform] = useState('Google');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SeoAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // API Key State
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  // Search History State
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize Theme
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      // Default to dark
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }

    // Initialize API Key
    const key = localStorage.getItem('GEMINI_API_KEY');
    const envKey = process.env.API_KEY; 
    
    if ((envKey && envKey.length > 0) || (key && key.length > 0)) {
        setHasKey(true);
    } else {
        setShowApiKeyModal(true);
    }

    // Load History
    const savedHistory = localStorage.getItem('seo_search_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleSaveKey = (key: string) => {
    localStorage.setItem('GEMINI_API_KEY', key);
    setHasKey(true);
    setShowApiKeyModal(false);
  };

  const addToHistory = (term: string) => {
    const cleanTerm = term.trim();
    if (!cleanTerm) return;
    
    // Remove duplicates and keep top 8
    const newHistory = [cleanTerm, ...history.filter(h => h.toLowerCase() !== cleanTerm.toLowerCase())].slice(0, 8);
    setHistory(newHistory);
    localStorage.setItem('seo_search_history', JSON.stringify(newHistory));
  };

  const removeFromHistory = (e: React.MouseEvent, termToRemove: string) => {
    e.stopPropagation(); // Stop click from bubbling
    e.preventDefault(); // Prevent blur
    const newHistory = history.filter(h => h !== termToRemove);
    setHistory(newHistory);
    localStorage.setItem('seo_search_history', JSON.stringify(newHistory));
  };

  const clearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setHistory([]);
    localStorage.removeItem('seo_search_history');
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    if (!hasKey) {
        setShowApiKeyModal(true);
        return;
    }

    addToHistory(topic);
    setShowHistory(false);
    setLoading(true);
    setError(null);
    setResult(null);
    searchInputRef.current?.blur();

    try {
      const data = await analyzeSeo(topic, language, platform);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      const isQuota = err?.message?.includes('429') || err?.message?.includes('quota') || err?.status === 429;
      
      const msg = isQuota 
        ? "API Quota Exceeded. The system retried automatically but the limit persists. Please try again in a few minutes or check your plan."
        : "Failed to generate intelligence. Please check your API key and try again.";
      
      setError(msg);

      if (err instanceof Error && err.message.includes("API Key")) {
        setShowApiKeyModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateResult = (newData: Partial<SeoAnalysisResult>) => {
    setResult(prev => {
      if (!prev) return null;
      return {
        ...prev,
        // Append new clusters and recommendations
        clusters: [...prev.clusters, ...(newData.clusters || [])],
        recommendations: [...prev.recommendations, ...(newData.recommendations || [])],
        // Merge deep discovery items
        deepDiscovery: {
          ...prev.deepDiscovery,
          peopleAlsoAsk: [...(prev.deepDiscovery.peopleAlsoAsk || []), ...(newData.deepDiscovery?.peopleAlsoAsk || [])],
          matrix: [...(prev.deepDiscovery.matrix || []), ...(newData.deepDiscovery?.matrix || [])],
          painPoints: prev.deepDiscovery.painPoints, // Usually simpler to keep original pain points or replace if explicitly requested
          discussions: prev.deepDiscovery.discussions
        },
        // Merge Sources
        sources: [...(prev.sources || []), ...(newData.sources || [])]
      };
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
        setShowHistory(false);
        searchInputRef.current?.blur();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-obsidian text-gray-900 dark:text-gray-100 font-sans selection:bg-accent selection:text-obsidian transition-colors duration-300">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      <ApiKeyModal 
        isOpen={showApiKeyModal} 
        onSave={handleSaveKey} 
        onClose={() => setShowApiKeyModal(false)}
        hasKey={hasKey}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:py-12">
        
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className={`${result ? 'hidden md:block opacity-50 hover:opacity-100 transition-opacity' : ''}`}>
            <h1 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent" />
              NorthStar <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">Intelligence</span>
            </h1>
          </div>
          
          <div className="absolute top-4 right-4 md:static flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-white transition-all shadow-sm"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            <button 
              onClick={() => setShowApiKeyModal(true)}
              className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-white transition-all group shadow-sm"
              title="Configure API Access"
            >
              <Settings className="group-hover:rotate-90 transition-transform duration-500" size={18} />
            </button>
          </div>
        </header>

        {/* Search Input Section */}
        <div className={`transition-all duration-500 ${result ? 'mb-8' : 'mb-24 flex flex-col items-center justify-center min-h-[40vh]'}`}>
          
          {/* Main Search Container */}
          <form onSubmit={handleSearch} className={`w-full max-w-4xl relative group ${result ? '' : 'transform scale-105'}`}>
             <div className="absolute -inset-1 bg-gradient-to-r from-accent to-primary rounded-xl opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
             
             <div className="relative flex flex-col md:flex-row items-stretch md:items-center bg-white dark:bg-charcoal rounded-xl shadow-2xl overflow-visible p-1 z-20 border border-gray-100 dark:border-gray-800">
                
                {/* Search Input */}
                <div className="flex-grow flex items-center px-2 py-2 md:py-0 relative">
                    <Search className="text-gray-400 ml-2 shrink-0" size={20} />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      onFocus={() => setShowHistory(true)}
                      onClick={() => setShowHistory(true)}
                      onKeyDown={handleKeyDown}
                      onBlur={() => {
                        // Small delay to allow click events on history items to fire
                        setTimeout(() => setShowHistory(false), 200);
                      }}
                      placeholder="Enter keyword or topic..."
                      className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white px-3 py-3 text-lg placeholder-gray-400 dark:placeholder-gray-500 font-medium h-14"
                      autoComplete="off"
                    />
                    
                     {/* Search History Dropdown */}
                    {showHistory && history.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-charcoal border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-30 animate-fade-in mx-2">
                          <div className="flex justify-between items-center px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                              <span className="text-[10px] font-mono uppercase text-gray-500 font-bold tracking-wider flex items-center gap-1">
                                <History size={10} /> Recent
                              </span>
                              <button 
                                  onClick={clearHistory}
                                  className="text-[10px] text-red-400 hover:text-red-500 flex items-center gap-1 uppercase font-mono tracking-wider transition-colors"
                              >
                                  <Trash2 size={10} /> Clear
                              </button>
                          </div>
                          <ul className="max-h-60 overflow-y-auto custom-scrollbar">
                              {history.map((term, i) => (
                                  <li key={i} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                                      <div 
                                          className="group flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                                          onClick={(e) => {
                                              e.preventDefault(); 
                                              setTopic(term);
                                              setShowHistory(false);
                                              // Optional: Auto-search when clicking history? 
                                              // Let's keep it as fill-input for now to allow changing filters
                                          }}
                                      >
                                          <div className="flex items-center gap-3 overflow-hidden">
                                              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{term}</span>
                                          </div>
                                          <button
                                              onClick={(e) => removeFromHistory(e, term)}
                                              className="text-gray-300 dark:text-gray-600 hover:text-red-400 dark:hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-all"
                                              title="Remove from history"
                                          >
                                              <X size={14} />
                                          </button>
                                      </div>
                                  </li>
                              ))}
                          </ul>
                      </div>
                    )}
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px h-8 bg-gray-200 dark:bg-gray-700 mx-2"></div>
                <div className="block md:hidden h-px w-full bg-gray-200 dark:bg-gray-700 my-1"></div>

                {/* Filters */}
                <div className="flex items-center gap-2 p-2">
                   {/* Language Dropdown */}
                   <div className="relative group/lang">
                      <select 
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="appearance-none bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium py-3 pl-4 pr-8 rounded-lg outline-none cursor-pointer transition-colors border border-gray-200 dark:border-gray-700 text-sm"
                      >
                        <option value="English">English</option>
                        <option value="French">Français</option>
                        <option value="Arabic">العربية</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                   </div>

                   {/* Platform Dropdown */}
                   <div className="relative group/plat">
                      <select 
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="appearance-none bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium py-3 pl-4 pr-8 rounded-lg outline-none cursor-pointer transition-colors border border-gray-200 dark:border-gray-700 text-sm"
                      >
                        <option value="Google">Google</option>
                        <option value="YouTube">YouTube</option>
                        <option value="TikTok">TikTok</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                   </div>

                   {/* Submit Button */}
                   <button 
                      type="submit" 
                      disabled={loading || !topic}
                      className="bg-primary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-primary/20 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                      <span>Analyze</span>
                    </button>
                </div>
             </div>
          </form>

          {/* Intro Text if no result */}
          {!result && !loading && (
             <p className="mt-8 text-gray-500 dark:text-gray-400 max-w-md text-center">
               Discover keywords, clusters, and content gaps in seconds with AI-powered grounding.
             </p>
          )}

          {/* Loading State */}
          {loading && (
            <div className="mt-8 text-center space-y-2 animate-fade-in">
              <div className="flex justify-center gap-1">
                 {[0, 150, 300].map(d => (
                   <div key={d} className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{animationDelay: `${d}ms`}} />
                 ))}
              </div>
              <p className="text-sm font-mono text-accent">Scraping {platform} signals in {language}...</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Calculating KD via 0.4(Ref) + 0.3(DA) + 0.3(OnPage)</p>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm text-center font-medium">
              {error}
            </div>
          )}
        </div>

        {/* Results Dashboard */}
        {result && !loading && (
          <AnalysisDashboard 
            data={result} 
            topic={topic} 
            isDark={theme === 'dark'} 
            onUpdateData={handleUpdateResult}
            language={language}
            platform={platform}
          />
        )}

      </div>
    </div>
  );
};

export default App;
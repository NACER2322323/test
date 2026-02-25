import React, { useState, useMemo } from 'react';
import { KeywordCluster } from '../types';
import { CheckCircle, Circle, Type, FileEdit } from 'lucide-react';

interface ContentOptimizerProps {
  clusters: KeywordCluster[];
}

export const ContentOptimizer: React.FC<ContentOptimizerProps> = ({ clusters }) => {
  const [content, setContent] = useState('');

  // Flatten and dedup keywords, sorting by length (desc) to match longer phrases first if needed, 
  // or just by relevance. Let's stick to the order provided or simple sort.
  const allKeywords = useMemo(() => {
    const terms = new Set<string>();
    const result: string[] = [];
    clusters.forEach(c => {
      c.keywords.forEach(k => {
        const lower = k.term.toLowerCase();
        if (!terms.has(lower)) {
          terms.add(lower);
          result.push(k.term);
        }
      });
    });
    return result; 
  }, [clusters]);

  const matches = useMemo(() => {
    const text = content.toLowerCase();
    return allKeywords.filter(kw => text.includes(kw.toLowerCase()));
  }, [content, allKeywords]);

  const score = allKeywords.length > 0 
    ? Math.round((matches.length / allKeywords.length) * 100) 
    : 0;

  return (
    <div className="bg-white dark:bg-charcoal rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col md:flex-row h-[700px] animate-fade-in transition-colors">
      {/* Editor Section */}
      <div className="flex-1 p-6 flex flex-col border-r border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileEdit size={18} className="text-gray-500 dark:text-gray-400" />
            Content Editor
          </h3>
          <div className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
            score > 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
            score > 40 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 
            'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}>
            Optimization Score: {score}%
          </div>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste your content here or start writing... The tool will check off keywords from the list on the right as you type."
          className="flex-1 w-full resize-none outline-none text-gray-700 dark:text-gray-200 leading-relaxed text-lg placeholder-gray-300 dark:placeholder-gray-600 p-2 bg-transparent"
          spellCheck={false}
        />
      </div>

      {/* Sidebar */}
      <div className="w-full md:w-80 bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-800">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-charcoal transition-colors">
          <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm uppercase tracking-wider mb-1">Target Keywords</h4>
          <div className="text-xs text-gray-500 dark:text-gray-400">{matches.length} of {allKeywords.length} keywords used</div>
        </div>
        <div className="overflow-y-auto flex-1 p-4 space-y-3 custom-scrollbar">
          {allKeywords.map((kw) => {
             const isUsed = matches.includes(kw);
             return (
               <div key={kw} className={`flex justify-between items-center p-3 rounded-lg border transition-all duration-300 ${
                 isUsed ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/50 shadow-sm' : 'bg-white dark:bg-charcoal border-gray-200 dark:border-gray-800'
               }`}>
                 <span className={`text-sm font-medium truncate pr-2 ${isUsed ? 'text-green-800 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                   {kw}
                 </span>
                 {isUsed ? (
                   <CheckCircle size={18} className="text-green-500 shrink-0" />
                 ) : (
                   <Circle size={18} className="text-gray-300 dark:text-gray-600 shrink-0" />
                 )}
               </div>
             )
          })}
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { CompetitorAnalysisResult } from '../types';
import { X, Trophy, AlertTriangle, Layers, Zap } from 'lucide-react';

interface CompetitorAnalysisModalProps {
  data: CompetitorAnalysisResult;
  onClose: () => void;
}

export const CompetitorAnalysisModal: React.FC<CompetitorAnalysisModalProps> = ({ data, onClose }) => {
  
  const getScoreColor = (score: number, max: number = 5) => {
    const pct = score / max;
    if (pct >= 0.8) return 'text-green-600 dark:text-accent';
    if (pct >= 0.5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-500 dark:text-red-400';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-charcoal w-full max-w-4xl max-h-[90vh] rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl flex flex-col overflow-hidden relative transition-colors">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start bg-gray-50 dark:bg-gray-900/50">
          <div>
            <div className="text-xs font-mono text-blue-600 dark:text-accent mb-1">COMPETITOR INTELLIGENCE</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {data.keyword}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Top Section: KD & Narrative */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center text-center">
               <div className="text-sm text-gray-500 dark:text-gray-400 font-mono mb-2">KEYWORD DIFFICULTY</div>
               <div className="relative w-32 h-32 flex items-center justify-center">
                 <svg className="w-full h-full transform -rotate-90">
                   <circle cx="64" cy="64" r="56" className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="8" fill="transparent" />
                   <circle 
                     cx="64" cy="64" r="56" 
                     stroke={data.kdScore > 70 ? '#f87171' : data.kdScore > 40 ? '#facc15' : '#00ff9d'} 
                     strokeWidth="8" 
                     fill="transparent" 
                     strokeDasharray={351.86} 
                     strokeDashoffset={351.86 - (351.86 * data.kdScore) / 100}
                   />
                 </svg>
                 <span className="absolute text-3xl font-bold text-gray-900 dark:text-white">{data.kdScore}</span>
               </div>
               <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                 Formula: 0.4(Ref) + 0.3(DA) + 0.3(OnPage)
               </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-4 rounded-xl">
                 <h4 className="flex items-center gap-2 font-bold text-blue-700 dark:text-blue-400 mb-2">
                   <Zap size={16} /> Strategy Summary
                 </h4>
                 <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{data.summary}</p>
                 <div className="mt-3 pt-3 border-t border-blue-100 dark:border-blue-900/30">
                   <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-300 mr-2">TL;DR:</span>
                   <span className="text-xs text-gray-600 dark:text-gray-400 italic">{data.tldr}</span>
                 </div>
              </div>
              <div className="bg-white dark:bg-charcoal p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                <h4 className="font-bold text-gray-900 dark:text-gray-200 mb-2 text-sm">Strategic Narrative</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{data.strategyNarrative}</p>
              </div>
            </div>
          </div>

          {/* Competitor Table */}
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
               <Trophy size={18} className="text-yellow-500" />
               Top 5 Ranking Pages
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-900 text-xs text-gray-500 dark:text-gray-500 uppercase font-mono border-b border-gray-200 dark:border-gray-800">
                    <th className="px-6 py-3">Competitor</th>
                    <th className="px-6 py-3 text-center">Depth</th>
                    <th className="px-6 py-3 text-center">E-E-A-T</th>
                    <th className="px-6 py-3 text-center">Tech</th>
                    <th className="px-6 py-3 text-center">DA</th>
                    <th className="px-6 py-3 text-center">OnPage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {data.competitors.map((comp, i) => (
                    <tr key={i} className="hover:bg-white dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white line-clamp-1 max-w-[200px]">{comp.title}</div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 truncate max-w-[200px]">{comp.url}</div>
                      </td>
                      <td className={`px-6 py-4 text-center font-bold ${getScoreColor(comp.contentDepth)}`}>
                        {comp.contentDepth}/5
                      </td>
                      <td className={`px-6 py-4 text-center font-bold ${getScoreColor(comp.eeat)}`}>
                        {comp.eeat}/5
                      </td>
                      <td className={`px-6 py-4 text-center font-bold ${getScoreColor(comp.techSpeed)}`}>
                        {comp.techSpeed}/5
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-300 font-mono">
                        {comp.domainAuthority}
                      </td>
                      <td className={`px-6 py-4 text-center font-bold ${getScoreColor(comp.onPageScore)}`}>
                        {comp.onPageScore}/5
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gaps Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GapCard 
              title="Information Gaps" 
              icon={<Layers size={18} className="text-purple-500 dark:text-purple-400"/>}
              items={data.gaps.information}
            />
            <GapCard 
              title="Structural Weaknesses" 
              icon={<AlertTriangle size={18} className="text-red-500 dark:text-red-400"/>}
              items={data.gaps.structural}
            />
            <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
               <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                 <span className="text-green-600 dark:text-green-400">$</span> Monetization Gap
               </h4>
               <p className="text-sm text-gray-600 dark:text-gray-300">{data.gaps.monetization}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const GapCard = ({ title, icon, items }: { title: string, icon: React.ReactNode, items: string[] }) => (
  <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
    <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
      {icon} {title}
    </h4>
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 items-start text-sm text-gray-600 dark:text-gray-400">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 mt-1.5 shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  </div>
);
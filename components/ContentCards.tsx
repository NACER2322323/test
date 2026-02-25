import React, { useState } from 'react';
import { ContentRecommendation } from '../types';
import { ShieldCheck, Zap, BookOpen, PenTool, Layout, FileText, Sparkles, List, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

interface ContentCardsProps {
  recommendations: ContentRecommendation[];
}

export const ContentCards: React.FC<ContentCardsProps> = ({ recommendations }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      {recommendations.map((rec, i) => (
        <div 
          key={i} 
          className={`bg-white dark:bg-charcoal rounded-xl border transition-all duration-300 overflow-hidden ${
             expandedIndex === i 
               ? 'border-blue-200 dark:border-blue-900 shadow-lg' 
               : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md'
          }`}
        >
          {/* Card Header (Always Visible) */}
          <div 
             onClick={() => toggleExpand(i)}
             className="p-6 cursor-pointer flex items-center justify-between"
          >
             <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                   <Badge type={rec.type} />
                   <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-mono">
                      {rec.funnelStage || 'TOFU'}
                   </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight pr-8">
                   {rec.title}
                </h3>
             </div>
             
             <div className={`w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 transition-transform duration-300 ${expandedIndex === i ? 'rotate-90 bg-blue-50 dark:bg-blue-900/30 text-blue-500' : ''}`}>
                <ArrowRight size={18} />
             </div>
          </div>

          {/* Expanded Content */}
          {expandedIndex === i && (
             <div className="px-6 pb-6 pt-0 animate-fade-in border-t border-gray-100 dark:border-gray-800">
                <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
                   
                   {/* Left Col: AI Answer */}
                   <div className="lg:col-span-2 space-y-4">
                      <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-charcoal p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-3 opacity-10">
                            <Sparkles className="text-blue-600 dark:text-blue-400" size={60} />
                         </div>
                         <h4 className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wider relative z-10">
                            <Sparkles size={12} /> Optimized Direct Answer (SGE)
                         </h4>
                         <p className="text-gray-700 dark:text-gray-300 text-sm font-medium leading-relaxed relative z-10">
                            "{rec.aiAnswer}"
                         </p>
                      </div>

                      <div>
                         <h4 className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
                            <List size={12} /> Content Outline
                         </h4>
                         <ul className="space-y-2">
                            {rec.outline.map((item, idx) => (
                               <li key={idx} className="flex gap-2 items-start text-sm text-gray-600 dark:text-gray-400">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                                  {item}
                               </li>
                            ))}
                         </ul>
                      </div>
                   </div>

                   {/* Right Col: Scores */}
                   <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 h-fit">
                      <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">
                         Predictive Performance
                      </h4>
                      <div className="space-y-4">
                         <ScoreRow label="Content Depth" score={rec.score.depth} />
                         <ScoreRow label="E-E-A-T Signals" score={rec.score.eeat} />
                         <ScoreRow label="Tech Feasibility" score={rec.score.techSpeed} />
                      </div>
                   </div>

                </div>
             </div>
          )}
        </div>
      ))}
    </div>
  );
};

const Badge = ({ type }: { type: string }) => {
  return (
    <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
      {type}
    </span>
  );
};

const ScoreRow = ({ label, score }: { label: string, score: number }) => (
   <div>
      <div className="flex justify-between text-xs mb-1">
         <span className="text-gray-600 dark:text-gray-400 font-medium">{label}</span>
         <span className="font-bold text-gray-900 dark:text-white">{score}/5</span>
      </div>
      <div className="flex gap-1 h-1.5">
         {[1, 2, 3, 4, 5].map((val) => (
            <div 
               key={val} 
               className={`flex-1 rounded-full ${val <= score ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`} 
            />
         ))}
      </div>
   </div>
);
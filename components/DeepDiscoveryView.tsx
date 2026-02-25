import React from 'react';
import { DeepDiscoveryData } from '../types';
import { HelpCircle, Target, Plus, MessageCircle, AlertTriangle, ArrowUpRight } from 'lucide-react';

interface DeepDiscoveryViewProps {
  data: DeepDiscoveryData;
}

export const DeepDiscoveryView: React.FC<DeepDiscoveryViewProps> = ({ data }) => {
  return (
    <div className="space-y-8 animate-fade-in pb-8">
      
      {/* Cards Row: PAA and Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* People Also Ask */}
        <div>
           <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <HelpCircle size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">People Also Ask</h3>
           </div>
           <div className="space-y-3">
             {data.peopleAlsoAsk?.map((question, i) => (
                <div key={i} className="bg-white dark:bg-charcoal p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-start gap-3 hover:shadow-md transition-all group">
                   <HelpCircle className="text-blue-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" size={18} />
                   <span className="text-gray-700 dark:text-gray-200 font-medium leading-snug">{question}</span>
                </div>
             )) || (
               <div className="text-gray-500 italic text-sm p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                 No questions found. Re-run analysis to generate.
               </div>
             )}
           </div>
        </div>

        {/* Content Gaps */}
        <div>
           <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                <Target size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Content Gaps</h3>
           </div>
           <div className="space-y-3">
             {data.painPoints.map((gap, i) => (
                <div key={i} className="bg-white dark:bg-charcoal p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-start gap-3 hover:shadow-md transition-all group">
                   <Target className="text-red-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" size={18} />
                   <span className="text-gray-700 dark:text-gray-200 font-medium leading-snug">{gap}</span>
                </div>
             ))}
           </div>
        </div>

      </div>

      {/* Matrix Table (Secondary Data) */}
      <div className="bg-white dark:bg-charcoal rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm mt-8 transition-colors">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/30">
            <div className="flex items-center gap-2">
                <MessageCircle className="text-gray-500 dark:text-gray-400" size={18} />
                <h3 className="font-bold text-gray-800 dark:text-gray-200">Deep Discovery Matrix (Long-Tail)</h3>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                {data.matrix.length} signals detected
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white dark:bg-charcoal text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold border-b border-gray-100 dark:border-gray-800">
                <th className="p-4">Keyword</th>
                <th className="p-4">Intent</th>
                <th className="p-4">Trend</th>
                <th className="p-4">Pain Point addressed</th>
                <th className="p-4">Funnel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {data.matrix.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="p-4 font-bold text-gray-800 dark:text-gray-200">
                    {row.term}
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {row.intent}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-mono">
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                      {row.searchTrend.toLowerCase().includes('rising') && <ArrowUpRight size={14} className="text-green-500" />}
                      {row.searchTrend}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs">{row.painPoint}</td>
                  <td className="p-4">
                    <FunnelBadge stage={row.funnelStage} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

const FunnelBadge = ({ stage }: { stage: string }) => {
  let colorClass = "";
  switch (stage) {
    case 'Awareness': colorClass = "text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30"; break;
    case 'Consideration': colorClass = "text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30"; break;
    case 'Conversion': colorClass = "text-green-600 dark:text-green-300 bg-green-50 dark:bg-green-900/30"; break;
    case 'Retention': colorClass = "text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/30"; break;
    default: colorClass = "text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800";
  }

  return (
    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${colorClass}`}>
      {stage}
    </span>
  );
};
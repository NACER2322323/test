import React from 'react';
import { KeywordCluster } from '../types';
import { FileText } from 'lucide-react';

interface KeywordTableProps {
  clusters: KeywordCluster[];
  onAnalyze: (keyword: string) => void;
}

export const KeywordTable: React.FC<KeywordTableProps> = ({ clusters, onAnalyze }) => {
  const allKeywords = clusters.flatMap(cluster => 
    cluster.keywords.map(k => ({ 
      ...k, 
      clusterName: cluster.name,
      relevance: cluster.businessRelevance 
    }))
  ).sort((a, b) => b.kd - a.kd); // Sort by difficulty descending for list

  const getIntentColor = (intent: string) => {
    const i = intent.toLowerCase();
    if (i.includes('informational')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
    if (i.includes('commercial')) return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300';
    if (i.includes('transactional')) return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  };

  const getKdColor = (kd: number) => {
    if (kd >= 60) return 'bg-red-500';
    if (kd >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white dark:bg-charcoal rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white dark:bg-charcoal text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
              <th className="p-4 w-12 text-center">#</th>
              <th className="p-4">Keyword</th>
              <th className="p-4 w-32">Intent</th>
              <th className="p-4 w-32">Vol</th>
              <th className="p-4 w-40">KD %</th>
              <th className="p-4 w-48">Cluster</th>
              <th className="p-4 w-24 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {allKeywords.map((k, i) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                <td className="p-4 text-center text-sm text-gray-400 dark:text-gray-600">{i + 1}</td>
                
                <td className="p-4">
                    <span className="font-bold text-gray-800 dark:text-gray-200 block text-sm">{k.term}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{k.language}</span>
                </td>
                
                <td className="p-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide ${getIntentColor(k.intent)}`}>
                    {k.intent.split(' ')[0]}
                  </span>
                </td>
                
                <td className="p-4 text-sm text-gray-600 dark:text-gray-400 font-mono">
                    {k.volume}
                </td>
                
                <td className="p-4">
                  <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300 w-6">{k.kd}</span>
                      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                             className={`h-full rounded-full ${getKdColor(k.kd)}`} 
                             style={{width: `${k.kd}%`}} 
                          />
                      </div>
                  </div>
                </td>
                
                <td className="p-4 text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                  {k.clusterName}
                </td>
                
                <td className="p-4 text-right">
                  <button 
                    onClick={() => onAnalyze(k.term)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    <FileText size={14} />
                    Brief
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
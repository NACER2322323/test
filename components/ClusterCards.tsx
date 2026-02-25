import React from 'react';
import { KeywordCluster } from '../types';
import { Layers } from 'lucide-react';

interface ClusterCardsProps {
  clusters: KeywordCluster[];
}

export const ClusterCards: React.FC<ClusterCardsProps> = ({ clusters }) => {
  const getPotentialLabel = (relevance: number) => {
    if (relevance >= 4) return { label: 'HIGH POTENTIAL', color: 'text-gray-400 dark:text-gray-500' };
    if (relevance >= 2.5) return { label: 'MEDIUM POTENTIAL', color: 'text-gray-400 dark:text-gray-500' };
    return { label: 'LOW POTENTIAL', color: 'text-gray-400 dark:text-gray-500' };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clusters.map((cluster, index) => {
        const potential = getPotentialLabel(cluster.businessRelevance);
        
        return (
          <div key={index} className="bg-white dark:bg-charcoal rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-all relative">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                <Layers size={24} />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${potential.color}`}>
                {potential.label}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight">
              {cluster.name}
            </h3>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed line-clamp-3 min-h-[60px]">
              {cluster.description || "No description available for this cluster."}
            </p>
            
            <div className="flex items-center text-sm font-bold text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
              {cluster.keywords.length} keywords
            </div>
          </div>
        );
      })}
    </div>
  );
};
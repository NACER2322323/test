import React from 'react';
import { FileText, Link as LinkIcon } from 'lucide-react';

interface ExecutiveSummaryProps {
  text: string;
  sources: { title: string; uri: string }[];
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ text, sources }) => {
  return (
    <div className="bg-charcoal p-6 rounded-xl border border-gray-800 shadow-lg relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-accent" />
      <div className="flex items-start gap-4">
        <div className="p-3 bg-gray-900 rounded-lg text-primary">
          <FileText size={24} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white mb-2 font-mono">Executive Intelligence</h2>
          <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-gray-100 max-w-none">
            <p className="leading-relaxed whitespace-pre-line">{text}</p>
          </div>
          
          {sources.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-800">
              <h4 className="text-xs font-mono uppercase text-gray-500 mb-2">Validated Sources</h4>
              <div className="flex flex-wrap gap-2">
                {sources.map((s, i) => (
                  <a 
                    key={i} 
                    href={s.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 bg-blue-900/20 px-2 py-1 rounded transition-colors"
                  >
                    <LinkIcon size={10} />
                    <span className="truncate max-w-[150px]">{s.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
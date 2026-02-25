import React, { useState, useEffect } from 'react';
import { Key, ShieldCheck, X, Check } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (key: string) => void;
  onClose: () => void;
  hasKey: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave, onClose, hasKey }) => {
  const [apiKey, setApiKey] = useState('');

  // Reset input when modal opens
  useEffect(() => {
    if (isOpen) setApiKey('');
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-charcoal w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl relative overflow-hidden transition-colors">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
           <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
             <Key className="text-blue-500" size={20} />
             Configure API Access
           </h2>
        </div>

        <div className="p-6 space-y-4">
           <p className="text-sm text-gray-600 dark:text-gray-400">
             Enter your Gemini API Key to enable AI features.
           </p>

           <div className="space-y-2">
             <label className="text-xs font-mono text-gray-500 dark:text-gray-400 uppercase">Gemini API Key</label>
             <input 
               type="password" 
               value={apiKey}
               onChange={(e) => setApiKey(e.target.value)}
               placeholder="AIzaSy..."
               className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-mono text-sm transition-all placeholder-gray-400 dark:placeholder-gray-600"
             />
           </div>

           <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-lg p-3 flex gap-3 items-start">
              <ShieldCheck className="text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" size={16} />
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                Your key is stored securely in your browser's local storage. It is never sent to any third-party server.
              </p>
           </div>
        </div>

        <div className="p-6 pt-0 flex justify-end gap-3">
          {hasKey && (
            <button 
              onClick={onClose}
              className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium text-sm transition-colors"
            >
              Cancel
            </button>
          )}
          <button 
            onClick={() => {
                if(apiKey.trim()) onSave(apiKey.trim());
            }}
            disabled={!apiKey.trim()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Check size={16} />
            Save Key
          </button>
        </div>
      </div>
    </div>
  );
};
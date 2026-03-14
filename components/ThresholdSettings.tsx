
import React from 'react';
import { Thresholds } from '../types';

interface Props {
  thresholds: Thresholds;
  onThresholdChange: (newThresholds: Thresholds) => void;
}

const ThresholdSettings: React.FC<Props> = ({ thresholds, onThresholdChange }) => {
  const handleChange = (category: string, key: string, value: number) => {
    const updated = { ...thresholds };
    if (category === 'difficulty') {
      (updated.difficulty as any)[key] = value;
    } else if (category === 'discrimination') {
      (updated.discrimination as any)[key] = value;
    } else if (category === 'general') {
      (updated as any)[key] = value;
    }
    onThresholdChange(updated);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-slate-100 p-2 rounded-lg">
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Analysis Thresholds</h3>
          <p className="text-[10px] text-slate-400">Fine-tune psychometric sensitivity</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-500 uppercase">Min Difficulty (p)</label>
          <div className="flex items-center gap-4">
            <input 
              type="range" min="0" max="1" step="0.05" 
              value={thresholds.difficulty.min} 
              onChange={(e) => handleChange('difficulty', 'min', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-sm font-mono font-bold text-slate-700 w-10">{thresholds.difficulty.min.toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-500 uppercase">Max Difficulty (p)</label>
          <div className="flex items-center gap-4">
            <input 
              type="range" min="0" max="1" step="0.05" 
              value={thresholds.difficulty.max} 
              onChange={(e) => handleChange('difficulty', 'max', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-sm font-mono font-bold text-slate-700 w-10">{thresholds.difficulty.max.toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-500 uppercase">Min Discrimination (D)</label>
          <div className="flex items-center gap-4">
            <input 
              type="range" min="-0.5" max="1" step="0.05" 
              value={thresholds.discrimination.min} 
              onChange={(e) => handleChange('discrimination', 'min', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-sm font-mono font-bold text-slate-700 w-10">{thresholds.discrimination.min.toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-500 uppercase">Group Rank % (for D)</label>
          <div className="flex items-center gap-4">
            <input 
              type="range" min="0.05" max="0.5" step="0.01" 
              value={thresholds.groupPercentage} 
              onChange={(e) => handleChange('general', 'groupPercentage', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-sm font-mono font-bold text-slate-700 w-10">{Math.round(thresholds.groupPercentage * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThresholdSettings;

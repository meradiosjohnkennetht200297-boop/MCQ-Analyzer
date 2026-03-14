
import React from 'react';
import { TestReliability } from '../types';

interface Props {
  reliability: TestReliability;
  flaggedCount: number;
}

const StatCard: React.FC<{ label: string; value: string | number; subtext?: string; color: string; tooltip?: string }> = ({ label, value, subtext, color, tooltip }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative group" title={tooltip}>
    <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
    <div className={`text-3xl font-bold ${color}`}>{value}</div>
    {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
    {tooltip && (
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
        {tooltip}
      </div>
    )}
  </div>
);

const DashboardOverview: React.FC<Props> = ({ reliability, flaggedCount }) => {
  const getReliabilityColor = (val: number) => {
    if (val >= 0.8) return 'text-emerald-600';
    if (val >= 0.6) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getReliabilityText = (val: number) => {
    if (val >= 0.8) return 'Excellent';
    if (val >= 0.7) return 'Good';
    if (val >= 0.6) return 'Acceptable';
    return 'Poor';
  };

  return (
    <div className="space-y-8 mb-8">
      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard 
          label="Reliability (KR-20)" 
          value={reliability.kr20.toFixed(3)} 
          subtext={getReliabilityText(reliability.kr20)}
          color={getReliabilityColor(reliability.kr20)}
          tooltip="KR-20: Uses item-level difficulty. More accurate for heterogeneous tests."
        />
        <StatCard 
          label="Reliability (KR-21)" 
          value={reliability.kr21.toFixed(3)} 
          subtext={getReliabilityText(reliability.kr21)}
          color={getReliabilityColor(reliability.kr21)}
          tooltip="KR-21: Assumes equal item difficulty. Useful as a lower-bound estimate."
        />
        <StatCard 
          label="N (Students)" 
          value={reliability.studentCount} 
          subtext={`Total items: ${reliability.itemCount}`}
          color="text-blue-600"
        />
        <StatCard 
          label="Avg. Difficulty (p)" 
          value={reliability.avgDifficulty.toFixed(2)} 
          color="text-slate-900"
        />
        <StatCard 
          label="Avg. Discrimination (D)" 
          value={reliability.avgDiscrimination.toFixed(2)} 
          subtext="Higher is better"
          color="text-slate-900"
        />
      </div>

      {/* Descriptive Statistics Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Descriptive Statistics (Sample Size N={reliability.studentCount})</h3>
          <span className="text-[10px] text-slate-400 font-mono">Sample SD calculated with n-1</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 divide-x divide-y md:divide-y-0 divide-slate-100">
          <div className="p-4 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Mean</p>
            <p className="text-lg font-bold text-slate-800">{reliability.meanScore.toFixed(1)}</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Median</p>
            <p className="text-lg font-bold text-slate-800">{reliability.medianScore.toFixed(1)}</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Mode</p>
            <p className="text-lg font-bold text-slate-800">{reliability.modeScore.join(', ') || '-'}</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Sample SD</p>
            <p className="text-lg font-bold text-slate-800">{reliability.stdDev.toFixed(2)}</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Min</p>
            <p className="text-lg font-bold text-slate-800">{reliability.minScore}</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Max</p>
            <p className="text-lg font-bold text-slate-800">{reliability.maxScore}</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Range</p>
            <p className="text-lg font-bold text-slate-800">{reliability.range}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;

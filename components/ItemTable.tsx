
import React from 'react';
import { ItemAnalysis } from '../types';

interface Props {
  items: ItemAnalysis[];
}

const ItemTable: React.FC<Props> = ({ items }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Item Analysis Matrix</h3>
          <p className="text-xs text-slate-500 mt-1">Detailed psychometric metrics for each question</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 sticky left-0 bg-slate-50">Item ID</th>
              <th className="px-6 py-4 text-center">Key</th>
              <th className="px-6 py-4 text-right">Difficulty (p)</th>
              <th className="px-6 py-4 text-right">Discrim. (D)</th>
              <th className="px-6 py-4">Top Distractors</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => {
              // Extract top 2 distractors
              // Fixed: Explicitly cast to number and avoid destructuring in sort signature to prevent arithmetic type errors
              const topDistractors = Object.entries(item.distractorCounts)
                .sort((a, b) => (b[1] as number) - (a[1] as number))
                .slice(0, 2)
                .map(([opt, count]) => `${opt} (${count})`);

              return (
                <tr key={item.itemId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 sticky left-0 bg-white">
                    {item.itemId}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                      {item.correctAnswer || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-slate-900 font-semibold">
                    {(item.difficultyIndex ?? 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-slate-900 font-semibold">
                    <span className={item.discriminationIndex < 0 ? 'text-rose-600 bg-rose-50 px-1 rounded' : ''}>
                      {(item.discriminationIndex ?? 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {topDistractors.length > 0 ? topDistractors.join(', ') : <span className="text-slate-300 italic">None</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {item.flags.length === 0 ? (
                        <span className="text-emerald-600 text-[10px] font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-tighter">
                          Healthy
                        </span>
                      ) : (
                        item.flags.map((flag, idx) => (
                          <span key={idx} className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-100 text-[9px] font-bold uppercase whitespace-nowrap">
                            {flag}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ItemTable;
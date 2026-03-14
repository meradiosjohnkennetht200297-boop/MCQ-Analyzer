
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis, Cell, AreaChart, Area, ReferenceLine } from 'recharts';
import { ItemAnalysis, Thresholds } from '../types';

interface Props {
  items: ItemAnalysis[];
  thresholds: Thresholds;
}

const Visualizations: React.FC<Props> = ({ items, thresholds }) => {
  // Prep data for density plot (difficulty distribution)
  // We use 10 bins to create a smoother curve for the "density" look
  const bins = 10;
  const densityData = Array.from({ length: bins }, (_, i) => {
    const rangeStart = i / bins;
    const rangeEnd = (i + 1) / bins;
    const count = items.filter(item => item.difficultyIndex >= rangeStart && item.difficultyIndex < rangeEnd).length;
    return {
      name: `${rangeStart.toFixed(1)}-${rangeEnd.toFixed(1)}`,
      count,
      mid: (rangeStart + rangeEnd) / 2
    };
  });

  const scatterData = items.map(item => ({
    x: item.difficultyIndex,
    y: item.discriminationIndex,
    id: item.itemId
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Difficulty Density Plot */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-900">Difficulty Density</h3>
          <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase">Item Spread</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={densityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{stroke: '#3b82f6', strokeWidth: 1}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorCount)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-slate-400 mt-4 text-center italic">The curve shows the frequency of items at different difficulty levels.</p>
      </div>

      {/* Discrimination Scatter Plot */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-900">Discrimination vs. Difficulty</h3>
          <span className="text-[10px] font-bold bg-purple-50 text-purple-600 px-2 py-0.5 rounded uppercase">Quadrant Analysis</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Difficulty" 
                unit="p" 
                domain={[0, 1]} 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => val.toFixed(2)}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Discrimination" 
                unit="D" 
                domain={[-0.5, 1]} 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => val.toFixed(2)}
              />
              <ZAxis range={[100, 100]} />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => value.toFixed(2)}
              />
              {/* Threshold Lines */}
              <ReferenceLine x={thresholds.difficulty.min} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: 'Min Diff', position: 'insideTopLeft', fontSize: 8, fill: '#94a3b8' }} />
              <ReferenceLine x={thresholds.difficulty.max} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: 'Max Diff', position: 'insideTopRight', fontSize: 8, fill: '#94a3b8' }} />
              <ReferenceLine y={thresholds.discrimination.min} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: 'Min Discrim', position: 'insideRight', fontSize: 8, fill: '#94a3b8' }} />
              
              <Scatter name="Items" data={scatterData}>
                {scatterData.map((entry, index) => {
                  const isDifficultyValid = entry.x >= thresholds.difficulty.min && entry.x <= thresholds.difficulty.max;
                  const isDiscriminationValid = entry.y >= thresholds.discrimination.min;
                  const isValid = isDifficultyValid && isDiscriminationValid;
                  
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={isValid ? '#10b981' : '#f43f5e'} 
                      fillOpacity={0.6} 
                    />
                  );
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-slate-400 mt-4 text-center italic">High discrimination (Top Right) is ideal for all difficulty levels.</p>
      </div>
    </div>
  );
};

export default Visualizations;

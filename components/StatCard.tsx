
import React from 'react';
import { COLORS } from '../constants';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: string;
  icon: React.ReactNode;
  trendColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, unit, trend, icon, trendColor }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-blue-500/30 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-slate-800/50 rounded-lg group-hover:text-blue-400 transition-colors">
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${trendColor || 'bg-slate-800 text-slate-400'}`}>
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold tracking-tight text-white">{value}</span>
        {unit && <span className="text-slate-500 text-sm">{unit}</span>}
      </div>
    </div>
  );
};

export default StatCard;

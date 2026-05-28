import React from 'react';

const StatsCard = ({ label, value, icon: Icon, color, trend }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
          {trend && (
            <p className={`text-xs font-medium mt-2 flex items-center ${trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              <span className={`mr-1 px-1 rounded ${trend > 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
              vs last week
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;

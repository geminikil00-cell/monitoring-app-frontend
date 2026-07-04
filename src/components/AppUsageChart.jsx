import React, { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../context/AuthContext';
import dataService from '../services/dataService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { Clock, ChevronDown } from 'lucide-react';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f5'];
const PAGE_SIZE = 100;

const AppUsageChart = ({ deviceId }) => {
  const { token } = useAuthContext();
  const [data, setData] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchUsage = useCallback(async (skip, append = false) => {
    if (!token || !deviceId) return;
    setIsLoading(true);
    try {
      const res = await dataService.getAppUsage(token, skip, PAGE_SIZE, deviceId);
      if (res.data.length < PAGE_SIZE) setHasMore(false);
      setData(prev => append ? [...prev, ...res.data] : res.data);
    } catch (error) {
      console.error('Error loading app usage:', error);
    } finally {
      setIsLoading(false);
      setInitialLoading(false);
    }
  }, [token, deviceId]);

  useEffect(() => {
    if (deviceId && token) {
      setData([]);
      setHasMore(true);
      setInitialLoading(true);
      fetchUsage(0, false);
    }
  }, [deviceId, token, fetchUsage]);

  const loadMore = () => fetchUsage(data.length, true);

  if (initialLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 italic">
        No usage data available for this period.
      </div>
    );
  }

  const chartData = data.map(item => ({
    name: item.app_name,
    minutes: Math.max(1, Math.ceil(item.duration / 60))
  })).sort((a, b) => b.minutes - a.minutes).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-80 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="minutes" radius={[6, 6, 0, 0]} barSize={40}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <h3 className="font-bold text-slate-800 tracking-tight">All Usage Records</h3>
          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full border border-indigo-100">
            {data.length} Records
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {data.map((item, index) => (
            <div key={index} className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900">{item.app_name}</h4>
                <p className="text-xs text-slate-400">{item.package_name}</p>
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                {Math.max(1, Math.ceil(item.duration / 60))} min
              </div>
            </div>
          ))}
        </div>
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="px-10 py-4 bg-white hover:bg-slate-50 text-slate-900 rounded-3xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center border border-slate-200 shadow-sm"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin mr-3"></div>
                Loading...
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Load More Records
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default AppUsageChart;

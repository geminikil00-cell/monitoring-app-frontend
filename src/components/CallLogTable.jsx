import React, { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../context/AuthContext';
import dataService from '../services/dataService';
import { PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, Calendar, ChevronDown } from 'lucide-react';

const PAGE_SIZE = 100;

function CallLogTable({ deviceId }) {
  const { token } = useAuthContext();
  const [callLogs, setCallLogs] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchCalls = useCallback(async (skip, append = false) => {
    if (!token || !deviceId) return;
    setIsLoading(true);
    try {
      const res = await dataService.getCallLogs(token, skip, PAGE_SIZE, deviceId);
      if (res.data.length < PAGE_SIZE) setHasMore(false);
      setCallLogs(prev => append ? [...prev, ...res.data] : res.data);
    } catch (error) {
      console.error('Error loading call logs:', error);
    } finally {
      setIsLoading(false);
      setInitialLoading(false);
    }
  }, [token, deviceId]);

  useEffect(() => {
    if (deviceId && token) {
      setCallLogs([]);
      setHasMore(true);
      setInitialLoading(true);
      fetchCalls(0, false);
    }
  }, [deviceId, token, fetchCalls]);

  const loadMore = () => fetchCalls(callLogs.length, true);

  const getIcon = (type) => {
    switch (type) {
      case 1: return <PhoneIncoming className="w-4 h-4 text-blue-500" />;
      case 2: return <PhoneOutgoing className="w-4 h-4 text-emerald-500" />;
      default: return <PhoneMissed className="w-4 h-4 text-red-500" />;
    }
  };

  const getLabel = (type) => {
    switch (type) {
      case 1: return 'Incoming';
      case 2: return 'Outgoing';
      default: return 'Missed';
    }
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case 1: return 'bg-blue-50 text-blue-700 border-blue-100';
      case 2: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default: return 'bg-red-50 text-red-700 border-red-100';
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!callLogs || callLogs.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 border-dashed">
        <PhoneIncoming className="w-12 h-12 text-slate-200 mx-auto mb-4" />
        <p className="text-slate-500 font-medium">No call logs found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact / Number</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {callLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mr-3 group-hover:bg-white transition-colors font-bold uppercase">
                        {log.name ? log.name[0] : (log.number ? log.number[0] : '#')}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{log.name || 'Unknown'}</div>
                        <div className="text-xs text-slate-500">{log.number}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-bold ${getBadgeColor(log.type)}`}>
                      <span className="mr-1.5">{getIcon(log.type)}</span>
                      {getLabel(log.type)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-slate-600">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      {log.duration}s
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-slate-500">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      {new Date(log.date < 10000000000 ? log.date * 1000 : log.date).toLocaleString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                Load More Calls
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default CallLogTable;

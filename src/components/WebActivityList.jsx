import React, { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../context/AuthContext';
import dataService from '../services/dataService';
import { ExternalLink, Clock, Globe, ChevronDown } from 'lucide-react';

const PAGE_SIZE = 100;

const WebActivityList = ({ deviceId }) => {
  const { token } = useAuthContext();
  const [activity, setActivity] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchActivity = useCallback(async (skip, append = false) => {
    if (!token || !deviceId) return;
    setIsLoading(true);
    try {
      const res = await dataService.getWebActivity(token, skip, PAGE_SIZE, deviceId);
      if (res.data.length < PAGE_SIZE) setHasMore(false);
      setActivity(prev => append ? [...prev, ...res.data] : res.data);
    } catch (error) {
      console.error('Error loading web activity:', error);
    } finally {
      setIsLoading(false);
      setInitialLoading(false);
    }
  }, [token, deviceId]);

  useEffect(() => {
    if (deviceId && token) {
      setActivity([]);
      setHasMore(true);
      setInitialLoading(true);
      fetchActivity(0, false);
    }
  }, [deviceId, token, fetchActivity]);

  const loadMore = () => fetchActivity(activity.length, true);

  if (initialLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!activity || activity.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 border-dashed">
        <Globe className="w-12 h-12 text-slate-200 mx-auto mb-4" />
        <p className="text-slate-500 font-medium">No browsing activity recorded yet.</p>
        <p className="text-sm text-slate-400 mt-1">Activity from the child's browser will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <h3 className="font-bold text-slate-800 tracking-tight">Web History</h3>
          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full border border-indigo-100">
            {activity.length} Sites Loaded
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {activity.map((site, index) => (
            <div key={index} className="p-4 hover:bg-slate-50/50 transition-colors group">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-200">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                      {site.title || site.url}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 break-all max-w-xl">{site.url}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(site.visit_time < 10000000000 ? site.visit_time * 1000 : site.visit_time).toLocaleString()}
                  </div>
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
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
                Load More History
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default WebActivityList;

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../context/AuthContext';
import dataService from '../services/dataService';
import { LayoutGrid, Calendar, ChevronDown } from 'lucide-react';

const PAGE_SIZE = 100;

function InstalledAppList({ deviceId }) {
  const { token } = useAuthContext();
  const [apps, setApps] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp);
    return date.toLocaleDateString();
  };

  const fetchApps = useCallback(async (skip, append = false) => {
    if (!token || !deviceId) return;
    setIsLoading(true);
    try {
      const res = await dataService.getInstalledApps(token, skip, PAGE_SIZE, deviceId);
      if (res.data.length < PAGE_SIZE) setHasMore(false);
      setApps(prev => append ? [...prev, ...res.data] : res.data);
    } catch (error) {
      console.error('Error loading installed apps:', error);
    } finally {
      setIsLoading(false);
      setInitialLoading(false);
    }
  }, [token, deviceId]);

  useEffect(() => {
    if (deviceId && token) {
      setApps([]);
      setHasMore(true);
      setInitialLoading(true);
      fetchApps(0, false);
    }
  }, [deviceId, token, fetchApps]);

  const loadMore = () => fetchApps(apps.length, true);

  if (initialLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Installed Applications</h3>
            <p className="text-sm text-slate-500 mt-1 font-medium">Inventory of all software on the device</p>
          </div>
          <div className="p-3 bg-pink-50 rounded-2xl text-pink-600">
            <LayoutGrid className="w-6 h-6" />
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.length === 0 ? (
            <div className="col-span-full p-20 text-center text-slate-400">
              <LayoutGrid className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-bold tracking-widest text-xs uppercase">No applications synced yet</p>
            </div>
          ) : (
            apps.map((app) => (
              <div key={app.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-indigo-500/30 hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <LayoutGrid className="w-6 h-6" />
                  </div>
                </div>
                <h4 className="text-base font-black text-slate-900 line-clamp-1">{app.app_name}</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">{app.package_name}</p>

                <div className="mt-6 pt-6 border-t border-slate-100 flex items-center text-slate-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-[11px] font-black uppercase tracking-wider">Installed: {formatDate(app.install_date)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {hasMore && !initialLoading && apps.length > 0 && (
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
                Load More Apps
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default InstalledAppList;

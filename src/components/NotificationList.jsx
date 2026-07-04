import React, { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../context/AuthContext';
import dataService from '../services/dataService';
import { Bell, Clock, ChevronDown } from 'lucide-react';

const PAGE_SIZE = 100;

function NotificationList({ deviceId }) {
  const { token } = useAuthContext();
  const [notifications, setNotifications] = useState([]);
  const [apps, setApps] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp);
    return date.toLocaleString();
  };

  const getAppInfo = (packageName) => {
    if (!apps) return { name: packageName, initial: packageName[0] ? packageName[0].toUpperCase() : '?' };
    const app = apps.find(a => a.package_name === packageName);
    if (app) {
      return { name: app.app_name, initial: app.app_name[0] ? app.app_name[0].toUpperCase() : '?' };
    }
    return { name: packageName, initial: packageName[0] ? packageName[0].toUpperCase() : '?' };
  };

  const fetchApps = useCallback(async () => {
    if (!token || !deviceId) return;
    try {
      const res = await dataService.getInstalledApps(token, 0, 500, deviceId);
      setApps(res.data);
    } catch (error) {
      console.error('Error loading apps for notifications:', error);
    }
  }, [token, deviceId]);

  const fetchNotifications = useCallback(async (skip, append = false) => {
    if (!token || !deviceId) return;
    setIsLoading(true);
    try {
      const res = await dataService.getNotifications(token, skip, PAGE_SIZE, deviceId);
      if (res.data.length < PAGE_SIZE) setHasMore(false);
      setNotifications(prev => append ? [...prev, ...res.data] : res.data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
      setInitialLoading(false);
    }
  }, [token, deviceId]);

  useEffect(() => {
    if (deviceId && token) {
      setNotifications([]);
      setApps([]);
      setHasMore(true);
      setInitialLoading(true);
      fetchApps();
      fetchNotifications(0, false);
    }
  }, [deviceId, token, fetchApps, fetchNotifications]);

  const loadMore = () => fetchNotifications(notifications.length, true);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500">
      <div className="p-8 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Notifications Log</h3>
          <p className="text-sm text-slate-500 mt-1 font-medium">Real-time stream of device notifications</p>
        </div>
        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
          <Bell className="w-6 h-6" />
        </div>
      </div>

      {initialLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-20 text-center text-slate-400">
          <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="font-bold tracking-widest text-xs uppercase">No notifications captured yet</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
          {notifications.map((notif) => {
            const appInfo = getAppInfo(notif.package_name);
            return (
              <div key={notif.id} className="p-6 hover:bg-slate-50 transition-colors group">
                <div className="flex items-start">
                  <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 flex items-center justify-center font-bold text-lg shadow-sm">
                    {appInfo.initial}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-black text-slate-900">{notif.title || 'Untitled Notification'}</h4>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center uppercase tracking-widest">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTime(notif.post_time)}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-indigo-600 mt-1 uppercase tracking-tight">{appInfo.name}</p>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed line-clamp-2">{notif.text}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasMore && !initialLoading && notifications.length > 0 && (
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
                Load More Notifications
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default NotificationList;

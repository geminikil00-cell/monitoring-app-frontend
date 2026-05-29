import React from 'react';
import { Bell, Clock, Smartphone } from 'lucide-react';

function NotificationList({ notifications, apps }) {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getAppInfo = (packageName) => {
    if (!apps) return { name: packageName, initial: packageName[0].toUpperCase() };
    const app = apps.find(a => a.package_name === packageName);
    if (app) {
      return { name: app.app_name, initial: app.app_name[0].toUpperCase() };
    }
    return { name: packageName, initial: packageName[0].toUpperCase() };
  };

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
      
      <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-20 text-center text-slate-400">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-bold tracking-widest text-xs uppercase">No notifications captured yet</p>
          </div>
        ) : (
          notifications.map((notif) => {
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
          })
        )}
      </div>
    </div>
  );
}

export default NotificationList;

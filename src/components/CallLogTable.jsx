import React from 'react';
import { PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, Calendar } from 'lucide-react';

function CallLogTable({ callLogs }) {
  if (!callLogs || callLogs.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 border-dashed">
        <PhoneIncoming className="w-12 h-12 text-slate-200 mx-auto mb-4" />
        <p className="text-slate-500 font-medium">No call logs found.</p>
      </div>
    );
  }

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

  return (
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
                      <div className="font-bold text-slate-900">{log.name || log.number}</div>
                      {log.name && <div className="text-xs text-slate-500">{log.number}</div>}
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
                    {new Date(log.date).toLocaleString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CallLogTable;

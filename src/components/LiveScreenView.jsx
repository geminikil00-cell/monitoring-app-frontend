import React, { useState, useEffect, useRef } from 'react';
import dataService from '../services/dataService';
import { useAuthContext } from '../context/AuthContext';
import { Monitor, Camera, Mic, RefreshCw, AlertCircle, Play } from 'lucide-react';

export default function LiveScreenView({ selectedDevice, toggles }) {
  const { token } = useAuthContext();
  const [screenSrc, setScreenSrc] = useState(null);
  const [cameraSrc, setCameraSrc] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioError, setAudioError] = useState(null);
  
  const screenIntervalRef = useRef(null);
  const cameraIntervalRef = useRef(null);
  const audioIntervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const nextAudioTimeRef = useRef(0);

  // Screen Polling
  useEffect(() => {
    if (!selectedDevice || !token || !toggles?.screen) return;
    
    screenIntervalRef.current = setInterval(async () => {
      try {
        const res = await dataService.getLiveFrameBlob(selectedDevice.id, token);
        if (res && res.status === 200 && res.data.size > 0) {
          const objUrl = URL.createObjectURL(res.data);
          setScreenSrc(prev => { if (prev) URL.revokeObjectURL(prev); return objUrl; });
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          // silently fail for polling 404s
        } else {
          console.error(err);
        }
      }
    }, 1500);

    return () => clearInterval(screenIntervalRef.current);
  }, [selectedDevice, token, toggles?.screen]);

  // Camera Polling
  useEffect(() => {
    if (!selectedDevice || !token || !toggles?.camera) return;
    
    cameraIntervalRef.current = setInterval(async () => {
      try {
        const res = await dataService.getLiveCameraBlob(selectedDevice.id, token);
        if (res && res.status === 200 && res.data.size > 0) {
          const objUrl = URL.createObjectURL(res.data);
          setCameraSrc(prev => { if (prev) URL.revokeObjectURL(prev); return objUrl; });
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          // silently fail for polling 404s
        } else {
          console.error(err);
        }
      }
    }, 500);

    return () => clearInterval(cameraIntervalRef.current);
  }, [selectedDevice, token, toggles?.camera]);

  // Audio Playback
  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    setIsAudioPlaying(true);
    setAudioError(null);
    nextAudioTimeRef.current = audioContextRef.current.currentTime;
    
    audioIntervalRef.current = setInterval(async () => {
      if (!selectedDevice || !token) return;
      try {
        const res = await dataService.getLiveAudioBlob(selectedDevice.id, token);
        if (res && res.status === 200 && res.data.size > 0) {
          const arrayBuffer = await res.data.arrayBuffer();
          audioContextRef.current.decodeAudioData(arrayBuffer, (buffer) => {
            const source = audioContextRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContextRef.current.destination);
            
            const currentTime = audioContextRef.current.currentTime;
            const playTime = Math.max(currentTime, nextAudioTimeRef.current);
            source.start(playTime);
            nextAudioTimeRef.current = playTime + buffer.duration;
            setAudioError(null);
          }, (err) => {
             // Decode error can happen if format isn't supported natively
             setAudioError("Unsupported audio format or empty buffer");
          });
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          // silently fail
        } else {
          console.error(err);
        }
      }
    }, 1000);
  };

  
  const stopAudio = () => {
    setIsAudioPlaying(false);
    if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.suspend();
    }
  };

  useEffect(() => {
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  useEffect(() => {
    if (toggles && !toggles.mic) {
      stopAudio();
    }
  }, [toggles?.mic]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Screen Feed */}
      <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-800">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center text-white">
            <Monitor className="w-5 h-5 mr-3 text-indigo-400" />
            <h3 className="font-bold tracking-widest uppercase text-sm">Screen Feed</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] text-emerald-500 font-bold tracking-widest uppercase">Live Polling</span>
          </div>
        </div>
        <div className="aspect-video bg-black flex items-center justify-center relative">
          {screenSrc ? (
            <img src={screenSrc} alt="Screen Feed" className="max-w-full max-h-full object-contain" />
          ) : (
            <div className="text-center text-slate-500">
              <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin opacity-50" />
              <p className="text-xs uppercase tracking-widest font-bold">Waiting for Screen Feed...</p>
              <p className="text-[10px] mt-2 opacity-60">Start feed using the controls above</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera Feed */}
        <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-800">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
            <div className="flex items-center text-white">
              <Camera className="w-5 h-5 mr-3 text-purple-400" />
              <h3 className="font-bold tracking-widest uppercase text-sm">Camera Feed</h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-emerald-500 font-bold tracking-widest uppercase">Live Polling</span>
            </div>
          </div>
          <div className="aspect-square md:aspect-video bg-black flex items-center justify-center relative">
            {cameraSrc ? (
              <img src={cameraSrc} alt="Camera Feed" className="max-w-full max-h-full object-cover" />
            ) : (
              <div className="text-center text-slate-500">
                <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin opacity-50" />
                <p className="text-xs uppercase tracking-widest font-bold">Waiting for Camera Feed...</p>
                <p className="text-[10px] mt-2 opacity-60">Start feed using the controls above</p>
              </div>
            )}
          </div>
        </div>

        {/* Audio Feed */}
        <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
            <div className="flex items-center text-white">
              <Mic className="w-5 h-5 mr-3 text-rose-400" />
              <h3 className="font-bold tracking-widest uppercase text-sm">Microphone Feed</h3>
            </div>
          </div>
          <div className="flex-1 p-8 flex flex-col items-center justify-center bg-black relative">
             
             {!isAudioPlaying ? (
               <button 
                 onClick={initAudio}
                 className="w-24 h-24 rounded-full bg-rose-600/20 text-rose-500 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all group"
               >
                 <Play className="w-10 h-10 ml-2 group-hover:scale-110 transition-transform" />
               </button>
             ) : (
               <div className="text-center">
                 <div className="flex justify-center items-center space-x-2 mb-8 h-16">
                   <div className="w-3 h-12 bg-rose-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                   <div className="w-3 h-16 bg-rose-400 rounded-full animate-bounce" style={{animationDelay: '100ms'}}></div>
                   <div className="w-3 h-8 bg-rose-600 rounded-full animate-bounce" style={{animationDelay: '200ms'}}></div>
                   <div className="w-3 h-14 bg-rose-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                   <div className="w-3 h-10 bg-rose-400 rounded-full animate-bounce" style={{animationDelay: '400ms'}}></div>
                 </div>
                 
                 <button 
                   onClick={stopAudio}
                   className="px-6 py-2 bg-slate-800 text-slate-300 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-slate-700 transition-colors"
                 >
                   Stop Listening
                 </button>
               </div>
             )}
             
             {isAudioPlaying && !audioError && (
               <p className="absolute bottom-6 text-[10px] text-emerald-500 font-bold uppercase tracking-widest animate-pulse">
                 Live Audio Active
               </p>
             )}
             
             {audioError && (
               <p className="absolute bottom-6 text-[10px] text-rose-500 font-bold uppercase tracking-widest flex items-center">
                 <AlertCircle className="w-3 h-3 mr-1" /> {audioError}
               </p>
             )}
             
             {!isAudioPlaying && (
               <p className="absolute bottom-6 text-[10px] text-slate-600 font-bold uppercase tracking-widest text-center px-4">
                 Browser requires interaction to play audio. Click play to start polling.
               </p>
             )}
          </div>
        </div>
      </div>

    </div>
  );
}

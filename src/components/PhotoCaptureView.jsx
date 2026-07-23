import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Camera, Radio, Download, X, Calendar } from 'lucide-react';
import dataService from '../services/dataService';
import { useAuthContext } from '../context/AuthContext';
import VirtualizedPhotoGrid from './VirtualizedPhotoGrid';

const KNOWN_CATEGORIES = ['camera', 'snapchat', 'whatsapp', 'instagram', 'telegram', 'messenger', 'screenshot', 'remote_camera', 'gallery'];
const CATEGORY_LABELS = {
  camera: 'Camera', snapchat: 'Snapchat', whatsapp: 'WhatsApp', instagram: 'Instagram',
  telegram: 'Telegram', messenger: 'Messenger', screenshot: 'Screenshot',
  remote_camera: 'Remote Capture', gallery: 'Gallery',
};
const PHOTOS_PER_PAGE = 40;
const REFRESH_INTERVAL = 3000;

const MAX_PHOTOS = 200;

function PhotoCaptureView({ deviceId, toggles, setToggles }) {
  const { token } = useAuthContext();
  const [feedCategory, setFeedCategory] = useState('All');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [cameraFacing, setCameraFacing] = useState('FRONT');
  const [status, setStatus] = useState(null);
  const seenIds = useRef(new Set());
  const prevDeviceId = useRef(deviceId);

  if (prevDeviceId.current !== deviceId) {
    prevDeviceId.current = deviceId;
    seenIds.current = new Set();
    mediaFiles.length = 0;
  }

  const fetchCapturedPhotos = useCallback(async () => {
    if (!token || !deviceId) return;
    try {
      const res = await dataService.getDeviceMedia(token, deviceId, 0, PHOTOS_PER_PAGE, null);
      const fresh = (res.data || []).sort((a, b) => (b.id || 0) - (a.id || 0));
      let hasNew = false;
      const merge = [];
      for (const f of fresh) {
        if (!seenIds.current.has(f.id)) { seenIds.current.add(f.id); hasNew = true; }
        merge.push(f);
      }
      if (hasNew || mediaFiles.length === 0) {
        setMediaFiles([...merge].slice(0, MAX_PHOTOS));
      }
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  }, [token, deviceId]);

  useEffect(() => {
    seenIds.current = new Set();
    setMediaFiles([]);
    fetchCapturedPhotos();
    const interval = setInterval(fetchCapturedPhotos, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [deviceId, token]);

  const showStatus = (message, type) => {
    setStatus({ message, type });
    setTimeout(() => setStatus(null), 5000);
  };

  const handleTakePhoto = async () => {
    if (!deviceId) return;
    try {
      await dataService.sendCommandPayload(token, deviceId, 'TAKE_PHOTO', cameraFacing);
      showStatus('Photo capture requested. It will appear below.', 'success');
    } catch (e) { showStatus('Failed to send command.', 'error'); }
  };

  const handleScreenshot = async () => {
    if (!deviceId) return;
    try {
      await dataService.sendCommand(token, deviceId, 'TAKE_SCREENSHOT');
      showStatus('Screenshot requested. It will appear below.', 'success');
    } catch (e) { showStatus('Failed to send screenshot command.', 'error'); }
  };

  const filteredPhotos = (mediaFiles || []).filter((file) => {
    const isImage = file.file_type?.startsWith('image/') ||
      file.file_type === 'IMAGE' ||
      (file.file_name || file.s3_key || '').match(/\.(jpg|jpeg|png|gif|webp)$/i);
    const isVideo = file.file_type?.startsWith('video/') ||
      (file.file_name || file.s3_key || '').match(/\.(mp4|mov|avi|webm|3gp)$/i);
    const isMedia = isImage || isVideo;
    const isCameraPhoto = file.category !== 'screenshot' && file.category !== 'gallery';
    return isMedia && isCameraPhoto && (feedCategory === 'All' || file.category === feedCategory);
  });

  const getThumbnailUrl = (img) => {
    if (!img.url || img.url.startsWith('/')) return getFullImageUrl(img.s3_key);
    return img.url;
  };

  const getFullImageUrl = (s3Key) => {
    if (!s3Key) return '';
    if (s3Key.startsWith('http')) return s3Key;
    const base = (import.meta.env.VITE_API_URL || 'https://monitoring.joclass.com/api/v1')
      .replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
    return `${base}/static/${s3Key.replace(/^\//, '')}`;
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts < 1e12 ? ts * 1000 : ts);
    return d.toLocaleString();
  };

  const activeCategories = ['All', ...KNOWN_CATEGORIES.filter(cat =>
    feedCategory === 'All' || mediaFiles.some(f => f.category === cat) || cat === feedCategory
  )];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {status && (
        <div className={`px-6 py-3 rounded-2xl text-sm font-bold ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
          {status.message}
        </div>
      )}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Photo Capture</h3>
            <p className="text-sm text-slate-500 mt-1 font-medium">Photos captured by the child device from any app</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-xl bg-slate-100 p-1">
              <button onClick={() => setCameraFacing('FRONT')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${cameraFacing === 'FRONT' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Front</button>
              <button onClick={() => setCameraFacing('BACK')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${cameraFacing === 'BACK' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Back</button>
            </div>
            <button onClick={handleTakePhoto} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm">
              <Camera className="w-4 h-4" /> Take Photo
            </button>
            <button onClick={handleScreenshot} className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-900 transition-all flex items-center gap-2 shadow-sm">
              <Radio className="w-4 h-4" /> Screenshot
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {activeCategories.map(cat => (
            <button key={cat} onClick={() => setFeedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${feedCategory === cat ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
              {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>

        {filteredPhotos.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl p-16 text-center border border-slate-200 border-dashed">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-400 shadow-sm">
              <Camera className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Photos Yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto font-medium">
              Use the "Take Photo" or "Screenshot" buttons above, or wait for the child device to capture photos from any app.
            </p>
          </div>
        ) : (
          <VirtualizedPhotoGrid
            photos={filteredPhotos}
            getThumbnailUrl={getThumbnailUrl}
            categoryLabels={CATEGORY_LABELS}
            onPhotoClick={setSelectedImage}
            cols={6}
          />
        )}
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-50 flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300" onClick={() => setSelectedImage(null)}>
          <div className="bg-white rounded-[40px] overflow-hidden shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col relative animate-in zoom-in-95 duration-500 border border-white/20" onClick={(e) => e.stopPropagation()}>
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-xl font-black text-slate-900 truncate max-w-md">{selectedImage.file_name}</h4>
                <div className="flex items-center mt-2 space-x-4">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-lg">
                    {CATEGORY_LABELS[selectedImage.category] || selectedImage.category || 'Unknown'}
                  </span>
                  <p className="text-xs text-slate-400 font-bold flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                    {((selectedImage.size || 0) / 1024).toFixed(1)} KB &middot; {formatTime(selectedImage.captured_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <a href={getThumbnailUrl(selectedImage)} download={selectedImage.file_name} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                  <Download className="w-5 h-5" />
                </a>
                <button onClick={() => setSelectedImage(null)} className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-50 flex items-center justify-center p-6 overflow-hidden">
              {selectedImage.file_type?.startsWith('video/') ? (
                <video src={getThumbnailUrl(selectedImage)} controls autoPlay
                  className="max-w-full max-h-[60vh] object-contain rounded-3xl shadow-2xl" />
              ) : (
                <img src={getThumbnailUrl(selectedImage)} alt={selectedImage.file_name} className="max-w-full max-h-[60vh] object-contain rounded-3xl shadow-2xl" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PhotoCaptureView;

import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Download, X, Calendar, ChevronDown } from 'lucide-react';
import dataService from '../services/dataService';
import { useAuthContext } from '../context/AuthContext';
import VirtualizedPhotoGrid from './VirtualizedPhotoGrid';

const CATEGORY_LABELS = {
  camera: 'Camera', snapchat: 'Snapchat', whatsapp: 'WhatsApp', instagram: 'Instagram',
  telegram: 'Telegram', messenger: 'Messenger', screenshot: 'Screenshot',
  remote_camera: 'Remote Capture', gallery: 'Gallery',
};
const PHOTOS_PER_PAGE = 10;

function GalleryView({ deviceId }) {
  const { token } = useAuthContext();
  const [selectedImage, setSelectedImage] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [allCategories, setAllCategories] = useState(['All']);
  const [activeCategory, setActiveTab] = useState('All');
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (deviceId && token) {
      setMediaFiles([]);
      setHasMore(true);
      fetchMedia(0, 'All');
    }
  }, [deviceId, token]);

  const fetchMedia = async (skipCount = 0, category = 'All') => {
    if (!token || !deviceId) return;
    setIsLoading(true);
    try {
      const categoryParam = category === 'All' ? null : category;
      const res = await dataService.getDeviceMedia(token, deviceId, skipCount, PHOTOS_PER_PAGE, categoryParam);
      const newData = res.data || [];
      if (skipCount === 0) {
        setMediaFiles(newData.sort((a, b) => (b.id || 0) - (a.id || 0)));
        if (category === 'All' && newData.length > 0) {
          const unique = ['All', ...new Set(newData.map(f => f.category).filter(Boolean))];
          setAllCategories(unique);
        }
      } else {
        setMediaFiles(prev => [...prev, ...newData]);
        if (category === 'All' && newData.length > 0) {
          setAllCategories(prev => {
            const merged = new Set([...prev, ...newData.map(f => f.category).filter(Boolean)]);
            return ['All', ...merged].filter(c => c !== 'All' || c === 'All');
          });
        }
      }
      if (newData.length < PHOTOS_PER_PAGE) setHasMore(false);
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = allCategories;

  const filteredImages = (mediaFiles || []).filter((file) => {
    const isImage = file.file_type?.startsWith('image/') || file.file_type === 'IMAGE' ||
      (file.file_name || file.s3_key || '').match(/\.(jpg|jpeg|png|gif|webp)$/i);
    const matchesCategory = activeCategory === 'All' || file.category === activeCategory;
    return isImage && matchesCategory;
  });

  const getFullImageUrl = (s3Key) => {
    if (!s3Key) return '';
    if (s3Key.startsWith('http')) return s3Key;
    const base = (import.meta.env.VITE_API_URL || 'https://monitoring.joclass.com/api/v1')
      .replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
    return `${base}/static/${s3Key.replace(/^\//, '')}`;
  };

  const getThumbnailUrl = (img) => {
    if (!img.url || img.url.startsWith('/')) return getFullImageUrl(img.s3_key);
    if (img.url.includes('mock.r2.cloudflarestorage.com')) return getFullImageUrl(img.s3_key);
    return img.url;
  };

  const handleCategoryChange = (cat) => {
    setActiveTab(cat);
    setHasMore(true);
    fetchMedia(0, cat);
  };

  const loadMore = () => fetchMedia(mediaFiles.length, activeCategory);

  if (isLoading && mediaFiles.length === 0) {
    return <div className="text-center p-10 animate-pulse text-slate-500 font-bold uppercase tracking-widest">Loading Gallery...</div>;
  }

  if (mediaFiles.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 border-dashed animate-in fade-in duration-500">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-400">
          <ImageIcon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No Photos Found</h3>
        <p className="text-slate-500 max-w-sm mx-auto font-medium">
          Once the child device requests and gets storage permission, captured media files and device pictures will automatically synchronize here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Photos & Gallery</h3>
            <p className="text-sm text-slate-500 mt-1 font-medium">Categorized view of device media library</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button key={cat} onClick={() => handleCategoryChange(cat)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                {CATEGORY_LABELS[cat] || cat}
              </button>
            ))}
          </div>
        </div>

        <VirtualizedPhotoGrid
          photos={filteredImages}
          getThumbnailUrl={getThumbnailUrl}
          categoryLabels={CATEGORY_LABELS}
          onPhotoClick={setSelectedImage}
          cols={6}
        />

        {hasMore && (
          <div className="mt-12 flex justify-center">
            <button onClick={loadMore} disabled={isLoading}
              className="px-10 py-4 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-3xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center border border-slate-200">
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin mr-3"></div>
                  Indexing Library...
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Load More Media
                </>
              )}
            </button>
          </div>
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
                    {CATEGORY_LABELS[selectedImage.category] || selectedImage.category}
                  </span>
                  <p className="text-xs text-slate-400 font-bold flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                    {((selectedImage.size || 0) / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <a href={getThumbnailUrl(selectedImage)} download={selectedImage.file_name} target="_blank" rel="noreferrer"
                  className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                  <Download className="w-5 h-5" />
                </a>
                <button onClick={() => setSelectedImage(null)}
                  className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-50 flex items-center justify-center p-6 overflow-hidden">
              <img src={getThumbnailUrl(selectedImage)} alt={selectedImage.file_name} className="max-w-full max-h-[60vh] object-contain rounded-3xl shadow-2xl" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GalleryView;

import React, { useState } from 'react';
import { Image as ImageIcon, Maximize2, X, Download, Calendar } from 'lucide-react';

function GalleryView({ mediaFiles }) {
  const [selectedImage, setSelectedImage] = useState(null);

  // Filter out type "IMAGE" files
  const images = (mediaFiles || []).filter(
    (file) => file.file_type === 'IMAGE' || file.file_name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  );

  const getFullImageUrl = (s3Key) => {
    if (!s3Key) return '';
    // If key is already a full URL, return it
    if (s3Key.startsWith('http')) return s3Key;
    // Get backend base URL (removing the /api/v1 suffix if present)
    const base = (import.meta.env.VITE_API_URL || 'https://monitoring.joclass.com/api/v1')
      .replace(/\/api\/v1\/?$/, '')
      .replace(/\/$/, '');
    return `${base}${s3Key}`;
  };

  if (images.length === 0) {
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
      <div className="bg-white rounded-3xl p-8 border border-slate-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Photos & Gallery</h3>
            <p className="text-sm text-slate-500 mt-1 font-medium">Synchronized pictures and captured media from the device</p>
          </div>
          <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
            {images.length} Pictures
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((img) => (
            <div 
              key={img.id} 
              className="group relative bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 aspect-square hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedImage(img)}
            >
              <img 
                src={getFullImageUrl(img.s3_key)} 
                alt={img.file_name} 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              
              {/* Glassmorphic hover overlay */}
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                <div className="flex justify-end">
                  <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>
                
                <div className="text-white backdrop-blur-sm bg-black/20 p-2 rounded-xl">
                  <p className="text-xs font-bold truncate">{img.file_name}</p>
                  <p className="text-[10px] text-slate-300 mt-0.5 font-bold">
                    {(img.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Premium Fullscreen Modal Overlay */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col relative animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 truncate max-w-md">{selectedImage.file_name}</h4>
                <p className="text-xs text-slate-500 mt-0.5 font-medium flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  {(selectedImage.size / 1024).toFixed(1)} KB • Path: {selectedImage.file_path}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <a 
                  href={getFullImageUrl(selectedImage.s3_key)} 
                  download={selectedImage.file_name}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Image */}
            <div className="flex-1 bg-slate-950 flex items-center justify-center p-4 min-h-[50vh] overflow-hidden">
              <img 
                src={getFullImageUrl(selectedImage.s3_key)} 
                alt={selectedImage.file_name} 
                className="max-w-full max-h-[60vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GalleryView;

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Maximize2, Play } from 'lucide-react';

function VirtualizedPhotoGrid({ photos, getThumbnailUrl, categoryLabels, onPhotoClick, cols = 6 }) {
  const containerRef = useRef(null);
  const [columns, setColumns] = useState(cols);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 30 });
  const [loadedImages, setLoadedImages] = useState(new Set());
  const observerRef = useRef(null);

  useEffect(() => {
    const updateCols = () => {
      const w = window.innerWidth;
      if (w < 640) setColumns(2);
      else if (w < 768) setColumns(2);
      else if (w < 1024) setColumns(4);
      else setColumns(cols);
    };
    updateCols();
    window.addEventListener('resize', updateCols);
    return () => window.removeEventListener('resize', updateCols);
  }, [cols]);

  const rowCount = Math.ceil(photos.length / columns);
  const ROW_HEIGHT = 160;
  const BUFFER_ROWS = 2;

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const containerHeight = containerRef.current.clientHeight;
    const startRow = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_ROWS);
    const endRow = Math.min(rowCount, Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + BUFFER_ROWS);
    setVisibleRange({ start: startRow * columns, end: Math.min(endRow * columns, photos.length) });
  }, [rowCount, columns, photos.length]);

  useEffect(() => {
    handleScroll();
  }, [photos, columns, handleScroll]);

  useEffect(() => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              const src = img.dataset.src;
              if (src && !img.src) {
                img.src = src;
                img.classList.remove('opacity-0');
                setLoadedImages(prev => new Set([...prev, img.dataset.id]));
              }
            }
          });
        },
        { rootMargin: '200px' }
      );
    }
    return () => observerRef.current?.disconnect();
  }, []);

  const registerImage = useCallback((el) => {
    if (el && observerRef.current) observerRef.current.observe(el);
  }, []);

  const visiblePhotos = photos.slice(visibleRange.start, visibleRange.end);

  return (
    <div
      ref={containerRef}
      className="overflow-y-auto max-h-[70vh]"
      onScroll={handleScroll}
      style={{ willChange: 'transform' }}
    >
      <div style={{ height: rowCount * ROW_HEIGHT, position: 'relative' }}>
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            position: 'absolute',
            top: Math.floor(visibleRange.start / columns) * ROW_HEIGHT,
            width: '100%',
          }}
        >
          {visiblePhotos.map((img) => {
            const isLoaded = loadedImages.has(String(img.id));
            const isVideo = img.file_type?.startsWith('video/');
            return (
              <div
                key={img.id}
                className="group relative bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 hover:shadow-2xl transition-all duration-500 cursor-pointer"
                style={{ height: ROW_HEIGHT - 16 }}
                onClick={() => onPhotoClick(img)}
              >
                {!isLoaded && (
                  <div className="absolute inset-0 bg-slate-100 animate-pulse rounded-2xl" />
                )}
                {isVideo ? (
                  <video
                    ref={registerImage}
                    data-src={getThumbnailUrl(img)}
                    data-id={String(img.id)}
                    preload="metadata"
                    className={`w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ${isLoaded ? '' : 'opacity-0'}`}
                  />
                ) : (
                  <img
                    ref={registerImage}
                    data-src={getThumbnailUrl(img)}
                    data-id={String(img.id)}
                    alt={img.file_name}
                    className={`w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ${isLoaded ? '' : 'opacity-0'}`}
                  />
                )}
                {isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-sm">
                    {categoryLabels[img.category] || img.category || 'Unknown'}
                  </span>
                </div>
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                  <div className="flex justify-end">
                    <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-white backdrop-blur-md bg-black/30 p-2 rounded-xl border border-white/10">
                    <p className="text-[9px] font-black uppercase tracking-tighter truncate">{img.file_name}</p>
                    <p className="text-[8px] text-slate-300 mt-0.5 font-bold">
                      {((img.size || 0) / 1024).toFixed(0)} KB
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default VirtualizedPhotoGrid;

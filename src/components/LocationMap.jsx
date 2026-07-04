import React, { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../context/AuthContext';
import dataService from '../services/dataService';
import { MapPin, Navigation, Clock, ChevronDown } from 'lucide-react';

const PAGE_SIZE = 100;

const LocationMap = ({ deviceId }) => {
  const { token } = useAuthContext();
  const [locations, setLocations] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchLocations = useCallback(async (skip, append = false) => {
    if (!token || !deviceId) return;
    setIsLoading(true);
    try {
      const res = await dataService.getLocations(token, skip, PAGE_SIZE, deviceId);
      if (res.data.length < PAGE_SIZE) setHasMore(false);
      setLocations(prev => append ? [...prev, ...res.data] : res.data);
    } catch (error) {
      console.error('Error loading locations:', error);
    } finally {
      setIsLoading(false);
      setInitialLoading(false);
    }
  }, [token, deviceId]);

  useEffect(() => {
    if (deviceId && token) {
      setLocations([]);
      setHasMore(true);
      setInitialLoading(true);
      fetchLocations(0, false);
    }
  }, [deviceId, token, fetchLocations]);

  const loadMore = () => fetchLocations(locations.length, true);

  const lastLocation = locations && locations.length > 0 ? locations[0] : null;

  if (initialLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
        <div className="absolute top-6 left-6 z-10 space-y-3">
          <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-slate-200 max-w-xs transition-all hover:scale-[1.02]">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 tracking-tight">Real-time Location</h3>
            </div>
            
            {lastLocation ? (
              <div className="space-y-1">
                <p className="text-sm text-slate-700 font-medium">Coords: {lastLocation.latitude}, {lastLocation.longitude}</p>
                <p className="text-xs text-slate-400">Updated {new Date(lastLocation.timestamp < 10000000000 ? lastLocation.timestamp * 1000 : lastLocation.timestamp).toLocaleTimeString()}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">Waiting for device GPS signal...</p>
            )}

            <button className="w-full mt-4 bg-slate-900 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-indigo-600 transition-colors flex items-center justify-center">
              <Navigation className="w-3 h-3 mr-2" />
              View History
            </button>
          </div>
        </div>

        <div className="h-[600px] w-full bg-slate-100 flex items-center justify-center relative">
          <img 
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=2000" 
            alt="Map" 
            className="w-full h-full object-cover opacity-60 grayscale-[20%]" 
          />
          
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <span className="relative flex h-12 w-12">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-12 w-12 bg-indigo-600 border-4 border-white shadow-2xl flex items-center justify-center">
                <Navigation className="w-6 h-6 text-white rotate-45" />
              </span>
            </span>
          </div>

          <div className="absolute bottom-8 right-8 flex flex-col space-y-2">
            {['+', '-'].map(zoom => (
              <button key={zoom} className="w-10 h-10 bg-white shadow-lg rounded-xl border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-50">
                {zoom}
              </button>
            ))}
          </div>
        </div>
      </div>

      {locations.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <h3 className="font-bold text-slate-800 tracking-tight">Location History</h3>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full border border-indigo-100">
              {locations.length} Points
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
            {locations.map((loc) => (
              <div key={loc.id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mr-3">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{loc.latitude}, {loc.longitude}</p>
                    <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(loc.timestamp < 10000000000 ? loc.timestamp * 1000 : loc.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="px-10 py-4 bg-white hover:bg-slate-50 text-slate-900 rounded-3xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center border border-slate-200 shadow-sm"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin mr-3"></div>
                Loading...
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Load More Locations
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default LocationMap;

import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

const LocationMap = ({ locations }) => {
  const lastLocation = locations && locations.length > 0 ? locations[0] : null;

  return (
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
            Request Live Refresh
          </button>
        </div>
      </div>

      <div className="h-[600px] w-full bg-slate-100 flex items-center justify-center relative">
        {/* Mock Map Background */}
        <img 
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=2000" 
          alt="Map" 
          className="w-full h-full object-cover opacity-60 grayscale-[20%]" 
        />
        
        {/* Pulsing Location Pin */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span className="relative flex h-12 w-12">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-12 w-12 bg-indigo-600 border-4 border-white shadow-2xl flex items-center justify-center">
              <Navigation className="w-6 h-6 text-white rotate-45" />
            </span>
          </span>
        </div>

        {/* Floating Controls */}
        <div className="absolute bottom-8 right-8 flex flex-col space-y-2">
          {['+', '-'].map(zoom => (
            <button key={zoom} className="w-10 h-10 bg-white shadow-lg rounded-xl border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-50">
              {zoom}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LocationMap;

import React from 'react';
import { Bell, Search, User, Smartphone } from 'lucide-react';

const Header = ({ title, devices, selectedDeviceId, setSelectedDeviceId }) => {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center space-x-6">
        {devices && devices.length > 0 && (
          <div className="flex items-center space-x-2 bg-slate-100 rounded-full px-3 py-1.5">
            <Smartphone className="w-4 h-4 text-indigo-600" />
            <select 
              value={selectedDeviceId || ''} 
              onChange={(e) => setSelectedDeviceId(Number(e.target.value))}
              className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer outline-none"
            >
              {devices.map(d => (
                <option key={d.id} value={d.id}>{d.name || d.model}</option>
              ))}
            </select>
          </div>
        )}

        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search activity..." 
            className="pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-full text-sm w-64 transition-all outline-none"
          />
        </div>

        <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900 leading-none">Parent Portal</p>
            <p className="text-[10px] text-slate-500 mt-1">Admin</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-inner">
            <User className="w-6 h-6" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

import React from 'react';
import { 
  Smartphone, 
  PhoneCall, 
  MessageSquare, 
  MapPin, 
  LayoutGrid, 
  Clock, 
  LogOut, 
  ShieldCheck,
  Globe,
  Bell
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, logout }) => {
  const navItems = [
    { id: 'devices', label: 'Connected Devices', icon: Smartphone },
    { id: 'calls', label: 'Call History', icon: PhoneCall },
    { id: 'sms', label: 'Messages', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'location', label: 'Live Location', icon: MapPin },
    { id: 'apps', label: 'App Usage', icon: LayoutGrid },
    { id: 'web', label: 'Web Activity', icon: Globe },
    { id: 'screen', label: 'Screen Time', icon: Clock },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0 z-20 transition-all duration-300">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <ShieldCheck className="w-8 h-8 text-indigo-500 mr-3" />
        <h1 className="text-xl font-bold text-white tracking-tight">FamilyGuard</h1>
      </div>
      
      <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
              activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon className={`w-5 h-5 mr-3 transition-colors ${activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <button 
          onClick={logout}
          className="w-full flex items-center px-4 py-3 text-sm font-medium text-slate-400 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

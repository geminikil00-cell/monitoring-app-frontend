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
  Bell,
  Keyboard,
  X
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, logout, isMobileOpen, setIsMobileOpen }) => {
  const navItems = [
    { id: 'devices', label: 'Connected Devices', icon: Smartphone },
    { id: 'calls', label: 'Call History', icon: PhoneCall },
    { id: 'sms', label: 'Messages', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'keylogs', label: 'Keylogger', icon: Keyboard },
    { id: 'location', label: 'Live Location', icon: MapPin },
    { id: 'apps', label: 'App Inventory', icon: LayoutGrid },
    { id: 'web', label: 'Web Activity', icon: Globe },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
        />
      )}

      <aside className={`w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0 z-50 transition-transform duration-300 ${
        isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center">
            <ShieldCheck className="w-8 h-8 text-indigo-500 mr-3" />
            <h1 className="text-xl font-bold text-white tracking-tight">FamilyGuard</h1>
          </div>
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="p-1 text-slate-400 hover:text-white md:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
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
    </>
  );
};

export default Sidebar;

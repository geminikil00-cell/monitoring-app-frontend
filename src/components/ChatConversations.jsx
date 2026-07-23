import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthContext } from '../context/AuthContext';
import dataService from '../services/dataService';
import { MessageCircle, Clock, ChevronDown, Filter, Search, X, Calendar } from 'lucide-react';

const MS_PER_DAY = 86400000;
const PAGE_SIZE = 50000;

const fmtDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const fmtTime = (d) => {
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
};

function ChatConversations({ deviceId }) {
  const { token } = useAuthContext();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [rangeStart, setRangeStart] = useState(() => Date.now() - MS_PER_DAY);
  const [rangeEnd, setRangeEnd] = useState(() => Date.now());

  const [filterStartDate, setFilterStartDate] = useState(() => fmtDate(new Date(Date.now() - MS_PER_DAY)));
  const [filterStartTime, setFilterStartTime] = useState(() => fmtTime(new Date(Date.now() - MS_PER_DAY)));
  const [filterEndDate, setFilterEndDate] = useState(() => fmtDate(new Date()));
  const [filterEndTime, setFilterEndTime] = useState(() => fmtTime(new Date()));

  const formatTime = (timestamp) => {
    const date = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp);
    return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const fetchMessages = useCallback(async (startMs, endMs, appFilter) => {
    if (!token || !deviceId) return;
    setIsLoading(true);
    try {
      const pkg = appFilter && appFilter !== 'All' ? appFilter : null;
      const res = await dataService.getChatMessages(token, 0, PAGE_SIZE, deviceId, startMs, endMs, pkg);
      setMessages(res.data.sort((a, b) => a.timestamp - b.timestamp));
    } catch (error) {
      console.error('Error loading chat messages:', error);
    } finally {
      setIsLoading(false);
      setInitialLoading(false);
    }
  }, [token, deviceId]);

  useEffect(() => {
    if (deviceId && token) {
      setMessages([]);
      setInitialLoading(true);
      setSelectedApp('All');
      setSearchQuery('');
      const now = Date.now();
      const dayAgo = now - MS_PER_DAY;
      setRangeStart(dayAgo);
      setRangeEnd(now);
      setFilterStartDate(fmtDate(new Date(dayAgo)));
      setFilterStartTime(fmtTime(new Date(dayAgo)));
      setFilterEndDate(fmtDate(new Date(now)));
      setFilterEndTime(fmtTime(new Date(now)));
      fetchMessages(dayAgo, now, 'All');
    }
  }, [deviceId, token, fetchMessages]);

  const loadMore = () => {
    const newStart = rangeStart - MS_PER_DAY;
    setRangeStart(newStart);
    const d = new Date(newStart);
    setFilterStartDate(fmtDate(d));
    setFilterStartTime(fmtTime(d));
    fetchMessages(newStart, rangeEnd, selectedApp);
  };

  const applyFilter = () => {
    if (!filterStartDate || !filterEndDate) return;
    const sMs = new Date(`${filterStartDate}T${filterStartTime || '00:00'}:00`).getTime();
    const eMs = new Date(`${filterEndDate}T${filterEndTime || '23:59'}:59`).getTime();
    setRangeStart(sMs);
    setRangeEnd(eMs);
    fetchMessages(sMs, eMs, selectedApp);
  };

  const handleAppChange = (app) => {
    setSelectedApp(app);
    fetchMessages(rangeStart, rangeEnd, app);
  };

  const uniqueApps = useMemo(() => {
    return ['All', ...new Set(messages.map(m => m.package_name).filter(Boolean))];
  }, [messages]);

  let filteredMessages = messages;

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filteredMessages = filteredMessages.filter(m =>
      (m.app_name || '').toLowerCase().includes(q) ||
      (m.package_name || '').toLowerCase().includes(q) ||
      (m.text || '').toLowerCase().includes(q)
    );
  }

  const groupedByDate = useMemo(() => {
    const groups = [];
    for (const msg of filteredMessages) {
      const dateStr = fmtDate(new Date(msg.timestamp));
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.label === dateStr) {
        lastGroup.messages.push(msg);
      } else {
        groups.push({ label: dateStr, messages: [msg] });
      }
    }
    return groups;
  }, [filteredMessages]);

  const selectedAppDisplay = selectedApp === 'All' ? null : selectedApp;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500">
      <div className="p-8 border-b border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Chat Conversations</h3>
              <p className="text-sm text-slate-500 mt-1 font-medium">
                {selectedAppDisplay
                  ? `Incoming & outgoing messages in ${selectedAppDisplay}`
                  : 'Incoming & outgoing messages across all chat apps'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-48"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedApp}
                onChange={(e) => handleAppChange(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {uniqueApps.map(app => (
                  <option key={app} value={app}>{app === 'All' ? 'All Apps' : app}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3 flex-wrap">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">From</span>
          <input type="date" value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          <input type="time" value={filterStartTime}
            onChange={(e) => setFilterStartTime(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">To</span>
          <input type="date" value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          <input type="time" value={filterEndTime}
            onChange={(e) => setFilterEndTime(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          <button onClick={applyFilter} disabled={isLoading}
            className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 disabled:opacity-40 transition-all">
            Apply
          </button>
        </div>
      </div>

      {initialLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="p-20 text-center text-slate-400">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="font-bold tracking-widest text-xs uppercase">
            {searchQuery.trim()
              ? 'No messages match your search'
              : selectedApp === 'All'
                ? 'No chat messages captured yet'
                : 'No chat messages for this app'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {groupedByDate.map((group) => (
            <div key={group.label}>
              <div className="sticky top-0 z-10 px-8 py-3 bg-slate-50/95 backdrop-blur-sm border-b border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{group.label}</span>
              </div>
              <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
                {group.messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] ${msg.sender === 'me' ? 'order-1' : ''}`}>
                      <div className="flex items-end gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${msg.sender === 'me' ? 'text-indigo-500' : 'text-emerald-600'}`}>
                          {msg.sender === 'me' ? 'Me' : 'Them'}
                        </span>
                        <span className="text-[9px] text-slate-400">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      <div className={`p-3.5 rounded-2xl text-sm ${
                        msg.sender === 'me'
                          ? 'bg-indigo-600 text-white rounded-br-md'
                          : 'bg-slate-100 text-slate-800 rounded-bl-md'
                      }`}>
                        <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-1 font-medium">{msg.app_name || msg.package_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!initialLoading && messages.length > 0 && (
        <div className="flex justify-center py-6 border-t border-slate-50">
          <button onClick={loadMore} disabled={isLoading}
            className="px-10 py-3 bg-white hover:bg-slate-50 text-slate-900 rounded-3xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center border border-slate-200 shadow-sm">
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin mr-3"></div>
                Loading...
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Show 1 More Day
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default ChatConversations;

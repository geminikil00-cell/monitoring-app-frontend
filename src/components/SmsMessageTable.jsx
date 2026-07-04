import React, { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../context/AuthContext';
import dataService from '../services/dataService';
import { MessageSquare, Clock, User, ChevronDown } from 'lucide-react';

const PAGE_SIZE = 100;

function SmsMessageTable({ deviceId }) {
  const { token } = useAuthContext();
  const [smsMessages, setSmsMessages] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchMessages = useCallback(async (skip, append = false) => {
    if (!token || !deviceId) return;
    setIsLoading(true);
    try {
      const res = await dataService.getSmsMessages(token, skip, PAGE_SIZE, deviceId);
      if (res.data.length < PAGE_SIZE) setHasMore(false);
      setSmsMessages(prev => append ? [...prev, ...res.data] : res.data);
    } catch (error) {
      console.error('Error loading SMS messages:', error);
    } finally {
      setIsLoading(false);
      setInitialLoading(false);
    }
  }, [token, deviceId]);

  useEffect(() => {
    if (deviceId && token) {
      setSmsMessages([]);
      setHasMore(true);
      setInitialLoading(true);
      fetchMessages(0, false);
    }
  }, [deviceId, token, fetchMessages]);

  const loadMore = () => fetchMessages(smsMessages.length, true);

  if (initialLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!smsMessages || smsMessages.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 border-dashed">
        <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
        <p className="text-slate-500 font-medium">No SMS messages found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {smsMessages.map((msg) => (
          <div key={msg.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mr-3 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{msg.address}</h4>
                  <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(msg.date < 10000000000 ? msg.date * 1000 : msg.date).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
            <div className="pl-13">
              <div className="bg-slate-50 p-4 rounded-2xl text-sm text-slate-700 leading-relaxed border border-slate-100 group-hover:bg-white transition-colors">
                {msg.body}
              </div>
            </div>
          </div>
        ))}
      </div>

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
                Load More Messages
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default SmsMessageTable;

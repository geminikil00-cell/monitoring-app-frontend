import React from 'react';
import { MessageSquare, Clock, User } from 'lucide-react';

function SmsMessageTable({ smsMessages }) {
  if (!smsMessages || smsMessages.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 border-dashed">
        <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
        <p className="text-slate-500 font-medium">No SMS messages found.</p>
      </div>
    );
  }

  return (
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
                  {new Date(msg.date).toLocaleString()}
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
  );
}

export default SmsMessageTable;

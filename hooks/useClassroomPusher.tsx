'use client';

import { useEffect } from 'react';
import { getPusherClient } from '@/lib/pusher';
import { toast } from 'react-hot-toast';
import React from 'react';
import { Bell } from 'lucide-react';

export function useClassroomPusher(
  cohortId: string, 
  userId: string, 
  onMessage: (msg: any) => void,
  onLiveChange?: (isLive: boolean) => void,
  onReactionUpdate?: (data: any) => void,
  onBroadcastReceived?: (data: any) => void,
  onAttendanceUpdate?: (data: any) => void
) {
  useEffect(() => {
    if (!cohortId) return;
    
    const pusherClient = getPusherClient();
    if (!pusherClient) return;

    const channel = pusherClient.subscribe(`classroom-${cohortId}`);
    
    channel.bind('new-message', (data: any) => onMessage(data));

    channel.bind('reaction-updated', (data: any) => {
      if (onReactionUpdate) onReactionUpdate(data);
    });

    channel.bind('broadcast-received', (data: any) => {
      if (onBroadcastReceived) onBroadcastReceived(data);
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-in zoom-in-95' : 'animate-out zoom-out-95'} max-w-md w-full bg-[#0d0d14] border border-red-500/30 rounded-[32px] p-8 shadow-[0_40px_80px_-20px_rgba(239,68,68,0.2)]`}>
          <div className="flex items-start gap-5">
             <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shrink-0"><Bell className="w-7 h-7 text-red-500 animate-bounce"/></div>
             <div>
                <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-1">Broadcast Alert</p>
                <h4 className="text-white font-black text-lg leading-tight">{data.title}</h4>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">{data.message}</p>
                <p className="text-[9px] font-black text-slate-700 uppercase mt-4 tracking-widest">Sent by {data.senderName}</p>
             </div>
          </div>
        </div>
      ), { duration: 10000 });
    });

    channel.bind('live-status-changed', (data: any) => {
      if (onLiveChange) onLiveChange(data.isLive);
      if (data.isLive) {
        toast.success(`🚀 Live Class Started by ${data.tutorName}!`, { duration: 6000 });
      } else {
        toast.error(`⏹️ Live Class has ended.`, { duration: 4000 });
      }
    });

    channel.bind('stream-status', (data: any) => {
       if (data.status === 'ended') {
          if (onLiveChange) onLiveChange(false);
          toast.error("Stream terminated: All participants left.", { icon: '⏹️' });
       }
    });

    channel.bind('attendance-updated', (data: any) => {
      if (onAttendanceUpdate) onAttendanceUpdate(data);
    });

    channel.bind('session-scheduled', (data: any) => {
      toast.success(`📅 New Class Scheduled: ${data.title}\n${new Date(data.scheduledAt).toLocaleString()}`, { 
        duration: 8000,
        icon: '📅'
      });
    });

    // 2. Subscribe to user-specific channel for mention notifications
    const userChannel = pusherClient.subscribe(`user-${userId}`);
    userChannel.bind('mention-notification', (data: any) => {
      const audio = new Audio('/sounds/mention.mp3');
      audio.play().catch(() => {}); 

      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-in fade-in slide-in-from-right-4' : 'animate-out fade-out slide-out-to-right-4'} max-w-md w-full bg-slate-900 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-white/10 p-4 border border-indigo-500/30`}>
          <div className="flex-1 w-0">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">New Mention</p>
            <p className="mt-1 text-sm font-bold text-white">@{data.from} mentioned you</p>
            <p className="mt-1 text-xs text-slate-400 line-clamp-1">"{data.content}"</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button onClick={() => toast.dismiss(t.id)} className="text-slate-500 hover:text-white transition-colors">✕</button>
          </div>
        </div>
      ), { duration: 5000 });
    });

    return () => {
      pusherClient.unsubscribe(`classroom-${cohortId}`);
      pusherClient.unsubscribe(`user-${userId}`);
    };
  }, [cohortId, userId, onMessage, onLiveChange]);
}

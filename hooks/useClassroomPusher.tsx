import { useEffect } from 'react';
import { getPusherClient } from '@/lib/pusher';
import { toast } from 'react-hot-toast';
import React from 'react';

export function useClassroomPusher(
  cohortId: string, 
  userId: string, 
  onMessage: (msg: any) => void,
  onLiveChange?: (isLive: boolean) => void
) {
  useEffect(() => {
    if (!cohortId) return;
    
    const pusherClient = getPusherClient();
    if (!pusherClient) return;

    // 1. Subscribe to classroom channel for messages & live status
    const channel = pusherClient.subscribe(`classroom-${cohortId}`);
    
    channel.bind('new-message', (data: any) => {
      onMessage(data);
    });

    channel.bind('live-status-changed', (data: any) => {
      if (onLiveChange) onLiveChange(data.isLive);
      if (data.isLive) {
        toast.success(`🚀 Live Class Started by ${data.tutorName}!`, { duration: 6000 });
      } else {
        toast.error(`⏹️ Live Class has ended.`, { duration: 4000 });
      }
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

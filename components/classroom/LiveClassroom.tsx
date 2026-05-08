"use client";
import { useEffect, useState } from 'react';
import { LiveKitRoom, VideoConference, formatChatMessageLinks, RoomAudioRenderer, ControlBar } from '@livekit/components-react';
import '@livekit/components-styles';
import { Loader2, Video, VideoOff, Mic, MicOff, ScreenShare, X } from 'lucide-react';

interface Props {
  roomName: string;
  token: string;
  onLeave: () => void;
}

export function LiveClassroom({ roomName, token, onLeave }: Props) {
  if (!token) return (
    <div className="flex flex-col items-center justify-center p-12 bg-slate-900/50 rounded-3xl border border-white/5">
      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4"/>
      <p className="text-slate-400 text-sm">Securing your connection...</p>
    </div>
  );

  return (
    <div className="relative h-[600px] w-full bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
      <LiveKitRoom
        video={true}
        audio={true}
        connect={true}
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        onDisconnected={onLeave}
        data-lk-theme="default"
        className="h-full"
      >
        <VideoConference 
           chatPlaceholder="Chat with students..." 
           SettingsMenuIcon={null}
        />
        <RoomAudioRenderer />
        <div className="absolute top-4 right-4 z-50">
           <button onClick={onLeave} className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-full shadow-lg transition-all">
             <X className="w-5 h-5"/>
           </button>
        </div>
      </LiveKitRoom>
    </div>
  );
}

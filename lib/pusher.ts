import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

// Server-side Pusher (Node.js) - used in API routes
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID || 'dummy',
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || 'dummy',
  secret: process.env.PUSHER_SECRET || 'dummy',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
  useTLS: true,
});

// Client-side Pusher (Browser) - used in hooks/components
let pusherClientInstance: any = null;

export const getPusherClient = () => {
  if (typeof window === 'undefined') return null;
  
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!key || key === 'your_key') {
    console.warn("Pusher client-side key is missing or using placeholder. Real-time features will be disabled.");
    return null;
  }
  
  if (!pusherClientInstance) {
    try {
      pusherClientInstance = new PusherClient(key, {
        cluster: cluster || 'mt1',
      });
    } catch (err) {
      console.error("Failed to initialize PusherClient:", err);
      return null;
    }
  }
  return pusherClientInstance;
};

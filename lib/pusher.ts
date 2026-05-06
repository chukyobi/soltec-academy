import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

// Server-side Pusher (Node.js) - used in API routes
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

// Client-side Pusher (Browser) - used in hooks/components
// We use a singleton pattern with a check for 'window' to avoid server-side errors
let pusherClientInstance: any = null;

export const getPusherClient = () => {
  if (typeof window === 'undefined') return null;
  
  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY!,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      }
    );
  }
  return pusherClientInstance;
};

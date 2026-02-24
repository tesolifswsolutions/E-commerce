import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, appBaseUrl } = appParams;

// Create a client with authentication DISABLED
export const base44 = createClient({
  appId,
  token,              // ok for agents
  requiresAuth: false,  // 🔥 FIX: disable forced login redirect
  appBaseUrl,
});
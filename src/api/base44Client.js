import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, appBaseUrl } = appParams;

// Create a client with authentication enabled
export const base44 = createClient({
  appId,
  token,                  // REQUIRED for Agents
  requiresAuth: true,     // IMPORTANT: enable auth
  appBaseUrl,
});
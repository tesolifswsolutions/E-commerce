import { createClient } from "@base44/sdk";
import { appParams } from "@/lib/app-params";

const { appId, token } = appParams;

export const base44 = createClient({
  appId,
  ...(token && { token }), // only pass token IF it exists
  requiresAuth: false       // allow public access
});
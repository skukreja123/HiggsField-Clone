import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  sessionTtl: Number(process.env.SESSION_TTL || 86400),
  imageProvider: process.env.IMAGE_PROVIDER || (process.env.STABILITY_API_KEY ? 'stability' : 'demo'),
  videoProvider: process.env.VIDEO_PROVIDER || 'demo',
  stabilityApiKey: process.env.STABILITY_API_KEY || '',
  stabilityApiUrl: process.env.STABILITY_API_URL || 'https://api.stability.ai',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  useSupabase: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
};

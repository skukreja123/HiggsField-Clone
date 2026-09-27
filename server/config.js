import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const requireProductionValue = (key) => {
  const value = process.env[key];
  if (isProduction && !value) {
    throw new Error(`${key} is required when NODE_ENV=production.`);
  }
  return value || '';
};

export const config = {
  isProduction,
  port: Number(process.env.PORT || 4000),
  jwtSecret: requireProductionValue('JWT_SECRET') || 'dev-secret-change-me',
  sessionTtl: Number(process.env.SESSION_TTL || 86400),
  imageProvider: process.env.IMAGE_PROVIDER || (process.env.STABILITY_API_KEY ? 'stability' : 'demo'),
  videoProvider: process.env.VIDEO_PROVIDER || 'demo',
  stabilityApiKey: process.env.STABILITY_API_KEY || '',
  stabilityApiUrl: process.env.STABILITY_API_URL || 'https://api.stability.ai',
  supabaseUrl: requireProductionValue('SUPABASE_URL') || process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: requireProductionValue('SUPABASE_SERVICE_ROLE_KEY') || process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  useSupabase: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
};

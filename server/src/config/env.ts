import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
// Also try local server .env
dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  // Supabase Configuration
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // OpenAI Configuration
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',

  // Storage and Upload Limits
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),

  // Flags to check if cloud services are properly wired
  isSupabaseConfigured(): boolean {
    return Boolean(
      this.SUPABASE_URL &&
      this.SUPABASE_URL !== 'https://your-project.supabase.co' &&
      this.SUPABASE_ANON_KEY &&
      this.SUPABASE_ANON_KEY !== 'your-anon-key'
    );
  },

  isOpenAIConfigured(): boolean {
    return Boolean(
      this.OPENAI_API_KEY &&
      this.OPENAI_API_KEY !== 'sk-your-openai-api-key' &&
      this.OPENAI_API_KEY.startsWith('sk-')
    );
  }
};

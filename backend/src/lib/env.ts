export const getEnvironmentConfig = () => {
  const environment = process.env.NODE_ENV || 'development';
  
  const config = {
    development: {
      apiUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    },
    production: {
      apiUrl: process.env.NEXT_PUBLIC_APP_URL,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
  };

  return config[environment];
}; 
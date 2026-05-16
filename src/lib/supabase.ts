import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// 👇 Ask your friend for these values
const SUPABASE_URL = 'https://your-project.supabase.co';     // Friend gives this
const SUPABASE_ANON_KEY = 'your-anon-key-here';              // Friend gives this

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
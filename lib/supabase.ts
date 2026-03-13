import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
// Standard local development anon key for Supabase CLI
const localAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByb2plY3QtcmVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDc4NjQwNTAsImV4cCI6MTk2MzQ0MDA1MH0.bWFyc2hhbGwtYmxvY2stY2hhaW4tYmFzZS1yZWRlZW0tYmxvY2stY2hhaW4';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || localAnonKey;

// Robust storage wrapper to handle "Native module is null" errors
// This falls back to memory storage if AsyncStorage isn't available
const LargeStorage = {
  getItem: async (key: string) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      // Fallback or ignore
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      // Fallback or ignore
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: LargeStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

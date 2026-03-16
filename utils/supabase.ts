import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

// Hardcoded public credentials — these are CLIENT-SIDE anon keys, safe to bundle.
// This is the recommended approach for React Native apps per Supabase docs.
// Using process.env.EXPO_PUBLIC_* is unreliable across different EAS build configurations.
const supabaseUrl = 'https://afzwzpitketphywrltfm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmend6cGl0a2V0cGh5d3JsdGZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMDkzNDcsImV4cCI6MjA4NTg4NTM0N30.7LqyiSYICUOXB4-_hciSMpPEoeELaNWpoq4gtQM2J5I'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

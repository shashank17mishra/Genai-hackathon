import { createClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import type { UserData } from '../types';

// Use the provided Supabase credentials directly.
export const supabaseUrl = 'https://vowgarjznbytormwmmwc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvd2dhcmp6bmJ5dG9ybXdtbXdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzA2NDMsImV4cCI6MjA3Nzc0NjY0M30.7Be0gk-ID5OylR-fP51y9WSgxDSyNy9-cBenNvvLr2k';

// Create a single Supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Fetches the full user data object from the 'profiles' table.
 * Assumes the table has an 'id' column (matching user id) and a 'user_data' column of type JSONB.
 * @param user - The authenticated user object from Supabase.
 * @returns The user's profile data, or null if not found.
 */
export const getUserData = async (user: User): Promise<UserData | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('user_data')
    .eq('id', user.id)
    .single();

  // PGRST116 means "object not found", which is an expected case for new users, not an error.
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching profile:', error.message);
    throw error;
  }
  
  return data ? (data as any).user_data : null;
};

/**
 * Creates or updates the user's data in the 'profiles' table using upsert.
 * @param user - The authenticated user object from Supabase.
 * @param userData - The complete user data object to save.
 */
export const updateUserData = async (user: User, userData: UserData): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    // The row to upsert. The 'id' should match the user's ID.
    .upsert({ id: user.id, user_data: userData });

  if (error) {
    console.error('Error updating profile:', error.message);
    throw error;
  }
};
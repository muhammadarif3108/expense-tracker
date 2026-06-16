import { supabase } from '../lib/supabase';

/**
 * Sign up a new user with email and password.
 */
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  
  // Jika auto-login terjadi setelah registrasi (misalnya saat confirm email dimatikan),
  // kita segera logout agar user bisa diarahkan ke halaman login sesuai keinginan.
  if (data.session) {
    await supabase.auth.signOut();
  }
  
  return data;
}

/**
 * Sign in an existing user with email and password.
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get the current authenticated user.
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

/**
 * Subscribe to auth state changes.
 * Returns the unsubscribe function.
 */
export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      callback(session?.user ?? null, _event);
    }
  );
  return subscription.unsubscribe;
}

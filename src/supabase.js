import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
export const configuredAuthRedirectUrl = (import.meta.env.VITE_AUTH_REDIRECT_URL || "").trim();
export const supabaseStudyEntriesTable = (import.meta.env.VITE_SUPABASE_STUDY_TABLE || "study_entries").trim();

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function getAuthRedirectUrl() {
  if (configuredAuthRedirectUrl) {
    return configuredAuthRedirectUrl.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return undefined;
}

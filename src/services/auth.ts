import { supabase } from "./supabase";

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  role: "admin" | "user";
  username?: string;
}

export interface AuthService {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getUserProfile: () => UserProfile | null;
}

class AuthServiceImpl implements AuthService {
  async login(email: string, password: string): Promise<void> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) throw error || new Error("No user found");

    // Fetch user profile after successful login
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", data.user.id)
      .single();

    if (profileError) throw profileError;

    localStorage.setItem("user", JSON.stringify(profile));
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    localStorage.removeItem("user");
  }

  getUserProfile(): UserProfile | null {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    return JSON.parse(userStr);
  }
}

export const authService = new AuthServiceImpl();

import { supabase, queries } from "./supabase";

class AuthService {
  constructor() {
    this.user = null;
    this.userProfile = null;
    this.session = null;
    this.loading = true;

    // Initialize auth state
    this.init();
  }

  async init() {
    try {
      // Get session from storage
      const {
        data: { session },
      } = await supabase.auth.getSession();
      this.session = session;
      this.user = session?.user ?? null;

      if (this.user) {
        await this.loadUserProfile();
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (_event, session) => {
        this.session = session;
        this.user = session?.user ?? null;
        if (this.user) {
          await this.loadUserProfile();
        } else {
          this.userProfile = null;
        }
        this.loading = false;
      });
    } catch (error) {
      console.error("Error initializing auth:", error);
      this.loading = false;
    }
  }

  async loadUserProfile() {
    try {
      const { data, error } = await queries.getUserProfile(this.user.id);
      if (error) throw error;
      this.userProfile = data;
    } catch (error) {
      console.error("Error loading user profile:", error);
      this.userProfile = null;
    }
  }

  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      await this.loadUserProfile();
      if (!this.userProfile) {
        await this.signOut();
        throw new Error(
          "No user profile found. Please contact the administrator."
        );
      }
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async signUp(email, password, userData) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Create user profile with role, email, and username
      if (data.user) {
        const { error: profileError } = await queries.createUserProfile(
          data.user.id,
          userData.role,
          email,
          userData.username
        );
        if (profileError) throw profileError;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      this.userProfile = null;
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  isAuthenticated() {
    return !!this.session;
  }

  getUser() {
    return this.user;
  }

  getUserProfile() {
    return this.userProfile;
  }

  getSession() {
    return this.session;
  }

  // Use the userProfile.role field for all role checks
  hasRole(role) {
    return this.userProfile?.role === role;
  }

  isAdmin() {
    return this.hasRole("admin");
  }

  isManager() {
    return this.hasRole("manager");
  }
}

// Note: RLS admin check is now handled by the is_admin() function in the database, not by recursive policy.

export const authService = new AuthService();

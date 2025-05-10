import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database tables with exact column names
export const TABLES = {
  CUSTOMERS: {
    name: "Customers",
    columns: {
      id: "id",
      name: "name",
      phone: "phone",
    },
  },
  PROJECTS: {
    name: "Projects",
    columns: {
      id: "id",
      customer_id: "customer_id",
      created_by_user_id: "created_by_user_id",
      type: "type",
      quotation_number: "quotation_number",
      location: "location",
      received_at: "received_at",
      delivered_at: "delivered_at",
      work_duration: "work_duration",
      total_amount: "total_amount",
      paid_amount: "paid_amount",
      remaining_amount: "remaining_amount",
      notes: "notes",
    },
  },
  INSTALLATION_TEAMS: {
    name: "InstallationTeams",
    columns: {
      id: "id",
      project_id: "project_id",
      installer_name: "installer_name",
    },
  },
  PROJECT_SECTIONS: {
    name: "ProjectSections",
    columns: {
      id: "id",
      project_id: "project_id",
      section: "section",
      is_checked: "is_checked",
    },
  },
  MATERIALS: {
    name: "Materials",
    columns: {
      id: "id",
      project_id: "project_id",
      material_name: "material_name",
      quantity: "quantity",
      unit: "unit",
    },
  },
  USER_PROFILES: {
    name: "user_profiles",
    columns: {
      id: "id",
      user_id: "user_id",
      role: "role",
      created_at: "created_at",
      updated_at: "updated_at",
    },
  },
};

// Project types
export const PROJECT_TYPES = {
  INSTALLATION: "installation",
  MAINTENANCE: "maintenance",
  REPAIR: "repair",
};

// User roles
export const USER_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  USER: "user",
};

// Common functions
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
  }).format(amount);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

// Database queries
export const queries = {
  // Customers
  getCustomers: () => supabase.from(TABLES.CUSTOMERS.name).select("*"),
  getCustomerById: (id) =>
    supabase.from(TABLES.CUSTOMERS.name).select("*").eq("id", id).single(),

  // Projects
  getProjects: () =>
    supabase.from(TABLES.PROJECTS.name).select(`
      *,
      customer:customer_id(*),
      created_by:created_by_user_id(*),
      installation_teams:InstallationTeams(*),
      project_sections:ProjectSections(*),
      materials:Materials(*)
    `),
  getProjectById: (id) =>
    supabase
      .from(TABLES.PROJECTS.name)
      .select(
        `
      *,
      customer:customer_id(*),
      created_by:created_by_user_id(*),
      installation_teams:InstallationTeams(*),
      project_sections:ProjectSections(*),
      materials:Materials(*)
    `
      )
      .eq("id", id)
      .single(),

  // Installation Teams
  getTeamsByProjectId: (projectId) =>
    supabase
      .from(TABLES.INSTALLATION_TEAMS.name)
      .select("*")
      .eq("project_id", projectId),

  // Project Sections
  getSectionsByProjectId: (projectId) =>
    supabase
      .from(TABLES.PROJECT_SECTIONS.name)
      .select("*")
      .eq("project_id", projectId),

  // Materials
  getMaterialsByProjectId: (projectId) =>
    supabase
      .from(TABLES.MATERIALS.name)
      .select("*")
      .eq("project_id", projectId),

  // User Profiles
  getUserProfile: (userId) =>
    supabase
      .from(TABLES.USER_PROFILES.name)
      .select("*")
      .eq("user_id", userId)
      .single(),

  createUserProfile: (userId, role, email, username) =>
    supabase.from(TABLES.USER_PROFILES.name).insert([
      {
        user_id: userId,
        role: role,
        email: email,
        username: username,
      },
    ]),

  updateUserProfile: (userId, updates) =>
    supabase
      .from(TABLES.USER_PROFILES.name)
      .update(updates)
      .eq("user_id", userId),
};

import { createClient } from "@supabase/supabase-js";
import { SUPABASE_CONFIG } from "../config.js";

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase credentials");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Data validation helpers
const validateProjectData = (data) => {
  const requiredFields = [
    "project_name",
    "quotation_number",
    "location",
    "address",
    "receipt_date",
    "delivery_date",
    "installation_team",
    "total_amount",
    "paid_amount",
    "remaining_amount",
    "work_time",
    "receiving_employee",
  ];

  const missingFields = requiredFields.filter((field) => !data[field]);
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }

  // Validate numeric fields
  const numericFields = ["total_amount", "paid_amount", "remaining_amount"];
  numericFields.forEach((field) => {
    if (isNaN(Number(data[field]))) {
      throw new Error(`Invalid numeric value for ${field}`);
    }
  });

  // Validate dates
  const dateFields = ["receipt_date", "delivery_date"];
  dateFields.forEach((field) => {
    if (!(data[field] instanceof Date) && isNaN(Date.parse(data[field]))) {
      throw new Error(`Invalid date value for ${field}`);
    }
  });

  // Validate service_types array
  if (data.service_types && !Array.isArray(data.service_types)) {
    throw new Error("service_types must be an array");
  }

  return true;
};

// Project Operations
export const projectService = {
  // Get all projects with pagination
  async getAllProjects(page = 1, pageSize = 10) {
    try {
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;

      const { data, error, count } = await supabase
        .from("projects")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(start, end);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      return {
        data: data || [],
        error: null,
        count: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    } catch (error) {
      console.error("Error fetching projects:", error);
      return { data: [], error, count: 0, page, pageSize, totalPages: 0 };
    }
  },

  // Get single project
  async getProject(id) {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error("Error fetching project:", error);
      return { data: null, error };
    }
  },

  // Create project
  async createProject(projectData) {
    try {
      // Validate project data
      validateProjectData(projectData);

      // Format dates to ISO string
      const formattedData = {
        ...projectData,
        receipt_date: new Date(projectData.receipt_date).toISOString(),
        delivery_date: new Date(projectData.delivery_date).toISOString(),
        created_at: new Date().toISOString(),
        // Ensure numeric fields are numbers
        total_amount: Number(projectData.total_amount),
        paid_amount: Number(projectData.paid_amount),
        remaining_amount: Number(projectData.remaining_amount),
        // Ensure service_types is an array
        service_types: Array.isArray(projectData.service_types)
          ? projectData.service_types
          : projectData.service_types
            ? [projectData.service_types]
            : [],
        // Ensure is_maintenance is boolean
        is_maintenance: Boolean(projectData.is_maintenance),
      };

      const { data, error } = await supabase
        .from("projects")
        .insert([formattedData])
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error("Error creating project:", error);
      return { data: null, error };
    }
  },

  // Update project
  async updateProject(id, projectData) {
    try {
      // Validate project data
      validateProjectData(projectData);

      // Format dates to ISO string
      const formattedData = {
        ...projectData,
        receipt_date: new Date(projectData.receipt_date).toISOString(),
        delivery_date: new Date(projectData.delivery_date).toISOString(),
        // Ensure numeric fields are numbers
        total_amount: Number(projectData.total_amount),
        paid_amount: Number(projectData.paid_amount),
        remaining_amount: Number(projectData.remaining_amount),
        // Ensure service_types is an array
        service_types: Array.isArray(projectData.service_types)
          ? projectData.service_types
          : projectData.service_types
            ? [projectData.service_types]
            : [],
        // Ensure is_maintenance is boolean
        is_maintenance: Boolean(projectData.is_maintenance),
      };

      const { data, error } = await supabase
        .from("projects")
        .update(formattedData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error("Error updating project:", error);
      return { data: null, error };
    }
  },

  // Delete project
  async deleteProject(id) {
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      return { error: null };
    } catch (error) {
      console.error("Error deleting project:", error);
      return { error };
    }
  },

  // Search projects
  async searchProjects(query) {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .or(
          `project_name.ilike.%${query}%,quotation_number.ilike.%${query}%,location.ilike.%${query}%`
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error("Error searching projects:", error);
      return { data: [], error };
    }
  },
};

// Storage Operations
export const storageService = {
  // Upload file
  async uploadFile(file, path) {
    try {
      const { data, error } = await supabase.storage
        .from(SUPABASE_CONFIG.storage.bucket)
        .upload(path, file);

      if (error) {
        console.error("Supabase storage error:", error);
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error("Error uploading file:", error);
      return { data: null, error };
    }
  },

  // Get file URL
  getFileUrl(path) {
    try {
      const { data } = supabase.storage
        .from(SUPABASE_CONFIG.storage.bucket)
        .getPublicUrl(path);

      return { data, error: null };
    } catch (error) {
      console.error("Error getting file URL:", error);
      return { data: null, error };
    }
  },

  // Delete file
  async deleteFile(path) {
    try {
      const { error } = await supabase.storage
        .from(SUPABASE_CONFIG.storage.bucket)
        .remove([path]);

      if (error) {
        console.error("Supabase storage error:", error);
        throw error;
      }

      return { error: null };
    } catch (error) {
      console.error("Error deleting file:", error);
      return { error };
    }
  },
};

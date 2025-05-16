import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../services/supabase";
import toast from "react-hot-toast";
import { authService } from "../services/auth";

// Components
import ProjectFilters from "../components/projects/ProjectFilters";
import ProjectCard from "../components/projects/ProjectCard";
import ProjectTable from "../components/projects/ProjectTable";
import CreateProjectModal from "../components/projects/CreateProjectModal";
import EditProjectModal from "../components/projects/EditProjectModal";
import DeleteProjectModal from "../components/projects/DeleteProjectModal";

interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface Project {
  id: string;
  quotation_number: string;
  type: string;
  status: string;
  customer: Customer | null;
  customer_id: string;
  total_amount: string;
  paid_amount: string;
  location: string;
  location_link: string;
  received_at: string;
  delivered_at: string;
  work_duration: string;
  notes: string;
}

const Projects: React.FC = () => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    status: "",
  });

  const currentUserId = authService.getUserProfile()?.user_id || "";

  useEffect(() => {
    fetchProjects();
    fetchCustomers();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      // Fetch projects
      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("*");

      // Fetch customers
      const { data: customers, error: customersError } = await supabase
        .from("customers")
        .select("id, name, phone");

      if (projectsError) throw projectsError;
      if (customersError) throw customersError;

      // Merge customer info into projects
      const projectsWithCustomer = projects.map((project) => ({
        ...project,
        customer: customers.find((c) => c.id === project.customer_id) || null,
      }));

      setProjects(projectsWithCustomer);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error(t("common.error"));
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("id, name, phone");

      if (error) throw error;
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error(t("common.error"));
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateProject = async (
    project: any,
    projectMaterials: { material_id: string; quantity: number }[]
  ) => {
    try {
      // 1. Create the project
      const { data, error } = await supabase
        .from("projects")
        .insert([project])
        .select()
        .single();

      if (error) throw error;

      // 2. Insert project_materials
      if (data && projectMaterials && projectMaterials.length > 0) {
        const materialsToInsert = projectMaterials.map((mat) => ({
          project_id: data.id,
          material_id: mat.material_id,
          quantity: mat.quantity,
        }));
        await supabase.from("project_materials").insert(materialsToInsert);
      }

      // 3. Update UI as before
      const newProject = {
        ...data,
        customer: customers.find((c) => c.id === data.customer_id) || null,
      };

      setProjects((prev) => [...prev, newProject]);
      setShowCreateModal(false);
      toast.success(t("projects.createSuccess"));
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error(t("common.error"));
    }
  };

  const handleEditProject = async (project: Project) => {
    try {
      const { error } = await supabase
        .from("projects")
        .update({
          type: project.type,
          status: project.status,
          customer_id: project.customer_id,
          total_amount: project.total_amount,
          paid_amount: project.paid_amount,
          location: project.location,
          location_link: project.location_link,
          received_at: project.received_at,
          delivered_at: project.delivered_at,
          work_duration: project.work_duration,
          notes: project.notes,
        })
        .eq("id", project.id);

      if (error) throw error;

      // Update the project in the list
      setProjects((prev) =>
        prev.map((p) =>
          p.id === project.id
            ? {
                ...project,
                customer:
                  customers.find((c) => c.id === project.customer_id) || null,
              }
            : p
        )
      );

      setShowEditModal(false);
      setSelectedProject(null);
      toast.success(t("projects.updateSuccess"));
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error(t("common.error"));
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", selectedProject.id);

      if (error) throw error;

      // Remove the project from the list
      setProjects((prev) => prev.filter((p) => p.id !== selectedProject.id));
      setShowDeleteModal(false);
      setSelectedProject(null);
      toast.success(t("projects.deleteSuccess"));
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error(t("common.error"));
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.quotation_number
        ?.toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      project.location?.toLowerCase().includes(filters.search.toLowerCase()) ||
      project.customer?.name
        ?.toLowerCase()
        .includes(filters.search.toLowerCase());
    const matchesType = !filters.type || project.type === filters.type;
    const matchesStatus = !filters.status || project.status === filters.status;
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t("common.error")}
          </h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 sm:p-8 max-w-7xl mx-auto mt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <span className="text-primary">{t("projects.title")}</span>
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary text-white px-6 py-2 rounded-lg shadow hover:bg-primary-dark transition flex items-center gap-2"
        >
          <svg
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          {t("projects.addNew")}
        </button>
      </div>

      {/* Filters */}
      <ProjectFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Mobile: Card layout */}
      <div className="block md:hidden">
        <div className="grid grid-cols-1 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => {
                setSelectedProject(project);
                setShowEditModal(true);
              }}
              onDelete={() => {
                setSelectedProject(project);
                setShowDeleteModal(true);
              }}
            />
          ))}
          {filteredProjects.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              {t("common.noResults")}
            </div>
          )}
        </div>
      </div>

      {/* Desktop: Table layout */}
      <div className="hidden md:block">
        <ProjectTable
          projects={filteredProjects}
          onEdit={(project) => {
            setSelectedProject(project);
            setShowEditModal(true);
          }}
          onDelete={(project) => {
            setSelectedProject(project);
            setShowDeleteModal(true);
          }}
        />
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProject}
        customers={customers}
        projects={projects}
        currentUserId={currentUserId}
      />

      {/* Edit Project Modal */}
      {selectedProject && (
        <EditProjectModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProject(null);
          }}
          onSubmit={handleEditProject}
          project={selectedProject}
          customers={customers}
        />
      )}

      {/* Delete Project Modal */}
      {selectedProject && (
        <DeleteProjectModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedProject(null);
          }}
          onConfirm={handleDeleteProject}
          projectNumber={selectedProject.quotation_number}
        />
      )}
    </div>
  );
};

export default Projects;

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "../services/supabase";
import toast from "react-hot-toast";
import ProjectDetailsComponent from "../components/projects/ProjectDetails";
import EditProjectModal from "../components/projects/EditProjectModal";
import DeleteProjectModal from "../components/projects/DeleteProjectModal";
import { queries } from "../services/supabase";

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
  customer: {
    id: string;
    name: string;
    phone: string;
  } | null;
  customer_id: string;
  total_amount: number;
  paid_amount: number;
  location: string;
  location_link?: string;
  received_at: string;
  delivered_at?: string;
  work_duration?: string;
  notes?: string;
  created_by?: {
    username?: string;
    email?: string;
  } | null;
  created_at?: string;
}

const ProjectDetails: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [materials, setMaterials] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    checkAdminStatus();
    fetchCustomers();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();
      if (profile?.role !== "admin") {
        setIsAdmin(false);
      } else {
        setIsAdmin(true);
      }
      fetchProject();
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
      fetchProject();
    }
  };

  const fetchProject = async () => {
    try {
      setLoading(true);
      const { data, error } = await queries.getProjectById(id);
      if (error) throw error;
      setProject(data);
      // Fetch project materials with join
      const { data: materialsData, error: materialsError } =
        await queries.getProjectMaterialsWithDetails(id);
      if (!materialsError && materialsData) {
        setMaterials(
          materialsData.map((pm: any) => ({
            id: pm.material?.id || pm.id,
            material_name: pm.material?.material_name || "",
            partno: pm.material?.partno || "",
            quantity: pm.quantity,
          }))
        );
      } else {
        setMaterials([]);
      }
    } catch (error) {
      console.error("Error fetching project:", error);
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
      setCustomers(data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error(t("common.error"));
    }
  };

  const handleEditProject = (updatedProject: any) => {
    // Convert string fields to numbers as needed
    const projectToSave = {
      ...updatedProject,
      total_amount: Number(updatedProject.total_amount) || 0,
      paid_amount: Number(updatedProject.paid_amount) || 0,
      location_link: updatedProject.location_link || "",
    };
    (async () => {
      try {
        const { error } = await supabase
          .from("projects")
          .update({
            type: projectToSave.type,
            status: projectToSave.status,
            customer_id: projectToSave.customer_id,
            total_amount: projectToSave.total_amount,
            paid_amount: projectToSave.paid_amount,
            location: projectToSave.location,
            location_link: projectToSave.location_link,
            received_at: projectToSave.received_at,
            delivered_at: projectToSave.delivered_at,
            work_duration: projectToSave.work_duration,
            notes: projectToSave.notes,
          })
          .eq("id", projectToSave.id);

        if (error) throw error;

        setProject({
          ...projectToSave,
          total_amount: projectToSave.total_amount,
          paid_amount: projectToSave.paid_amount,
        });
        setShowEditModal(false);
        toast.success(t("projects.updateSuccess"));
      } catch (error) {
        console.error("Error updating project:", error);
        toast.error(t("common.error"));
      }
    })();
  };

  const handleDeleteProject = async () => {
    if (!project) return;

    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", project.id);

      if (error) throw error;

      toast.success(t("projects.deleteSuccess"));
      navigate("/projects");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error(t("common.error"));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t("common.error")}
          </h2>
          <p className="text-gray-600">{error || t("projects.notFound")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-8">
      <ProjectDetailsComponent
        project={{
          ...project,
          total_amount: String(project?.total_amount ?? ""),
          paid_amount: String(project?.paid_amount ?? ""),
          customer: project?.customer
            ? {
                name: project.customer.name,
                phone: project.customer.phone,
              }
            : null,
          location_link: project?.location_link || "",
          delivered_at: project?.delivered_at || "",
          work_duration: project?.work_duration || "",
          notes: project?.notes || "",
          created_at: project?.created_at || "",
          materials: materials,
        }}
        onEdit={() => setShowEditModal(true)}
        onDelete={() => setShowDeleteModal(true)}
        isAdmin={isAdmin}
      />
      {/* Edit Project Modal */}
      {showEditModal && project && (
        <EditProjectModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditProject}
          project={{
            ...project,
            total_amount: String(project.total_amount),
            paid_amount: String(project.paid_amount),
            location_link: project.location_link || "",
            delivered_at: project.delivered_at || "",
            work_duration: project.work_duration || "",
            notes: project.notes || "",
          }}
          customers={customers}
        />
      )}
      {/* Delete Project Modal */}
      {showDeleteModal && project && (
        <DeleteProjectModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteProject}
          projectNumber={project.quotation_number}
        />
      )}
    </div>
  );
};

export default ProjectDetails;

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../services/supabase";
import ProjectStats from "../components/projectStatus/ProjectStats";
import toast from "react-hot-toast";
import { authService } from "../services/auth";
import { Navigate } from "react-router-dom";

interface Project {
  id: string;
  status: string;
  total_amount: string;
  delivered_at?: string;
}

const ProjectStatsPage: React.FC = () => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = authService.getUserProfile();

  if (!user || user.role !== "admin") {
    return <Navigate to="/projects" />;
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("id, status, total_amount, delivered_at");
      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error(t("common.error"));
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = {
    totalProjects: projects.length,
    inProgressProjects: projects.filter((p) => p.status === "in_progress")
      .length,
    completedProjects: projects.filter((p) => p.status === "completed").length,
    totalAmount: projects.reduce(
      (sum, p) => sum + (parseFloat(p.total_amount) || 0),
      0
    ),
    averageAmount: projects.length
      ? projects.reduce(
          (sum, p) => sum + (parseFloat(p.total_amount) || 0),
          0
        ) / projects.length
      : 0,
    pendingProjects: projects.filter((p) => p.status === "pending").length,
    underDesignProjects: projects.filter((p) => p.status === "under_design")
      .length,
    overdueProjects: projects.filter(
      (p) =>
        p.delivered_at &&
        new Date(p.delivered_at) < new Date() &&
        p.status !== "completed"
    ).length,
  };

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
      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
        <span className="text-primary">{t("nav.projectsStatus")}</span>
      </h1>
      <ProjectStats
        totalProjects={stats.totalProjects}
        inProgressProjects={stats.inProgressProjects}
        completedProjects={stats.completedProjects}
        totalAmount={stats.totalAmount}
        averageAmount={stats.averageAmount}
        pendingProjects={stats.pendingProjects}
        underDesignProjects={stats.underDesignProjects}
        overdueProjects={stats.overdueProjects}
      />
    </div>
  );
};

export default ProjectStatsPage;

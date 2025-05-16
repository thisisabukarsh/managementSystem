import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

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
  total_amount: string;
  paid_amount: string;
  location: string;
  location_link: string;
  received_at: string;
  delivered_at: string;
  work_duration: string;
  notes: string;
}

interface ProjectCardProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  // onEdit,
  // onDelete,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "under_design":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "interior":
        return "bg-indigo-100 text-indigo-800";
      case "exterior":
        return "bg-pink-100 text-pink-800";
      case "both":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // const remainingAmount =
  //   parseFloat(project.total_amount) - parseFloat(project.paid_amount);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition">
      {/* Project Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t("projects.quotationNumber")}: {project.quotation_number}
          </h3>
          <div className="flex gap-2 mt-1">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                project.type
              )}`}
            >
              {t(`projects.types.${project.type}`)}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                project.status
              )}`}
            >
              {t(`projects.status.${project.status}`)}
            </span>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      {project.customer && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-500 mb-1">
            {t("projects.customer")}
          </h4>
          <p className="text-gray-900">{project.customer.name}</p>
          <p className="text-sm text-gray-600">{project.customer.phone}</p>
        </div>
      )}

      {/* Location */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-500 mb-1">
          {t("projects.location")}
        </h4>
        <p className="text-gray-900">{project.location}</p>
        {project.location_link && (
          <a
            href={project.location_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            {t("projects.viewLocation")}
          </a>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={() => navigate(`/projects/${project.id}`)}
        className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition"
      >
        {t("projects.viewDetails")}
      </button>
    </div>
  );
};

export default ProjectCard;

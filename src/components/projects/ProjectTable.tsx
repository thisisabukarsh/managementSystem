import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../../services/supabase";

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

interface ProjectTableProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  onEdit,
  onDelete,
}) => {
  const { t, i18n } = useTranslation();
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

  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t("projects.quotationNumber")}
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t("projects.type")}
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t("projects.customer")}
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t("filters.status")}
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t("projects.location")}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {projects.map((project) => (
            <tr
              key={project.id}
              className="hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="text-sm font-medium text-primary">
                  {project.quotation_number}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <span
                  className={`px-2 py-1 text-xs font-bold rounded-full ${getTypeColor(
                    project.type
                  )}`}
                >
                  {t(`projects.types.${project.type}`)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="text-sm text-gray-900">
                  {project.customer?.name || t("common.noCustomer")}
                </div>
                {project.customer?.phone && (
                  <div className="text-sm text-gray-500">
                    {project.customer.phone}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <span
                  className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(
                    project.status
                  )}`}
                >
                  {t(`projects.status.${project.status}`)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="text-sm text-gray-900 truncate max-w-xs">
                  {project.location}
                </div>
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
              </td>
            </tr>
          ))}
          {projects.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-6 py-4 text-center text-sm text-gray-500"
              >
                {t("common.noResults")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectTable;

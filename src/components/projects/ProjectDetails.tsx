import React from "react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../../services/supabase";

interface Project {
  id: string;
  quotation_number: string;
  type: string;
  status: string;
  customer: {
    name: string;
    phone: string;
  } | null;
  total_amount: string;
  paid_amount: string;
  location: string;
  location_link: string;
  received_at: string;
  delivered_at: string;
  work_duration: string;
  notes: string;
  created_by?: {
    username?: string;
    email?: string;
  } | null;
  created_at?: string;
  materials?: Array<{
    id: string;
    material_name: string;
    partno?: string;
    quantity: number;
    unit?: string;
  }>;
}

interface ProjectDetailsProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  project,
  onEdit,
  onDelete,
}) => {
  const { t, i18n } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "under_design":
        return "bg-purple-100 text-purple-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "installation":
        return "bg-blue-100 text-blue-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "repair":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const remaining =
    (parseFloat(project.total_amount) || 0) -
    (parseFloat(project.paid_amount) || 0);

  return (
    <div
      className={`bg-white rounded-xl shadow-sm p-4 sm:p-6 max-w-4xl mx-auto ${
        i18n.dir() === "rtl" ? "rtl" : ""
      }`}
      dir={i18n.dir()}
    >
      {/* Header: Quotation, Type, Status */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t("projects.quotationNumber")}: {project.quotation_number}
          </h2>
          <div className="flex flex-wrap gap-2 mt-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${getTypeColor(
                project.type
              )}`}
            >
              {t(`projects.types.${project.type}`)}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(
                project.status
              )}`}
            >
              {t(`projects.status.${project.status}`)}
            </span>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={onEdit}
            className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-2"
          >
            <svg
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            {t("common.edit")}
          </button>
          <button
            onClick={onDelete}
            className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
          >
            <svg
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            {t("common.delete")}
          </button>
        </div>
      </div>
      {/* Creator Info */}
      {(project.created_by || project.created_at) && (
        <div className="mb-6 flex flex-col sm:flex-row gap-2 text-sm text-gray-500">
          {project.created_by && (
            <span>
              {t("projects.createdBy")}{" "}
              {project.created_by.username || project.created_by.email || "-"}
            </span>
          )}
          {project.created_at && (
            <span>
              {t("projects.createdAt")}{" "}
              {new Date(project.created_at).toLocaleDateString(i18n.language)}
            </span>
          )}
        </div>
      )}

      {/* Responsive grid for all info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Info */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <svg
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="text-primary"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            {t("projects.customerInfo")}
          </h3>
          <div className="space-y-1">
            <div>
              <span className="text-sm text-gray-500">
                {t("projects.customerName")}
              </span>
              <div className="font-medium text-gray-900">
                {project.customer?.name || t("common.noCustomer")}
              </div>
            </div>
            {project.customer?.phone && (
              <div>
                <span className="text-sm text-gray-500">
                  {t("projects.customerPhone")}
                </span>
                <div className="font-medium text-gray-900">
                  {project.customer.phone}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Location Info */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <svg
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="text-primary"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {t("projects.locationInfo")}
          </h3>
          <div className="space-y-1">
            <div>
              <span className="text-sm text-gray-500">
                {t("projects.location")}
              </span>
              <div className="font-medium text-gray-900">
                {project.location}
              </div>
            </div>
            {project.location_link && (
              <div>
                <span className="text-sm text-gray-500">
                  {t("projects.locationLink")}
                </span>
                <a
                  href={project.location_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-dark transition-colors"
                >
                  {t("common.openMap")}
                </a>
              </div>
            )}
          </div>
        </div>
        {/* Timeline Info */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <svg
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="text-primary"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {t("projects.timelineInfo")}
          </h3>
          <div className="space-y-1">
            <div>
              <span className="text-sm text-gray-500">
                {t("projects.receivedAt")}
              </span>
              <div className="font-medium text-gray-900">
                {project.received_at
                  ? new Date(project.received_at).toLocaleDateString(
                      i18n.language
                    )
                  : "-"}
              </div>
            </div>
            {project.delivered_at && (
              <div>
                <span className="text-sm text-gray-500">
                  {t("projects.deliveredAt")}
                </span>
                <div className="font-medium text-gray-900">
                  {new Date(project.delivered_at).toLocaleDateString(
                    i18n.language
                  )}
                </div>
              </div>
            )}
            {project.work_duration && (
              <div>
                <span className="text-sm text-gray-500">
                  {t("projects.workDuration")}
                </span>
                <div className="font-medium text-gray-900">
                  {project.work_duration}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Financial Info */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <svg
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="text-primary"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {t("projects.financialInfo")}
          </h3>
          <div className="space-y-1">
            <div>
              <span className="text-sm text-gray-500">
                {t("projects.totalAmount")}
              </span>
              <div className="font-medium text-gray-900">
                {formatCurrency(
                  parseFloat(project.total_amount) || 0,
                  i18n.language
                )}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-500">
                {t("projects.paidAmount")}
              </span>
              <div className="font-medium text-gray-900">
                {formatCurrency(
                  parseFloat(project.paid_amount) || 0,
                  i18n.language
                )}
              </div>
            </div>
            {remaining > 0 && (
              <div>
                <span className="text-sm text-gray-500">
                  {t("projects.remainingAmount")}
                </span>
                <div className="font-medium text-gray-900">
                  {formatCurrency(remaining, i18n.language)}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Materials Info */}
        {project.materials && project.materials.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-4 mt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="text-primary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
              {t("projects.materialsSection")}
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-primary/10">
                    <th className="px-3 py-2 text-center  font-semibold text-gray-700 whitespace-nowrap">
                      {t("materials.name")}
                    </th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-700 whitespace-nowrap">
                      {t("materials.partno")}
                    </th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-700 whitespace-nowrap">
                      {t("materials.quantity")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {project.materials.map((mat, idx) => (
                    <tr
                      key={mat.id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-100"}
                    >
                      <td className="px-3 py-2 break-words max-w-xs">
                        {mat.material_name}
                      </td>
                      <td className="px-3 py-2 break-words max-w-xs">
                        {mat.partno || "-"}
                      </td>
                      <td className="px-3 py-2 text-center">{mat.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      {project.notes && (
        <div className="mt-6 bg-gray-50 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <svg
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="text-primary"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
            {t("projects.notes")}
          </h3>
          <div className="text-gray-700 whitespace-pre-wrap">
            {project.notes}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;

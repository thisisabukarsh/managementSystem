import React from "react";
import { useTranslation } from "react-i18next";
import { PROJECT_TYPES } from "../../services/supabase";

interface ProjectFiltersProps {
  filters: {
    search: string;
    type: string;
    status: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          placeholder={t("filters.searchPlaceholder")}
          className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary transition-colors"
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
        />
      </div>

      <div className="relative">
        <select
          className="block w-full pl-3 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary transition-colors appearance-none bg-white"
          value={filters.type}
          onChange={(e) => onFilterChange("type", e.target.value)}
        >
          <option value="">{t("filters.allTypes")}</option>
          {Object.values(PROJECT_TYPES).map((type) => (
            <option key={type} value={type}>
              {t(`projects.types.${type}`)}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      <div className="relative">
        <select
          className="block w-full pl-3 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary transition-colors appearance-none bg-white"
          value={filters.status}
          onChange={(e) => onFilterChange("status", e.target.value)}
        >
          <option value="">{t("filters.allStatuses")}</option>
          <option value="under_design">
            {t("projects.status.under_design")}
          </option>
          <option value="pending">{t("projects.status.pending")}</option>
          <option value="in_progress">
            {t("projects.status.in_progress")}
          </option>
          <option value="completed">{t("projects.status.completed")}</option>
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ProjectFilters;

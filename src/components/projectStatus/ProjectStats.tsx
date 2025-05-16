import React from "react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../../services/supabase";

interface ProjectStatsProps {
  totalProjects: number;
  inProgressProjects: number;
  completedProjects: number;
  totalAmount: number;
  averageAmount: number;
  pendingProjects: number;
  underDesignProjects: number;
  overdueProjects: number;
}

const ProjectStats: React.FC<ProjectStatsProps> = ({
  totalProjects,
  inProgressProjects,
  completedProjects,
  totalAmount,
  averageAmount,
  pendingProjects,
  underDesignProjects,
  overdueProjects,
}) => {
  const { t, i18n } = useTranslation();

  const stats = [
    {
      title: t("stats.totalProjects"),
      value: totalProjects,
      icon: (
        <svg
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="text-primary"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      color: "primary",
    },
    {
      title: t("stats.inProgress"),
      value: inProgressProjects,
      icon: (
        <svg
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="text-blue-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "blue",
    },
    {
      title: t("stats.completed"),
      value: completedProjects,
      icon: (
        <svg
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="text-green-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "green",
    },
    {
      title: t("stats.totalAmount"),
      value: formatCurrency(totalAmount, i18n.language),
      icon: (
        <svg
          width="24"
          height="24"
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
      ),
      color: "primary",
    },
    {
      title: t("stats.pending"),
      value: pendingProjects,
      icon: (
        <svg
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="text-yellow-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "yellow",
    },
    {
      title: t("stats.underDesign"),
      value: underDesignProjects,
      icon: (
        <svg
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="text-purple-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
          />
        </svg>
      ),
      color: "purple",
    },
    {
      title: t("stats.averageAmount"),
      value: formatCurrency(averageAmount, i18n.language),
      icon: (
        <svg
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="text-indigo-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      color: "indigo",
    },
    {
      title: t("stats.overdue"),
      value: overdueProjects,
      icon: (
        <svg
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="text-orange-500"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "orange",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow p-6 border border-gray-100 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
              <h3
                className={`text-2xl font-bold mt-1 ${
                  stat.color === "primary"
                    ? "text-primary"
                    : stat.color === "blue"
                    ? "text-blue-600"
                    : stat.color === "green"
                    ? "text-green-600"
                    : stat.color === "yellow"
                    ? "text-yellow-600"
                    : stat.color === "purple"
                    ? "text-purple-600"
                    : "text-indigo-600"
                }`}
              >
                {stat.value}
              </h3>
            </div>
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                stat.color === "primary"
                  ? "bg-primary/10"
                  : stat.color === "blue"
                  ? "bg-blue-100"
                  : stat.color === "green"
                  ? "bg-green-100"
                  : stat.color === "yellow"
                  ? "bg-yellow-100"
                  : stat.color === "purple"
                  ? "bg-purple-100"
                  : "bg-indigo-100"
              }`}
            >
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectStats;

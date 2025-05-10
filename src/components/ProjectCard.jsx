import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const ProjectCard = ({ project }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'installation':
        return 'bg-purple-100 text-purple-800';
      case 'maintenance':
        return 'bg-indigo-100 text-indigo-800';
      case 'repair':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {project.quotation_number}
          </h3>
          <p className="text-sm text-gray-600">{project.location}</p>
        </div>
        <div className="flex space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
            {t(`projects.status.${project.status}`)}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(project.type)}`}>
            {t(`projects.types.${project.type}`)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">{t('projects.customer')}</p>
          <p className="text-sm font-medium">{project.customer_name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">{t('projects.totalAmount')}</p>
          <p className="text-sm font-medium">{project.total_amount} ريال</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-500">{t('projects.progress')}</span>
          <span className="font-medium">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          onClick={() => navigate(`/projects/${project.id}`)}
          className="btn btn-secondary btn-sm"
        >
          {t('common.view')}
        </button>
        <button
          onClick={() => navigate(`/projects/${project.id}/edit`)}
          className="btn btn-primary btn-sm"
        >
          {t('common.edit')}
        </button>
      </div>
    </div>
  );
};

export default ProjectCard; 
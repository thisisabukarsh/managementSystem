import React from 'react';
import { useTranslation } from 'react-i18next';

const Filters = ({ filters, onFilterChange }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <input
            type="text"
            placeholder={t('filters.searchPlaceholder')}
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="input"
          />
        </div>

        <div>
          <select
            value={filters.type}
            onChange={(e) => onFilterChange('type', e.target.value)}
            className="input"
          >
            <option value="">{t('filters.allTypes')}</option>
            <option value="installation">{t('projects.types.installation')}</option>
            <option value="maintenance">{t('projects.types.maintenance')}</option>
            <option value="repair">{t('projects.types.repair')}</option>
          </select>
        </div>

        <div>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="input"
          >
            <option value="">{t('filters.allStatuses')}</option>
            <option value="pending">{t('projects.status.pending')}</option>
            <option value="in_progress">{t('projects.status.in_progress')}</option>
            <option value="completed">{t('projects.status.completed')}</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Filters; 
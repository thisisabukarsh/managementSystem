import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

const ProjectForm = ({ project, onSubmit }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(project || {
    type: '',
    status: 'pending',
    customer_id: '',
    quotation_number: '',
    location: '',
    received_at: '',
    delivered_at: '',
    work_duration: '',
    total_amount: 0,
    paid_amount: 0,
    notes: '',
    progress: 0
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (project) {
        await supabase
          .from('projects')
          .update(formData)
          .eq('id', project.id);
      } else {
        await supabase
          .from('projects')
          .insert([formData]);
      }
      onSubmit?.();
      navigate('/projects');
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('projects.type')}
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="input"
            required
          >
            <option value="">{t('projects.selectType')}</option>
            <option value="installation">{t('projects.types.installation')}</option>
            <option value="maintenance">{t('projects.types.maintenance')}</option>
            <option value="repair">{t('projects.types.repair')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('projects.customer')}
          </label>
          <select
            value={formData.customer_id}
            onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
            className="input"
            required
          >
            <option value="">{t('projects.selectCustomer')}</option>
            {/* Add customer options here */}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('projects.quotationNumber')}
          </label>
          <input
            type="text"
            value={formData.quotation_number}
            onChange={(e) => setFormData({ ...formData, quotation_number: e.target.value })}
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('projects.location')}
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('projects.receivedAt')}
          </label>
          <input
            type="date"
            value={formData.received_at}
            onChange={(e) => setFormData({ ...formData, received_at: e.target.value })}
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('projects.deliveredAt')}
          </label>
          <input
            type="date"
            value={formData.delivered_at}
            onChange={(e) => setFormData({ ...formData, delivered_at: e.target.value })}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('projects.workDuration')}
          </label>
          <input
            type="text"
            value={formData.work_duration}
            onChange={(e) => setFormData({ ...formData, work_duration: e.target.value })}
            className="input"
            placeholder={t('projects.workDurationPlaceholder')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('projects.totalAmount')}
          </label>
          <input
            type="number"
            value={formData.total_amount}
            onChange={(e) => setFormData({ ...formData, total_amount: parseFloat(e.target.value) })}
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('projects.paidAmount')}
          </label>
          <input
            type="number"
            value={formData.paid_amount}
            onChange={(e) => setFormData({ ...formData, paid_amount: parseFloat(e.target.value) })}
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('projects.progress')}
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={formData.progress}
            onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
            className="w-full"
          />
          <span className="text-sm text-gray-500">{formData.progress}%</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('projects.notes')}
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="input h-32"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => navigate('/projects')}
          className="btn btn-secondary"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? t('common.saving') : t('common.save')}
        </button>
      </div>
    </form>
  );
};

export default ProjectForm; 
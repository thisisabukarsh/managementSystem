import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { authService } from '../services/auth';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const typeColors = {
  installation: 'bg-blue-100 text-blue-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  repair: 'bg-green-100 text-green-800',
};

const TimelineItem = ({ icon, label, value, naLabel }) => (
  <div className="flex items-start gap-3 mb-4">
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
      {icon}
    </div>
    <div>
      <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{label}</div>
      <div className="text-base text-gray-900 font-medium">{value || <span className='text-gray-400'>{naLabel}</span>}</div>
    </div>
  </div>
);

const Skeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-8 bg-gray-200 rounded w-1/2" />
    <div className="h-6 bg-gray-200 rounded w-1/3" />
    <div className="h-6 bg-gray-200 rounded w-1/4" />
    <div className="h-32 bg-gray-200 rounded w-full" />
  </div>
);

function formatAED(amount, lang) {
  return new Intl.NumberFormat(lang === 'ar' ? 'ar-AE' : 'en-AE', { style: 'currency', currency: 'AED' }).format(amount);
}

const ProjectDetails = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [customerProjects, setCustomerProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [role, setRole] = useState('user');
  const [copied, setCopied] = useState({ quotation: false, phone: false });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      if (error || !data) {
        setError(t('common.error'));
        setLoading(false);
        return;
      }
      setProject(data);
      // Fetch customer
      const { data: customerData } = await supabase
        .from('customers')
        .select('id, name, phone')
        .eq('id', data.customer_id)
        .single();
      setCustomer(customerData);
      // Fetch all projects for this customer (except current)
      const { data: custProjects } = await supabase
        .from('projects')
        .select('id, quotation_number')
        .eq('customer_id', data.customer_id);
      setCustomerProjects((custProjects || []).filter(p => p.id !== data.id));
      // Get user role from authService
      const profile = authService.getUserProfile();
      setRole(profile?.role || 'user');
      setLoading(false);
    };
    fetchData();
  }, [id, t]);

  const handleEdit = () => {
    navigate(`/projects/edit/${project.id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm(t('common.delete') + '?')) return;
    const { error } = await supabase.from('projects').delete().eq('id', project.id);
    if (error) {
      toast.error(t('common.error'));
    } else {
      toast.success(t('common.success'));
      navigate('/projects');
    }
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(c => ({ ...c, [key]: true }));
    setTimeout(() => setCopied(c => ({ ...c, [key]: false })), 1200);
  };

  const openLocation = () => {
    if (project.location_link) {
      window.open(project.location_link, '_blank');
    }
  };

  // Auto-calc work duration (days)
  function calcWorkDuration() {
    if (project?.received_at && project?.delivered_at) {
      const start = new Date(project.received_at);
      const end = new Date(project.delivered_at);
      const diff = Math.abs(end - start);
      return Math.ceil(diff / (1000 * 60 * 60 * 24)) + ' ' + t('projects.workDurationDays');
    }
    return t('projects.workDurationNA');
  }

  if (loading) return <div className="p-8 max-w-2xl mx-auto"><Skeleton /></div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  const showAmounts = role === 'admin';
  const showAllDetails = role === 'admin' || role === 'manager';
  const today = new Date().toISOString().slice(0, 10);
  const isOverdue = project.delivered_at && project.delivered_at < today && project.status !== 'completed';
  const remaining = (parseFloat(project.total_amount) || 0) - (parseFloat(project.paid_amount) || 0);

  return (
    <div className="max-w-5xl mx-auto mt-10 px-2 md:px-0">
      <button
        className="mb-8 text-primary hover:underline flex items-center gap-2 text-sm font-medium"
        onClick={() => navigate('/projects')}
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        {t('nav.projects')}
      </button>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Project Info Card */}
        <div className="flex-1 bg-white rounded-2xl shadow-xl p-8 transition-transform hover:scale-[1.01] duration-200">
          <div className="flex items-center gap-3 mb-6">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-primary"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 0a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2m-6 0h6" /></svg>
            <h2 className="text-2xl font-bold">{t('projects.title')}</h2>
            <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold capitalize ${typeColors[project.type] || 'bg-gray-200 text-gray-700'}`}>{t(`projects.types.${project.type}`)}</span>
            {isOverdue && <span className="ml-2 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">{t('projects.status.in_progress')}</span>}
          </div>
          {/* Quotation number and copy icon aligned */}
          <div className="mb-6 flex items-center gap-2">
            <div className="text-gray-500 text-xs font-semibold uppercase mb-1">{t('projects.quotationNumber')}</div>
            <div className="flex items-center gap-2 bg-gray-100 rounded px-3 py-1">
              <span className="text-lg font-medium text-primary select-all">{project.quotation_number}</span>
              <button onClick={() => handleCopy(project.quotation_number, 'quotation')} className="text-gray-400 hover:text-primary" title={t('common.copy')}>
                {copied.quotation ? <span>&#10003;</span> : <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16h8a2 2 0 002-2V8a2 2 0 00-2-2H8a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>}
              </button>
            </div>
          </div>
          {/* Timeline for milestones */}
          <div className="mb-6">
            <div className="text-gray-500 text-xs font-semibold uppercase mb-3">{t('projects.progress')}</div>
            <div className="border-l-2 border-primary/20 pl-6">
              <TimelineItem icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} label={t('projects.receivedAt')} value={project.received_at} naLabel={t('projects.workDurationNA')} />
              <TimelineItem icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>} label={t('projects.deliveredAt')} value={project.delivered_at} naLabel={t('projects.workDurationNA')} />
              <TimelineItem icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" /></svg>} label={t('projects.workDuration')} value={calcWorkDuration()} naLabel={t('projects.workDurationNA')} />
            </div>
          </div>
          {showAllDetails && (
            <>
              <div className="mb-4">
                <div className="text-gray-500 text-xs font-semibold uppercase mb-1">{t('projects.location')}</div>
                <div className="flex items-center gap-2">
                  <span className="text-base text-gray-900">{project.location}</span>
                  {project.location_link && (
                    <button
                      className="text-primary underline hover:text-primary-dark text-sm font-medium flex items-center gap-1"
                      onClick={openLocation}
                    >
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><circle cx="12" cy="10" r="3" /></svg>
                      {t('common.view')}
                    </button>
                  )}
                </div>
              </div>
              <div className="mb-4">
                <div className="text-gray-500 text-xs font-semibold uppercase mb-1">{t('projects.notes')}</div>
                <div className="text-base text-gray-900 whitespace-pre-line">{project.notes || <span className='text-gray-400'>N/A</span>}</div>
              </div>
            </>
          )}
          {showAmounts && (
            <div className="mt-8 border-t pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-gray-500 text-xs font-semibold uppercase mb-1">{t('projects.totalAmount')}</div>
                <div className="text-lg font-bold text-gray-900">{formatAED(project.total_amount, i18n.language)}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs font-semibold uppercase mb-1">{t('projects.paidAmount')}</div>
                <div className="text-lg font-bold text-green-700">{formatAED(project.paid_amount, i18n.language)}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs font-semibold uppercase mb-1">{t('projects.remainingAmount')}</div>
                <div className="text-lg font-bold text-red-700">{formatAED(remaining, i18n.language)}</div>
              </div>
            </div>
          )}
          {role === 'admin' && (
            <div className="flex gap-4 mt-10">
              <button
                className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary-dark shadow flex items-center gap-2"
                onClick={handleEdit}
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6l11-11a2.828 2.828 0 00-4-4L5 17v4z" /></svg>
                {t('common.edit')}
              </button>
              <button
                className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 shadow flex items-center gap-2"
                onClick={handleDelete}
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                {t('common.delete')}
              </button>
            </div>
          )}
        </div>
        {/* Customer Info Card */}
        <div className="w-full md:w-80 bg-white rounded-2xl shadow-xl p-0 flex flex-col border border-gray-100 transition-transform hover:scale-[1.01] duration-200">
          {/* Header */}
          <div className="flex flex-col items-center bg-primary/5 rounded-t-2xl p-6 pb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-primary"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div className="text-xl font-bold mb-1 text-gray-900 text-center truncate w-full" title={customer?.name}>{customer?.name || t('projects.workDurationNA')}</div>
            <div className="text-xs text-gray-500 mb-2">{t('nav.customers')}</div>
          </div>
          <div className="w-full border-t border-gray-100" />
          {/* Phone */}
          <div className="w-full flex flex-col items-center px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-semibold uppercase">{t('projects.customerPhone')}</span>
            </div>
            <div className="mt-2 w-full flex justify-center">
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 shadow-sm select-all">
                <span className="font-mono text-base text-gray-800 mr-2">{customer?.phone || t('projects.workDurationNA')}</span>
                <button
                  onClick={() => handleCopy(customer?.phone, 'phone')}
                  className="ml-2 text-gray-400 hover:text-primary focus:outline-none"
                  aria-label={t('common.copy')}
                  title={t('common.copy')}
                  type="button"
                >
                  {copied.phone ? (
                    <span className="text-green-600">&#10003;</span>
                  ) : (
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16h8a2 2 0 002-2V8a2 2 0 00-2-2H8a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          {/* Other Projects */}
          {customerProjects.length > 0 && (
            <div className="w-full px-6 pb-4">
              <div className="text-xs text-gray-500 font-semibold uppercase mb-2 mt-2">{t('projects.otherProjects')}</div>
              <ul className="space-y-1 max-h-32 overflow-y-auto pr-1">
                {customerProjects.map(p => (
                  <li key={p.id}>
                    <button
                      className="text-primary hover:underline text-sm truncate"
                      onClick={() => navigate(`/projects/${p.id}`)}
                      title={p.quotation_number}
                    >
                      {t('projects.quotationNumber')}: {p.quotation_number}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails; 
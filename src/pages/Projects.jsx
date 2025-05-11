import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase, PROJECT_TYPES, formatCurrency, formatDate } from '../services/supabase';
import toast from 'react-hot-toast';

const Projects = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({
    type: PROJECT_TYPES.INSTALLATION,
    customer_id: "",
    quotation_number: "",
    location: "",
    location_link: "",
    received_at: "",
    delivered_at: "",
    work_duration: "",
    total_amount: "",
    paid_amount: "",
    remaining_amount: "",
    notes: "",
    status: "under_design",
  });
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: ''
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [deleteProject, setDeleteProject] = useState(null);

  useEffect(() => {
    fetchProjects();
    fetchCustomers();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      // Fetch projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*');
      // Fetch customers
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('id, name, phone');
      if (projectsError) throw projectsError;
      if (customersError) throw customersError;
      // Merge customer info into projects
      const projectsWithCustomer = projects.map(project => ({
        ...project,
        customer: customers.find(c => c.id === project.customer_id) || null
      }));
      setProjects(projectsWithCustomer);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, phone');
      
      if (error) throw error;
      setCustomers(data);
    } catch (error) {
      toast.error('Error fetching customers');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.quotation_number?.toLowerCase().includes(filters.search.toLowerCase()) ||
      project.location?.toLowerCase().includes(filters.search.toLowerCase()) ||
      project.customer?.name?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesType = !filters.type || project.type === filters.type;
    const matchesStatus = !filters.status || project.status === filters.status;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          type: newProject.type,
          customer_id: newProject.customer_id,
          quotation_number: newProject.quotation_number,
          location: newProject.location,
          location_link: newProject.location_link,
          received_at: newProject.received_at,
          delivered_at: newProject.delivered_at,
          work_duration: newProject.work_duration,
          total_amount: parseFloat(newProject.total_amount) || 0,
          paid_amount: parseFloat(newProject.paid_amount) || 0,
          remaining_amount: parseFloat(newProject.remaining_amount) || 0,
          notes: newProject.notes,
          status: newProject.status,
        }])
        .select();

      if (error) throw error;
      toast.success("Project created successfully!");
      setShowCreateModal(false);
      setNewProject({
        type: PROJECT_TYPES.INSTALLATION,
        customer_id: "",
        quotation_number: "",
        location: "",
        location_link: "",
        received_at: "",
        delivered_at: "",
        work_duration: "",
        total_amount: "",
        paid_amount: "",
        remaining_amount: "",
        notes: "",
        status: "under_design",
      });
      fetchProjects();
    } catch (error) {
      toast.error("Error creating project: " + error.message);
    }
  };

  const handleEditProject = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          type: editProject.type,
          customer_id: editProject.customer_id,
          quotation_number: editProject.quotation_number,
          location: editProject.location,
          received_at: editProject.received_at,
          delivered_at: editProject.delivered_at,
          work_duration: editProject.work_duration,
          total_amount: parseFloat(editProject.total_amount) || 0,
          paid_amount: parseFloat(editProject.paid_amount) || 0,
          remaining_amount: parseFloat(editProject.remaining_amount) || 0,
          notes: editProject.notes,
          status: editProject.status,
        })
        .eq('id', editProject.id)
        .select();

      if (error) throw error;
      toast.success('Project updated successfully!');
      setShowEditModal(false);
      setEditProject(null);
      fetchProjects();
    } catch (error) {
      toast.error('Error updating project: ' + error.message);
    }
  };

  const handleDeleteProject = async () => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', deleteProject.id);

      if (error) throw error;
      toast.success('Project deleted successfully!');
      setShowDeleteModal(false);
      setDeleteProject(null);
      fetchProjects();
    } catch (error) {
      toast.error('Error deleting project: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">{t('common.loading')}</p>
      </div>
    );
  }

  // Responsive: Card layout for mobile, table for desktop
  return (
    <div className="bg-white shadow rounded-lg p-4 sm:p-8 max-w-7xl mx-auto mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <span className="text-primary">{t("projects.title")}</span>
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary text-white px-6 py-2 rounded-lg shadow hover:bg-primary-dark transition"
        >
          + {t("projects.addNew")}
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder={t('filters.searchPlaceholder')}
          className="border rounded-lg px-4 py-2"
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
        <select
          className="border rounded-lg px-4 py-2"
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
        >
          <option value="">{t('filters.allTypes')}</option>
          {Object.values(PROJECT_TYPES).map(type => (
            <option key={type} value={type}>{t(`projects.types.${type}`)}</option>
          ))}
        </select>
        <select
          className="border rounded-lg px-4 py-2"
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">{t('filters.allStatuses')}</option>
          <option value="under_design">{t('projects.status.under_design')}</option>
          <option value="pending">{t('projects.status.pending')}</option>
          <option value="in_progress">{t('projects.status.in_progress')}</option>
          <option value="completed">{t('projects.status.completed')}</option>
        </select>
      </div>

      {/* Mobile: Card layout */}
      <div className="block md:hidden">
        <div className="grid grid-cols-1 gap-4">
          {filteredProjects.map(project => (
            <div key={project.id} className="bg-gray-50 rounded-xl shadow p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg text-primary">{project.quotation_number}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${project.type === 'installation' ? 'bg-blue-100 text-blue-800' : project.type === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{project.type}</span>
              </div>
              <div className="text-gray-700 text-sm">
                {t('projects.customer')}: <span className="font-medium">{project.customer?.name}</span>
              </div>
              <button
                className="mt-2 bg-primary text-white rounded px-4 py-2 font-semibold shadow hover:bg-primary-dark transition"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                {t('common.view')}
              </button>
            </div>
          ))}
          {filteredProjects.length === 0 && (
            <div className="text-center text-gray-500 py-8">{t('common.noResults')}</div>
          )}
        </div>
      </div>

      {/* Desktop: Table layout */}
      <div className="hidden md:block overflow-x-auto rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">{t('projects.quotationNumber')}</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">{t('projects.type')}</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">{t('projects.customer')}</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">{t('common.view')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProjects.map(project => (
              <tr key={project.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{project.quotation_number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{project.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{project.customer?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <button
                    className="text-primary hover:text-primary-dark p-1 rounded hover:bg-primary-50"
                    title={t('common.view')}
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    {t('common.view')}
                  </button>
                </td>
              </tr>
            ))}
            {filteredProjects.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                  {t('common.noResults')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{t('projects.addNew')}</h2>
                  <p className="text-sm text-gray-500">{t('projects.addNewDescription')}</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateProject} className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status Section */}
                <div className="md:col-span-2 mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('projects.statusLabel') || t('filters.status')}</label>
                  <select
                    required
                    className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary transition-colors"
                    value={newProject.status || 'under_design'}
                    onChange={e => setNewProject({ ...newProject, status: e.target.value })}
                  >
                    <option value="under_design">{t('projects.status.under_design')}</option>
                    <option value="pending">{t('projects.status.pending')}</option>
                    <option value="in_progress">{t('projects.status.in_progress')}</option>
                    <option value="completed">{t('projects.status.completed')}</option>
                  </select>
                </div>
                {/* Basic Information Section */}
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t('projects.basicInfoSection')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Searchable Customer Combobox */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('projects.customer')}</label>
                      {newProject.customer_id ? (
                        <div className="flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-2">
                          <span className="font-medium text-primary">{customers.find(c => c.id === newProject.customer_id)?.name}</span>
                          <button
                            type="button"
                            className="text-gray-400 hover:text-primary px-1"
                            onClick={() => setNewProject({ ...newProject, customer_id: '', customerSearch: '' })}
                            title={t('projects.clear')}
                            aria-label={t('projects.clear')}
                          >
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary transition-colors mb-1 bg-gray-50 px-3 py-2"
                              placeholder={t('projects.selectCustomer')}
                              value={newProject.customerSearch || ''}
                              onChange={e => {
                                setNewProject({ ...newProject, customerSearch: e.target.value, customer_id: '' });
                              }}
                              autoComplete="off"
                            />
                            {newProject.customerSearch && (
                              <button
                                type="button"
                                className="text-gray-400 hover:text-primary px-2"
                                onClick={() => setNewProject({ ...newProject, customerSearch: '', customer_id: '' })}
                                title={t('projects.clear')}
                                aria-label={t('projects.clear')}
                              >
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            )}
                          </div>
                          <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow max-h-40 overflow-y-auto mt-1" style={{ display: newProject.customerSearch ? 'block' : 'none' }}>
                            {customers.filter(c => c.name.toLowerCase().includes((newProject.customerSearch || '').toLowerCase())).map(customer => (
                              <div
                                key={customer.id}
                                className={`px-4 py-2 cursor-pointer hover:bg-primary/10 ${newProject.customer_id === customer.id ? 'bg-primary/10 font-bold' : ''}`}
                                onClick={() => setNewProject({ ...newProject, customer_id: customer.id, customerSearch: customer.name })}
                              >
                                {customer.name}
                              </div>
                            ))}
                            {customers.filter(c => c.name.toLowerCase().includes((newProject.customerSearch || '').toLowerCase())).length === 0 && (
                              <div className="px-4 py-2 text-gray-400">{t('projects.noCustomerFound')}</div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('projects.type')}</label>
                      <select
                        required
                        className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary transition-colors"
                        value={newProject.type}
                        onChange={(e) => setNewProject({ ...newProject, type: e.target.value })}
                      >
                        {Object.values(PROJECT_TYPES).map(type => (
                          <option key={type} value={type}>{t(`projects.types.${type}`)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('projects.quotationNumber')}</label>
                      <input
                        type="text"
                        required
                        className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary transition-colors"
                        value={newProject.quotation_number}
                        onChange={(e) => setNewProject({ ...newProject, quotation_number: e.target.value })}
                        placeholder={t('projects.quotationNumberPlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('projects.location')}</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary transition-colors pr-10"
                          value={newProject.location}
                          onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                          placeholder={t('projects.locationPlaceholder')}
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                          onClick={() => {
                            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(newProject.location)}`;
                            window.open(mapsUrl, '_blank');
                          }}
                        >
                          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('projects.locationLink')}</label>
                      <input
                        type="url"
                        className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary transition-colors"
                        value={newProject.location_link}
                        onChange={(e) => setNewProject({ ...newProject, location_link: e.target.value })}
                        placeholder="https://maps.google.com/..."
                      />
                    </div>
                  </div>
                </div>

                {/* Timeline Section */}
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t('projects.timelineSection')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('projects.receivedAt')}</label>
                      <input
                        type="date"
                        required
                        className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary transition-colors"
                        value={newProject.received_at}
                        onChange={(e) => setNewProject({ ...newProject, received_at: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('projects.deliveredAt')}</label>
                      <input
                        type="date"
                        className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary transition-colors"
                        value={newProject.delivered_at}
                        onChange={(e) => setNewProject({ ...newProject, delivered_at: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Financial Information Section */}
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t('projects.financialSection')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('projects.totalAmount')}</label>
                      <div className="relative">
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary transition-colors pl-8"
                          value={newProject.total_amount}
                          onChange={(e) => setNewProject({ ...newProject, total_amount: e.target.value })}
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">AED</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('projects.paidAmount')}</label>
                      <div className="relative">
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary transition-colors pl-8"
                          value={newProject.paid_amount}
                          onChange={(e) => setNewProject({ ...newProject, paid_amount: e.target.value })}
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">AED</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('projects.remainingAmount')}</label>
                      <div className="relative">
                        <input
                          type="number"
                          readOnly
                          className="w-full rounded-lg border-gray-200 bg-gray-50 pl-8"
                          value={parseFloat(newProject.total_amount || 0) - parseFloat(newProject.paid_amount || 0)}
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">AED</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information Section */}
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    {t('projects.additionalSection')}
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('projects.notes')}</label>
                    <textarea
                      className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary transition-colors"
                      rows="4"
                      value={newProject.notes}
                      onChange={(e) => setNewProject({ ...newProject, notes: e.target.value })}
                      placeholder={t('projects.notesPlaceholder')}
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('common.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && editProject && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-medium mb-4">Edit Project</h2>
            <form onSubmit={handleEditProject} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer</label>
                  <select
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    value={editProject.customer_id}
                    onChange={(e) => setEditProject({ ...editProject, customer_id: e.target.value })}
                  >
                    <option value="">Select Customer</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    value={editProject.type}
                    onChange={(e) => setEditProject({ ...editProject, type: e.target.value })}
                  >
                    {Object.values(PROJECT_TYPES).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quotation Number</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    value={editProject.quotation_number}
                    onChange={(e) => setEditProject({ ...editProject, quotation_number: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    value={editProject.location}
                    onChange={(e) => setEditProject({ ...editProject, location: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                  <input
                    type="number"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    value={editProject.total_amount}
                    onChange={(e) => setEditProject({ ...editProject, total_amount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Paid Amount</label>
                  <input
                    type="number"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    value={editProject.paid_amount}
                    onChange={(e) => setEditProject({ ...editProject, paid_amount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Received Date</label>
                  <input
                    type="date"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    value={editProject.received_at}
                    onChange={(e) => setEditProject({ ...editProject, received_at: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Delivery Date</label>
                  <input
                    type="date"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    value={editProject.delivered_at}
                    onChange={(e) => setEditProject({ ...editProject, delivered_at: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  rows="3"
                  value={editProject.notes}
                  onChange={(e) => setEditProject({ ...editProject, notes: e.target.value })}
                />
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteProject && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-medium mb-4">Delete Project</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProject}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects; 
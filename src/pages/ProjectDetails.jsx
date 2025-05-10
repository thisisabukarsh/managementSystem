import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { authService } from '../services/auth';
import toast from 'react-hot-toast';

const typeColors = {
  installation: 'bg-blue-100 text-blue-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  repair: 'bg-green-100 text-green-800',
};

const TimelineItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 mb-4">
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
      {icon}
    </div>
    <div>
      <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{label}</div>
      <div className="text-base text-gray-900 font-medium">{value || <span className='text-gray-400'>N/A</span>}</div>
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

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [role, setRole] = useState('user');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      if (error || !data) {
        setError('Project not found');
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
      // Get user role from authService
      const profile = authService.getUserProfile();
      setRole(profile?.role || 'user');
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleEdit = () => {
    navigate(`/projects/edit/${project.id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    const { error } = await supabase.from('projects').delete().eq('id', project.id);
    if (error) {
      toast.error('Failed to delete project');
    } else {
      toast.success('Project deleted');
      navigate('/projects');
    }
  };

  if (loading) return <div className="p-8 max-w-2xl mx-auto"><Skeleton /></div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  const showAmounts = role === 'admin';
  const showAllDetails = role === 'admin' || role === 'manager';

  return (
    <div className="max-w-5xl mx-auto mt-10 px-2 md:px-0">
      <button
        className="mb-8 text-primary hover:underline flex items-center gap-2 text-sm font-medium"
        onClick={() => navigate('/projects')}
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Projects
      </button>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Project Info Card */}
        <div className="flex-1 bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-primary"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 0a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2m-6 0h6" /></svg>
            <h2 className="text-2xl font-bold">Project Info</h2>
            <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold capitalize ${typeColors[project.type] || 'bg-gray-200 text-gray-700'}`}>{project.type}</span>
          </div>
          <div className="mb-6">
            <div className="text-gray-500 text-xs font-semibold uppercase mb-1">Quotation #</div>
            <div className="text-lg font-medium text-gray-900">{project.quotation_number}</div>
          </div>
          {/* Timeline for milestones */}
          <div className="mb-6">
            <div className="text-gray-500 text-xs font-semibold uppercase mb-3">Timeline</div>
            <div className="border-l-2 border-primary/20 pl-6">
              <TimelineItem icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} label="Received At" value={project.received_at} />
              <TimelineItem icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>} label="Delivered At" value={project.delivered_at} />
              {showAllDetails && <TimelineItem icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" /></svg>} label="Work Duration" value={project.work_duration} />}
            </div>
          </div>
          {showAllDetails && (
            <>
              <div className="mb-4">
                <div className="text-gray-500 text-xs font-semibold uppercase mb-1">Location</div>
                <div className="text-base text-gray-900">{project.location}</div>
              </div>
              <div className="mb-4">
                <div className="text-gray-500 text-xs font-semibold uppercase mb-1">Notes</div>
                <div className="text-base text-gray-900 whitespace-pre-line">{project.notes || <span className='text-gray-400'>N/A</span>}</div>
              </div>
            </>
          )}
          {showAmounts && (
            <div className="mt-8 border-t pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-gray-500 text-xs font-semibold uppercase mb-1">Total Amount</div>
                <div className="text-lg font-bold text-gray-900">{project.total_amount}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs font-semibold uppercase mb-1">Paid</div>
                <div className="text-lg font-bold text-green-700">{project.paid_amount}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs font-semibold uppercase mb-1">Remaining</div>
                <div className="text-lg font-bold text-red-700">{project.remaining_amount}</div>
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
                Edit
              </button>
              <button
                className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 shadow flex items-center gap-2"
                onClick={handleDelete}
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                Delete
              </button>
            </div>
          )}
        </div>
        {/* Customer Info Card */}
        <div className="w-full md:w-80 bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center border border-gray-100">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-primary"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <div className="text-lg font-bold mb-1">{customer?.name || 'N/A'}</div>
          <div className="text-gray-500 mb-4">Customer</div>
          <div className="w-full border-t border-gray-100 my-4" />
          <div className="w-full flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" /></svg>
              <span className="text-sm text-gray-700">ID: {customer?.id}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8" /></svg>
              <span className="text-sm text-gray-700">Phone: {customer?.phone || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails; 
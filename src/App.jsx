import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from './components/Layout';
import Login from './pages/Login';
import Projects from './pages/Projects';
import Users from './pages/Users';
import { authService } from './services/auth';
import { USER_ROLES } from './services/supabase';
import { Toaster } from 'react-hot-toast';

function App() {
  const { i18n } = useTranslation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Poll the authService.loading state
    const interval = setInterval(() => {
      if (!authService.loading) {
        setLoading(false);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-xl">Loading...</div>;
  }

  const PrivateRoute = ({ children }) => {
    if (!authService.isAuthenticated()) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  const AdminRoute = ({ children }) => {
    const profile = authService.getUserProfile();
    console.log(profile);
    if (!profile || profile.role !== USER_ROLES.ADMIN) {
      return <Navigate to="/projects" />;
    }
    return children;
  };

  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/projects" replace />} />
            <Route path="projects" element={<Projects />} />
            <Route path="customers" element={<div className='text-2xl text-red-500 font-bold text-center'>Customers Page</div>} />
            <Route path="teams" element={<div>Teams Page</div>} />
            <Route path="materials" element={<div>Materials Page</div>} />
            <Route
              path="users"
              element={
                <AdminRoute>
                  <Users />
                </AdminRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App; 
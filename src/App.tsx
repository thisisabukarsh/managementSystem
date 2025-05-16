import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import Users from "./pages/Users";
import Customers from "./pages/Customers";
import ProjectDetails from "./pages/ProjectDetails";
import ProjectStatsPage from "./pages/ProjectStats";
import { authService } from "./services/auth";
import { Toaster } from "react-hot-toast";
import Materials from "./pages/Materials";

interface PrivateRouteProps {
  children: React.ReactNode;
}

interface AdminRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const user = authService.getUserProfile();
  if (!user) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const profile = authService.getUserProfile();
  if (!profile || profile.role !== "admin") {
    return <Navigate to="/projects" />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  useTranslation();

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
            <Route path="projects/:id" element={<ProjectDetails />} />
            <Route path="customers" element={<Customers />} />
            <Route path="teams" element={<div>Teams Page</div>} />
            <Route path="materials" element={<Materials />} />
            <Route
              path="users"
              element={
                <AdminRoute>
                  <Users />
                </AdminRoute>
              }
            />
            <Route path="projects-status" element={<ProjectStatsPage />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
};

export default App;

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase, USER_ROLES, queries } from "../services/supabase";
import { authService } from "../services/auth";
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const SUPABASE_ADMIN_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_PROJECT_URL = import.meta.env.VITE_SUPABASE_URL;

const Users = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: USER_ROLES.USER,
  });
  const [editUser, setEditUser] = useState({
    user_id: "",
    username: "",
    email: "",
    role: USER_ROLES.USER,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      console.log("Current auth user:", currentUser);

      if (!currentUser) {
        throw new Error("No authenticated user found");
      }

      // Get the current user's profile to check if they're an admin
      const { data: currentUserProfile, error: currentUserError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", currentUser.id)
        .single();

      console.log("Current user profile:", currentUserProfile);
      console.log("USER_ROLES.ADMIN:", USER_ROLES.ADMIN);
      console.log("Current user role:", currentUserProfile?.role);
      
      if (currentUserError) {
        console.error("Error fetching current user profile:", currentUserError);
        throw currentUserError;
      }

      // Only allow admins to see all users
      if (!currentUserProfile) {
        throw new Error("User profile not found");
      }

      if (currentUserProfile.role !== USER_ROLES.ADMIN) {
        console.log("User is not admin. Role:", currentUserProfile.role);
        throw new Error("Not authorized to view users");
      }

      // Get all user profiles with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from("user_profiles")
        .select("*");
      
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      console.log("Fetched profiles:", profiles);
      setUsers(profiles);
    } catch (error) {
      console.error("Error in fetchUsers:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Sanitize username and create email
      const sanitizedUsername = newUser.username.trim().replace(/[^a-zA-Z0-9]/g, "");
      const email = `${sanitizedUsername}@black-diamond.com`;

      const { error } = await authService.signUp(email, newUser.password, {
        role: newUser.role,
        username: sanitizedUsername,
      });

      if (error) throw error;

      // Reset form and close modal
      setNewUser({
        username: "",
        password: "",
        role: USER_ROLES.USER,
      });
      setShowCreateModal(false);
      fetchUsers();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handlers for edit/delete
  const openEditModal = (user) => {
    setEditUser({
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Delete user logic
  const handleDeleteUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setLoading(true);
    setError("");
    try {
      // 1. Delete from Auth (admin API)
      const res = await fetch(
        `${SUPABASE_PROJECT_URL}/auth/v1/admin/users/${selectedUser.user_id}`,
        {
          method: "DELETE",
          headers: {
            apiKey: SUPABASE_ADMIN_KEY,
            Authorization: `Bearer ${SUPABASE_ADMIN_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error("Failed to delete user from Auth");

      // 2. Delete from user_profiles
      const { error: profileError } = await supabase
        .from("user_profiles")
        .delete()
        .eq("user_id", selectedUser.user_id);
      if (profileError) throw profileError;

      setShowDeleteModal(false);
      setSelectedUser(null);
      alert("User deleted successfully!");
      fetchUsers();
    } catch (error) {
      setError(error.message);
      alert("Error deleting user: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Edit user logic
  const handleEditUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Only update the role in user_profiles
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({
          role: editUser.role,
        })
        .eq("user_id", editUser.user_id);
      if (profileError) throw profileError;

      setShowEditModal(false);
      setEditUser({ user_id: "", username: "", email: "", role: USER_ROLES.USER });
      alert("User role updated successfully!");
      fetchUsers();
    } catch (error) {
      setError(error.message);
      alert("Error updating user: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-8 max-w-5xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <span className="text-primary">{t("users.title")}</span>
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary text-white px-6 py-2 rounded-lg shadow hover:bg-primary-dark transition"
        >
          + {t("users.createNew")}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-500 rounded-md">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                {t("users.username")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                {t("users.email")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                {t("users.role")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                {t("users.createdAt")}
              </th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {user.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${user.role === 'admin' ? 'bg-green-100 text-green-800' : user.role === 'manager' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{user.role}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium flex gap-2 justify-center">
                  <button
                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                    onClick={() => openEditModal(user)}
                    title="Edit"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                    onClick={() => openDeleteModal(user)}
                    title="Delete"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-medium mb-4">{t("users.createNew")}</h2>
            <form onSubmit={handleCreateUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("users.username")}
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      required
                      className="flex-1 block w-full rounded-none rounded-l-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm"
                      placeholder="username"
                      value={newUser.username}
                      onChange={(e) =>
                        setNewUser({ ...newUser, username: e.target.value })
                      }
                    />
                    <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                      @black-diamond.com
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("users.password")}
                  </label>
                  <input
                    type="password"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("users.role")}
                  </label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value })
                    }
                  >
                    <option value={USER_ROLES.USER}>{t("users.roles.user")}</option>
                    <option value={USER_ROLES.MANAGER}>
                      {t("users.roles.manager")}
                    </option>
                    <option value={USER_ROLES.ADMIN}>{t("users.roles.admin")}</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark"
                >
                  {loading ? t("common.saving") : t("common.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-medium mb-4">{t("users.editUser")}</h2>
            <form onSubmit={handleEditUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("users.role")}
                  </label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    value={editUser.role}
                    onChange={(e) =>
                      setEditUser({ ...editUser, role: e.target.value })
                    }
                  >
                    <option value={USER_ROLES.USER}>{t("users.roles.user")}</option>
                    <option value={USER_ROLES.MANAGER}>
                      {t("users.roles.manager")}
                    </option>
                    <option value={USER_ROLES.ADMIN}>{t("users.roles.admin")}</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark"
                >
                  {t("common.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-medium mb-4">{t("users.deleteUser")}</h2>
            <p>{t("users.confirmDelete")} {selectedUser?.username}?</p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users; 
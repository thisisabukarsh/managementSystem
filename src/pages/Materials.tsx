import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../services/supabase";
import toast from "react-hot-toast";

interface Material {
  id: string;
  material_name: string;
  partno: string;
}

const Materials: React.FC = () => {
  const { t } = useTranslation();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMaterial, setEditMaterial] = useState<Material | null>(null);
  const [form, setForm] = useState({
    material_name: "",
    partno: "",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("materials").select("*");
    if (error) {
      toast.error(t("common.error"));
    } else {
      setMaterials(data || []);
    }
    setLoading(false);
  };

  const handleOpenModal = (material?: Material) => {
    if (material) {
      setEditMaterial(material);
      setForm({
        material_name: material.material_name,
        partno: material.partno || "",
      });
    } else {
      setEditMaterial(null);
      setForm({ material_name: "", partno: "" });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMaterial(null);
    setForm({ material_name: "", partno: "" });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.material_name) {
      toast.error(t("common.error"));
      return;
    }
    if (editMaterial) {
      // Update
      const { error } = await supabase
        .from("materials")
        .update({
          material_name: form.material_name,
          partno: form.partno,
        })
        .eq("id", editMaterial.id);
      if (error) {
        toast.error(t("common.error"));
      } else {
        toast.success(t("materials.updateSuccess"));
        fetchMaterials();
        handleCloseModal();
      }
    } else {
      // Create
      const { error } = await supabase.from("Materials").insert([
        {
          material_name: form.material_name,
          partno: form.partno,
        },
      ]);
      if (error) {
        toast.error(t("common.error"));
      } else {
        toast.success(t("materials.createSuccess"));
        fetchMaterials();
        handleCloseModal();
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase
      .from("materials")
      .delete()
      .eq("id", deleteId);
    if (error) {
      toast.error(t("common.error"));
    } else {
      toast.success(t("materials.deleteSuccess"));
      fetchMaterials();
      setDeleteId(null);
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t("materials.title")}</h1>
        <button
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          onClick={() => handleOpenModal()}
        >
          {t("materials.addMaterial")}
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow border">
            <thead>
              <tr>
                <th className="px-4 py-2 text-center">{t("materials.name")}</th>
                <th className="px-4 py-2 text-center">
                  {t("materials.partno")}
                </th>
                <th className="px-4 py-2 text-center">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((mat) => (
                <tr key={mat.id} className="border-t">
                  <td className="px-4 py-2 text-center">{mat.material_name}</td>
                  <td className="px-4 py-2 text-center">{mat.partno}</td>
                  <td className="px-4 py-2 flex justify-center gap-2">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => handleOpenModal(mat)}
                    >
                      {t("common.edit")}
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => setDeleteId(mat.id)}
                    >
                      {t("common.delete")}
                    </button>
                  </td>
                </tr>
              ))}
              {materials.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-gray-500">
                    {t("materials.noMaterials")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">
              {editMaterial
                ? t("materials.editMaterial")
                : t("materials.addMaterial")}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("materials.name")}
                </label>
                <input
                  type="text"
                  name="material_name"
                  className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary"
                  value={form.material_name}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("materials.partno")}
                </label>
                <input
                  type="text"
                  name="partno"
                  className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary"
                  value={form.partno}
                  onChange={handleFormChange}
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-100 rounded-lg"
                  onClick={handleCloseModal}
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg"
                >
                  {editMaterial ? t("common.edit") : t("common.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4">
              {t("materials.deleteMaterial")}
            </h2>
            <p className="mb-6">{t("materials.deleteConfirm")}</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-100 rounded-lg"
                onClick={() => setDeleteId(null)}
              >
                {t("common.cancel")}
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
                onClick={handleDelete}
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

export default Materials;

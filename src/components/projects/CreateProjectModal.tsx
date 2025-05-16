import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { PROJECT_TYPES } from "../../services/supabase";
import ProjectCalendar from "../ProjectCalendar";
import { differenceInCalendarDays, addDays, format } from "date-fns";

interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface Project {
  id: string;
  received_at: string;
  delivered_at: string;
  quotation_number: string;
  status: string;
}

interface Material {
  id: string;
  material_name: string;
  partno: string;
}

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    project: any,
    projectMaterials: { material_id: string; quantity: number }[]
  ) => void;
  customers: Customer[];
  projects: Project[];
  currentUserId: string;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  customers,
  projects,
  currentUserId,
}) => {
  const { t } = useTranslation();
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

  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const [materials, setMaterials] = useState<Material[]>([]);
  const [projectMaterials, setProjectMaterials] = useState<
    { material_id: string; quantity: number }[]
  >([]);

  useEffect(() => {
    if (isOpen) {
      fetchMaterials();
    }
  }, [isOpen]);

  const fetchMaterials = async () => {
    const { data, error } = await import("../../services/supabase").then((m) =>
      m.supabase.from("materials").select("*")
    );
    if (!error && data) {
      setMaterials(data);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      customer.phone.includes(customerSearch)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total_amount = Number(newProject.total_amount) || 0;
    const paid_amount = Number(newProject.paid_amount) || 0;
    const remaining_amount = total_amount - paid_amount;
    onSubmit(
      {
        ...newProject,
        total_amount,
        paid_amount,
        remaining_amount,
        created_by_user_id: currentUserId,
      },
      projectMaterials
    );
  };

  const handleCalendarDateSelect = (date: string) => {
    // If no start date, set received_at
    if (
      !newProject.received_at ||
      (newProject.received_at && newProject.delivered_at)
    ) {
      setNewProject({
        ...newProject,
        received_at: date,
        delivered_at: "",
        work_duration: "",
      });
    } else {
      // Set delivered_at and auto-calculate work_duration
      const start = new Date(newProject.received_at);
      const end = new Date(date);
      const duration = differenceInCalendarDays(end, start) + 1;
      setNewProject({
        ...newProject,
        delivered_at: date,
        work_duration: duration > 0 ? duration.toString() : "",
      });
    }
  };

  const handleWorkDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewProject((prev) => {
      // If value is a positive integer, update dates
      const duration = parseInt(value, 10);
      if (!isNaN(duration) && duration > 0) {
        const baseStart = prev.received_at
          ? new Date(prev.received_at)
          : new Date();
        const received_at = prev.received_at
          ? prev.received_at
          : format(baseStart, "yyyy-MM-dd");
        const delivered_at = format(
          addDays(baseStart, duration - 1),
          "yyyy-MM-dd"
        );
        return {
          ...prev,
          work_duration: value,
          received_at,
          delivered_at,
        };
      }
      return { ...prev, work_duration: value };
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <svg
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="text-primary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {t("projects.addNew")}
              </h2>
              <p className="text-sm text-gray-500">
                {t("projects.addNewDescription")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <svg
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Section */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("projects.statusLabel")}
              </label>
              <select
                required
                className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary transition-colors"
                value={newProject.status}
                onChange={(e) =>
                  setNewProject({ ...newProject, status: e.target.value })
                }
              >
                <option value="under_design">
                  {t("projects.status.under_design")}
                </option>
                <option value="pending">{t("projects.status.pending")}</option>
                <option value="in_progress">
                  {t("projects.status.in_progress")}
                </option>
                <option value="completed">
                  {t("projects.status.completed")}
                </option>
              </select>
            </div>

            {/* Basic Information Section */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="text-primary"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {t("projects.basicInfoSection")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Search */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("projects.customer")}
                  </label>
                  {newProject.customer_id ? (
                    <div className="flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-2">
                      <span className="font-medium text-primary">
                        {
                          customers.find((c) => c.id === newProject.customer_id)
                            ?.name
                        }
                      </span>
                      <button
                        type="button"
                        className="text-gray-400 hover:text-primary px-1"
                        onClick={() =>
                          setNewProject({ ...newProject, customer_id: "" })
                        }
                      >
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary transition-colors"
                        placeholder={t("projects.searchCustomer")}
                        value={customerSearch}
                        onChange={(e) => {
                          setCustomerSearch(e.target.value);
                          setShowCustomerDropdown(true);
                        }}
                        onFocus={() => setShowCustomerDropdown(true)}
                      />
                      {showCustomerDropdown && customerSearch && (
                        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                          {filteredCustomers.map((customer) => (
                            <button
                              key={customer.id}
                              type="button"
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                              onClick={() => {
                                setNewProject({
                                  ...newProject,
                                  customer_id: customer.id,
                                });
                                setCustomerSearch("");
                                setShowCustomerDropdown(false);
                              }}
                            >
                              <div className="font-medium">{customer.name}</div>
                              <div className="text-sm text-gray-500">
                                {customer.phone}
                              </div>
                            </button>
                          ))}
                          {filteredCustomers.length === 0 && (
                            <div className="px-4 py-2 text-sm text-gray-500">
                              {t("common.noResults")}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Project Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("projects.type")}
                  </label>
                  <select
                    required
                    className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary transition-colors"
                    value={newProject.type}
                    onChange={(e) =>
                      setNewProject({ ...newProject, type: e.target.value })
                    }
                  >
                    {Object.values(PROJECT_TYPES).map((type) => (
                      <option key={type} value={type}>
                        {t(`projects.types.${type}`)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quotation Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("projects.quotationNumber")}
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary transition-colors"
                    value={newProject.quotation_number}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        quotation_number: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("projects.location")}
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary transition-colors"
                    value={newProject.location}
                    onChange={(e) =>
                      setNewProject({ ...newProject, location: e.target.value })
                    }
                  />
                </div>

                {/* Location Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("projects.locationLink")}
                  </label>
                  <input
                    type="url"
                    className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary transition-colors"
                    value={newProject.location_link}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        location_link: e.target.value,
                      })
                    }
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="text-primary"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {t("projects.timelineSection")}
              </h3>
              <div className="grid grid-cols-1 gap-6">
                {/* Project Calendar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("projects.selectPeriod")}
                  </label>
                  <ProjectCalendar
                    selectedDate={newProject.received_at}
                    onDateSelect={handleCalendarDateSelect}
                    onClear={() => {
                      setNewProject({
                        ...newProject,
                        received_at: "",
                        delivered_at: "",
                        work_duration: "",
                      });
                    }}
                    projects={projects}
                    minDate={new Date().toISOString().split("T")[0]}
                    className="w-full"
                    mode="range"
                    startDate={newProject.received_at}
                    endDate={newProject.delivered_at}
                  />
                </div>

                {/* Selected Dates Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("projects.receivedAt")}
                    </label>
                    <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                      {newProject.received_at || t("projects.notSelected")}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("projects.deliveredAt")}
                    </label>
                    <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                      {newProject.delivered_at || t("projects.notSelected")}
                    </div>
                  </div>
                </div>

                {/* Work Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("projects.workDuration")}
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary transition-colors"
                    value={newProject.work_duration}
                    onChange={handleWorkDurationChange}
                    placeholder="e.g., 2 days"
                  />
                </div>
              </div>
            </div>

            {/* Financial Section */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="text-primary"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {t("projects.financialSection")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Total Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("projects.totalAmount")}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary transition-colors"
                    value={newProject.total_amount}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        total_amount: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Paid Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("projects.paidAmount")}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary transition-colors"
                    value={newProject.paid_amount}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        paid_amount: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 md:col-span-2">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="text-primary"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
                {t("projects.additionalSection")}
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("projects.notes")}
                </label>
                <textarea
                  className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary transition-colors"
                  rows={4}
                  value={newProject.notes}
                  onChange={(e) =>
                    setNewProject({ ...newProject, notes: e.target.value })
                  }
                  placeholder={t("projects.notesPlaceholder")}
                />
              </div>
            </div>

            {/* Project Materials Section */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 md:col-span-2">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="text-primary"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
                {t("projects.materialsSection")}
              </h3>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-2 items-center">
                  <select
                    className="w-full md:w-1/2 rounded-lg border-gray-200 focus:border-primary focus:ring-primary"
                    value={
                      projectMaterials.length > 0
                        ? projectMaterials[projectMaterials.length - 1]
                            .material_id
                        : ""
                    }
                    onChange={(e) => {
                      const material_id = e.target.value;
                      if (
                        !material_id ||
                        projectMaterials.some(
                          (m) => m.material_id === material_id
                        )
                      )
                        return;
                      setProjectMaterials([
                        ...projectMaterials,
                        { material_id, quantity: 1 },
                      ]);
                    }}
                  >
                    <option value="">{t("common.select")}</option>
                    {materials
                      .filter(
                        (m) =>
                          !projectMaterials.some(
                            (pm) => pm.material_id === m.id
                          )
                      )
                      .map((mat) => (
                        <option key={mat.id} value={mat.id}>
                          {mat.material_name}{" "}
                          {mat.partno ? `(${mat.partno})` : ""}
                        </option>
                      ))}
                  </select>
                </div>
                {projectMaterials.length > 0 && (
                  <div className="flex flex-col gap-3 mt-2">
                    {projectMaterials.map((pm, idx) => {
                      const mat = materials.find(
                        (m) => String(m.id) === String(pm.material_id)
                      );
                      return (
                        <div
                          key={pm.material_id}
                          className="flex flex-col md:flex-row items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all"
                        >
                          <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2">
                            <span className="font-semibold text-lg text-gray-900">
                              {mat?.material_name || t("materials.name")}
                            </span>
                            <span className="text-sm text-gray-500 md:ml-3">
                              {mat?.partno
                                ? `${t("materials.partno")}: ${mat.partno}`
                                : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">
                              {t("materials.quantity")}
                            </label>
                            <input
                              type="number"
                              min={1}
                              className="w-20 rounded-lg border-gray-200 text-center focus:border-primary focus:ring-primary"
                              value={pm.quantity}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => {
                                const quantity =
                                  parseInt(e.target.value, 10) || 1;
                                setProjectMaterials(
                                  projectMaterials.map((item, i) =>
                                    i === idx ? { ...item, quantity } : item
                                  )
                                );
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            className="ml-2 px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                            onClick={() =>
                              setProjectMaterials(
                                projectMaterials.filter((_, i) => i !== idx)
                              )
                            }
                            title={t("common.delete")}
                          >
                            <svg
                              width="18"
                              height="18"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {t("common.create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;

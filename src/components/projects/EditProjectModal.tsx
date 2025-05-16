import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface Project {
  id: string;
  quotation_number: string;
  type: string;
  status: string;
  customer: Customer | null;
  customer_id: string;
  total_amount: string;
  paid_amount: string;
  location: string;
  location_link: string;
  received_at: string;
  delivered_at: string;
  work_duration: string;
  notes: string;
}

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: Project) => void;
  project: Project;
  customers: Customer[];
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  project,
  customers,
}) => {
  const { t } = useTranslation();
  const [editedProject, setEditedProject] = useState<Project>(project);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  useEffect(() => {
    setEditedProject(project);
  }, [project]);

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(editedProject);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {t("projects.editProject")}
                  </h3>

                  {/* Status */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("projects.status")}
                    </label>
                    <select
                      value={editedProject.status}
                      onChange={(e) =>
                        setEditedProject((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    >
                      <option value="pending">
                        {t("projects.status.pending")}
                      </option>
                      <option value="in_progress">
                        {t("projects.status.in_progress")}
                      </option>
                      <option value="completed">
                        {t("projects.status.completed")}
                      </option>
                      <option value="under_design">
                        {t("projects.status.under_design")}
                      </option>
                    </select>
                  </div>

                  {/* Basic Information */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      {t("projects.basicInfo")}
                    </h4>

                    {/* Customer Search */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("projects.customer")}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={customerSearch}
                          onChange={(e) => {
                            setCustomerSearch(e.target.value);
                            setShowCustomerDropdown(true);
                          }}
                          onFocus={() => setShowCustomerDropdown(true)}
                          placeholder={t("projects.searchCustomer")}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        />
                        {showCustomerDropdown && customerSearch && (
                          <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
                            {filteredCustomers.map((customer) => (
                              <div
                                key={customer.id}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setEditedProject((prev) => ({
                                    ...prev,
                                    customer,
                                    customer_id: customer.id,
                                  }));
                                  setCustomerSearch(customer.name);
                                  setShowCustomerDropdown(false);
                                }}
                              >
                                <div className="font-medium">
                                  {customer.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {customer.phone}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Project Type */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("projects.type")}
                      </label>
                      <select
                        value={editedProject.type}
                        onChange={(e) =>
                          setEditedProject((prev) => ({
                            ...prev,
                            type: e.target.value,
                          }))
                        }
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      >
                        <option value="interior">
                          {t("projects.types.interior")}
                        </option>
                        <option value="exterior">
                          {t("projects.types.exterior")}
                        </option>
                        <option value="both">{t("projects.types.both")}</option>
                      </select>
                    </div>

                    {/* Quotation Number */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("projects.quotationNumber")}
                      </label>
                      <input
                        type="text"
                        value={editedProject.quotation_number}
                        onChange={(e) =>
                          setEditedProject((prev) => ({
                            ...prev,
                            quotation_number: e.target.value,
                          }))
                        }
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      />
                    </div>

                    {/* Location */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("projects.location")}
                      </label>
                      <input
                        type="text"
                        value={editedProject.location}
                        onChange={(e) =>
                          setEditedProject((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      />
                    </div>

                    {/* Location Link */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("projects.locationLink")}
                      </label>
                      <input
                        type="text"
                        value={editedProject.location_link}
                        onChange={(e) =>
                          setEditedProject((prev) => ({
                            ...prev,
                            location_link: e.target.value,
                          }))
                        }
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      {t("projects.timeline")}
                    </h4>

                    {/* Received Date */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("projects.receivedAt")}
                      </label>
                      <input
                        type="date"
                        value={editedProject.received_at}
                        onChange={(e) =>
                          setEditedProject((prev) => ({
                            ...prev,
                            received_at: e.target.value,
                          }))
                        }
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      />
                    </div>

                    {/* Delivery Date */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("projects.deliveredAt")}
                      </label>
                      <input
                        type="date"
                        value={editedProject.delivered_at}
                        onChange={(e) =>
                          setEditedProject((prev) => ({
                            ...prev,
                            delivered_at: e.target.value,
                          }))
                        }
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      />
                    </div>

                    {/* Work Duration */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("projects.workDuration")}
                      </label>
                      <input
                        type="text"
                        value={editedProject.work_duration}
                        onChange={(e) =>
                          setEditedProject((prev) => ({
                            ...prev,
                            work_duration: e.target.value,
                          }))
                        }
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Financial Details */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      {t("projects.financialInfo")}
                    </h4>

                    {/* Total Amount */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("projects.totalAmount")}
                      </label>
                      <input
                        type="number"
                        value={editedProject.total_amount}
                        onChange={(e) =>
                          setEditedProject((prev) => ({
                            ...prev,
                            total_amount: e.target.value,
                          }))
                        }
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      />
                    </div>

                    {/* Paid Amount */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("projects.paidAmount")}
                      </label>
                      <input
                        type="number"
                        value={editedProject.paid_amount}
                        onChange={(e) =>
                          setEditedProject((prev) => ({
                            ...prev,
                            paid_amount: e.target.value,
                          }))
                        }
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("projects.notes")}
                    </label>
                    <textarea
                      value={editedProject.notes}
                      onChange={(e) =>
                        setEditedProject((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      rows={4}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
              >
                {t("common.save")}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {t("common.cancel")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProjectModal;

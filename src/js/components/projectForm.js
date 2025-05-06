import { projectService } from "../services/supabase.js";
import { toast, loadingIndicator } from "../utils/ui.js";
import { SERVICE_TYPES } from "../config.js";

export class ProjectForm {
  constructor() {
    this.form = document.getElementById("projectForm");
    this.modal = document.getElementById("projectModal");
    this.submitBtn = this.form.querySelector("button[type='submit']");
    this.isMaintenance = false;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // New project button
    document.getElementById("newProjectBtn").addEventListener("click", () => {
      this.isMaintenance = false;
      this.showForm();
    });

    // New maintenance button
    document
      .getElementById("newMaintenanceBtn")
      .addEventListener("click", () => {
        this.isMaintenance = true;
        this.showForm();
      });

    // Form submission
    this.form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await this.handleSubmit();
    });

    // Close modal
    this.modal.querySelector(".close-btn").addEventListener("click", () => {
      this.hideForm();
    });

    // Close on outside click
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.hideForm();
      }
    });

    // Handle file upload
    this.form
      .querySelector("#quotationImage")
      .addEventListener("change", (e) => {
        this.handleFileUpload(e.target.files[0]);
      });
  }

  showForm() {
    // Reset form
    this.form.reset();

    // Update form title and fields based on type
    const title = this.modal.querySelector(".modal-title");
    title.textContent = this.isMaintenance
      ? "إضافة صيانة جديدة"
      : "إضافة مشروع جديد";

    // Show/hide maintenance-specific fields
    const maintenanceFields = this.form.querySelectorAll(".maintenance-field");
    maintenanceFields.forEach((field) => {
      field.style.display = this.isMaintenance ? "block" : "none";
    });

    // Show modal
    this.modal.classList.remove("hidden");
  }

  hideForm() {
    this.modal.classList.add("hidden");
    this.form.reset();
  }

  async handleFileUpload(file) {
    if (!file) return;

    try {
      loadingIndicator.show();
      const { data, error } = await projectService.uploadFile(
        file,
        `quotations/${Date.now()}_${file.name}`
      );

      if (error) throw error;

      // Store the file path for form submission
      this.form.dataset.quotationImagePath = data.path;
      toast.success("تم رفع الصورة بنجاح");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("حدث خطأ أثناء رفع الصورة");
    } finally {
      loadingIndicator.hide();
    }
  }

  validateForm() {
    const formData = new FormData(this.form);
    const requiredFields = [
      "project_name",
      "quotation_number",
      "location",
      "address",
      "receipt_date",
      "delivery_date",
      "installation_team",
      "total_amount",
      "paid_amount",
      "work_time",
      "receiving_employee",
    ];

    // Check required fields
    for (const field of requiredFields) {
      if (!formData.get(field)) {
        toast.error(
          `الرجاء إدخال ${this.form.querySelector(`[name="${field}"]`).dataset.label}`
        );
        return false;
      }
    }

    // Validate amounts
    const totalAmount = parseFloat(formData.get("total_amount"));
    const paidAmount = parseFloat(formData.get("paid_amount"));

    if (isNaN(totalAmount) || isNaN(paidAmount)) {
      toast.error("الرجاء إدخال قيم صحيحة للمبالغ");
      return false;
    }

    if (paidAmount > totalAmount) {
      toast.error("المبلغ المدفوع لا يمكن أن يكون أكبر من المبلغ الإجمالي");
      return false;
    }

    return true;
  }

  async handleSubmit() {
    if (!this.validateForm()) return;

    try {
      loadingIndicator.show();
      this.submitBtn.disabled = true;

      const formData = new FormData(this.form);
      const projectData = {
        project_name: formData.get("project_name"),
        quotation_number: formData.get("quotation_number"),
        location: formData.get("location"),
        address: formData.get("address"),
        receipt_date: formData.get("receipt_date"),
        delivery_date: formData.get("delivery_date"),
        installation_team: formData.get("installation_team"),
        total_amount: parseFloat(formData.get("total_amount")),
        paid_amount: parseFloat(formData.get("paid_amount")),
        remaining_amount:
          parseFloat(formData.get("total_amount")) -
          parseFloat(formData.get("paid_amount")),
        work_time: parseFloat(formData.get("work_time")),
        receiving_employee: formData.get("receiving_employee"),
        notes: formData.get("notes"),
        is_maintenance: this.isMaintenance,
        service_types: Array.from(formData.getAll("service_types")),
        quotation_image_url: this.form.dataset.quotationImagePath,
      };

      const { data, error } = await projectService.createProject(projectData);

      if (error) throw error;

      toast.success("تم إضافة المشروع بنجاح");
      this.hideForm();

      // Dispatch event to refresh project list
      window.dispatchEvent(
        new CustomEvent("projectAdded", { detail: { project: data } })
      );
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("حدث خطأ أثناء إضافة المشروع");
    } finally {
      loadingIndicator.hide();
      this.submitBtn.disabled = false;
    }
  }
}

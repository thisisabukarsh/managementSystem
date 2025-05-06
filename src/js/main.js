import { format } from "date-fns";
import { projectService, storageService } from "./services/supabase.js";
import { loadingIndicator, toast, confirm, modal } from "./utils/ui.js";
import { validateForm, processFormData, resetForm } from "./utils/form.js";
import { generateProjectCard } from "./components/projectCard.js";
import { FilterManager } from "./components/filters.js";
import { PROJECT_FIELDS, SERVICE_TYPES } from "./config.js";
import { ProjectForm } from "./components/projectForm.js";
import { ProjectList } from "./components/projectList.js";

// DOM Elements
const elements = {
  projectForm: document.getElementById("projectForm"),
  projectList: document.getElementById("projectList"),
  filterContainer: document.getElementById("filterContainer"),
  projectTypeToggle: document.getElementById("projectTypeToggle"),
  serviceTypesContainer: document.getElementById("serviceTypesContainer"),
  submitButton: document.getElementById("submitButton"),
};

// Validate required DOM elements
const requiredElements = [
  "projectForm",
  "projectList",
  "filterContainer",
  "projectTypeToggle",
  "serviceTypesContainer",
];
const missingElements = requiredElements.filter((id) => !elements[id]);

if (missingElements.length > 0) {
  console.error("Missing required DOM elements:", missingElements);
  toast.error("بعض العناصر المطلوبة غير موجودة في الصفحة");
  throw new Error(
    "Missing required DOM elements: " + missingElements.join(", ")
  );
}

// Initialize components
let projectList;
let filterManager;
let projectForm;

try {
  projectList = new ProjectList(elements.projectList);
  filterManager = new FilterManager(projectList);
  filterManager.initialize(elements.filterContainer);

  projectForm = new ProjectForm(
    elements.projectForm,
    elements.projectTypeToggle,
    elements.serviceTypesContainer
  );

  // Initialize service types
  initializeServiceTypes();

  // Add event listeners
  elements.projectForm.addEventListener("submit", handleFormSubmit);
  elements.projectTypeToggle.addEventListener(
    "change",
    handleProjectTypeToggle
  );

  window.addEventListener("projectAdded", (e) => {
    projectList.addProject(e.detail.project);
  });

  window.addEventListener("projectDeleted", (e) => {
    projectList.removeProject(e.detail.id);
  });

  window.addEventListener("projectUpdated", (e) => {
    projectList.updateProject(e.detail.project);
  });

  // Initialize project type toggle
  handleProjectTypeToggle();
} catch (error) {
  console.error("Error initializing application:", error);
  toast.error("حدث خطأ أثناء تهيئة التطبيق");
}

// Initialize service types
function initializeServiceTypes() {
  elements.serviceTypesContainer.innerHTML = SERVICE_TYPES.map(
    (type) => `
    <label class="inline-flex items-center mr-4">
      <input type="checkbox" name="service_types" value="${type}" class="form-checkbox h-4 w-4 text-blue-600">
      <span class="mr-2">${type}</span>
    </label>
  `
  ).join("");
}

// Handle form submission
async function handleFormSubmit(e) {
  e.preventDefault();

  const formData = new FormData(elements.projectForm);
  const projectData = Object.fromEntries(formData.entries());

  // Validate form
  const requiredFields = PROJECT_FIELDS.filter((field) => field.required).map(
    (field) => field.name
  );

  if (!validateForm(projectData, requiredFields)) {
    return;
  }

  try {
    loadingIndicator.show();

    // Handle file upload
    if (projectData.quotation_image) {
      const file = projectData.quotation_image;
      const filePath = `quotations/${Date.now()}_${file.name}`;
      await storageService.uploadFile(filePath, file);
      projectData.quotation_image_url =
        await storageService.getPublicUrl(filePath);
    }

    // Process form data
    const processedData = processFormData(projectData);

    // Add project type
    processedData.is_maintenance = elements.projectTypeToggle.checked;

    // Create project
    const { data, error } = await projectService.createProject(processedData);

    if (error) throw error;

    // Add project card to list
    const projectCard = generateProjectCard(data);
    projectList.addProject(data);

    // Reset form
    resetForm(elements.projectForm);
    toast.success("تم إضافة المشروع بنجاح");
  } catch (error) {
    console.error("Error creating project:", error);
    toast.error("حدث خطأ أثناء إضافة المشروع");
  } finally {
    loadingIndicator.hide();
  }
}

// Handle project type toggle
function handleProjectTypeToggle() {
  const isMaintenance = elements.projectTypeToggle.checked;
  elements.serviceTypesContainer.style.display = isMaintenance
    ? "block"
    : "none";

  // Update form fields based on project type
  PROJECT_FIELDS.forEach((field) => {
    const input = elements.projectForm.querySelector(`[name="${field.name}"]`);
    if (input) {
      input.required =
        field.required && (!field.maintenanceOnly || isMaintenance);
      input.parentElement.style.display =
        field.maintenanceOnly && !isMaintenance ? "none" : "block";
    }
  });
}

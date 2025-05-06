import { format } from "date-fns";
import { toast } from "./ui.js";

// Form validation
export const validateForm = (formData, requiredFields) => {
  const errors = [];

  requiredFields.forEach((field) => {
    if (!formData[field]) {
      errors.push(`حقل ${field} مطلوب`);
    }
  });

  if (errors.length > 0) {
    toast.error(errors.join("\n"));
    return false;
  }

  return true;
};

// Form data processing
export const processFormData = (formData) => {
  const processedData = { ...formData };

  // Convert dates to ISO string
  if (processedData.receipt_date) {
    processedData.receipt_date = format(
      new Date(processedData.receipt_date),
      "yyyy-MM-dd"
    );
  }
  if (processedData.delivery_date) {
    processedData.delivery_date = format(
      new Date(processedData.delivery_date),
      "yyyy-MM-dd"
    );
  }

  // Convert numeric fields
  const numericFields = [
    "total_amount",
    "paid_amount",
    "remaining_amount",
    "work_time",
  ];
  numericFields.forEach((field) => {
    if (processedData[field]) {
      processedData[field] = parseFloat(processedData[field]);
    }
  });

  // Handle service types array
  if (processedData.service_types) {
    processedData.service_types = Array.isArray(processedData.service_types)
      ? processedData.service_types
      : [processedData.service_types];
  }

  return processedData;
};

// Form reset
export const resetForm = (form) => {
  form.reset();
  const inputs = form.querySelectorAll("input, select, textarea");
  inputs.forEach((input) => {
    input.classList.remove("border-red-500");
    const errorMessage = input.parentElement.querySelector(".error-message");
    if (errorMessage) {
      errorMessage.remove();
    }
  });
};

// Form field error handling
export const showFieldError = (input, message) => {
  input.classList.add("border-red-500");
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message text-red-500 text-sm mt-1";
  errorDiv.textContent = message;
  input.parentElement.appendChild(errorDiv);
};

export const clearFieldError = (input) => {
  input.classList.remove("border-red-500");
  const errorMessage = input.parentElement.querySelector(".error-message");
  if (errorMessage) {
    errorMessage.remove();
  }
};

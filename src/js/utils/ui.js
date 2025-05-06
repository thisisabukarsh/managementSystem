import Swal from "sweetalert2";

// Loading indicator
export const loadingIndicator = {
  show() {
    const loadingEl = document.createElement("div");
    loadingEl.id = "loading";
    loadingEl.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
    loadingEl.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loadingEl);
  },

  hide() {
    const loadingEl = document.getElementById("loading");
    if (loadingEl) {
      loadingEl.remove();
    }
  },
};

// Toast notifications
export const toast = {
  success(message) {
    Swal.fire({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      icon: "success",
      title: message,
    });
  },

  error(message) {
    Swal.fire({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      icon: "error",
      title: message,
    });
  },

  warning(message) {
    Swal.fire({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      icon: "warning",
      title: message,
    });
  },
};

// Confirmation dialog
export const confirm = {
  async delete(message = "هل أنت متأكد؟") {
    const result = await Swal.fire({
      title: message,
      text: "لا يمكن التراجع عن هذا الإجراء!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
    });

    return result.isConfirmed;
  },
};

// Modal utilities
export const modal = {
  show(element) {
    element.classList.remove("hidden");
    setTimeout(() => element.classList.add("active"), 10);
  },

  hide(element) {
    element.classList.remove("active");
    setTimeout(() => element.classList.add("hidden"), 300);
  },
};

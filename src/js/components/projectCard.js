import { format, parseISO } from "date-fns";
import { toast, confirm } from "../utils/ui.js";
import { projectService } from "../services/supabase.js";

// Helper function to safely format dates
const formatDate = (dateString) => {
  try {
    if (!dateString) return "غير محدد";
    const date =
      typeof dateString === "string" ? parseISO(dateString) : dateString;
    return format(date, "dd/MM/yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "تاريخ غير صالح";
  }
};

export const generateProjectCard = (project) => {
  const card = document.createElement("div");
  card.className =
    "project-card bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg cursor-pointer";
  card.dataset.id = project.id;
  card.dataset.type = project.is_maintenance ? "maintenance" : "project";

  const statusClass =
    project.remaining_amount > 0 ? "text-yellow-600" : "text-green-600";
  const statusText = project.remaining_amount > 0 ? "قيد التنفيذ" : "مكتمل";

  card.innerHTML = `
    <div class="flex justify-between items-start mb-4">
      <h3 class="text-xl font-semibold text-gray-800">${project.project_name}</h3>
      <span class="px-3 py-1 rounded-full text-sm font-medium ${statusClass}">${statusText}</span>
    </div>
    
    <div class="space-y-2 text-gray-600">
      <p><span class="font-medium">رقم العرض:</span> ${project.quotation_number}</p>
      <p><span class="font-medium">الموقع:</span> ${project.location}</p>
      <p><span class="font-medium">العنوان:</span> ${project.address}</p>
      <p><span class="font-medium">تاريخ الاستلام:</span> ${formatDate(project.receipt_date)}</p>
      <p><span class="font-medium">تاريخ التسليم:</span> ${formatDate(project.delivery_date)}</p>
    </div>

    <div class="mt-4 pt-4 border-t border-gray-200">
      <div class="flex justify-between items-center">
        <div>
          <p class="text-sm text-gray-500">المبلغ المتبقي</p>
          <p class="text-lg font-semibold ${statusClass}">${project.remaining_amount} ريال</p>
        </div>
        <div class="flex space-x-2">
          <button class="edit-btn p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
          <button class="delete-btn p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;

  // Add event listeners
  card.addEventListener("click", (e) => {
    if (!e.target.closest(".edit-btn") && !e.target.closest(".delete-btn")) {
      showProjectDetails(project.id);
    }
  });

  card.querySelector(".edit-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    handleEditProject(project.id);
  });

  card.querySelector(".delete-btn").addEventListener("click", async (e) => {
    e.stopPropagation();
    await handleDeleteProject(project.id);
  });

  return card;
};

const showProjectDetails = async (id) => {
  try {
    const { data: project, error } = await projectService.getProject(id);

    if (error) {
      throw error;
    }

    if (!project) {
      toast.error("لم يتم العثور على المشروع");
      return;
    }

    // Create and show modal with project details
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-2xl font-bold text-gray-800">${project.project_name}</h2>
          <button class="close-btn text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <div class="space-y-4">
          <section>
            <h3 class="text-lg font-semibold text-gray-700 mb-2">معلومات المشروع</h3>
            <div class="grid grid-cols-2 gap-4">
              <p><span class="font-medium">رقم العرض:</span> ${project.quotation_number}</p>
              <p><span class="font-medium">الموقع:</span> ${project.location}</p>
              <p><span class="font-medium">العنوان:</span> ${project.address}</p>
              <p><span class="font-medium">فريق التركيب:</span> ${project.installation_team}</p>
            </div>
          </section>

          <section>
            <h3 class="text-lg font-semibold text-gray-700 mb-2">التواريخ</h3>
            <div class="grid grid-cols-2 gap-4">
              <p><span class="font-medium">تاريخ الاستلام:</span> ${formatDate(project.receipt_date)}</p>
              <p><span class="font-medium">تاريخ التسليم:</span> ${formatDate(project.delivery_date)}</p>
            </div>
          </section>

          <section>
            <h3 class="text-lg font-semibold text-gray-700 mb-2">المعلومات المالية</h3>
            <div class="grid grid-cols-2 gap-4">
              <p><span class="font-medium">المبلغ الإجمالي:</span> ${project.total_amount} ريال</p>
              <p><span class="font-medium">المبلغ المدفوع:</span> ${project.paid_amount} ريال</p>
              <p><span class="font-medium">المبلغ المتبقي:</span> ${project.remaining_amount} ريال</p>
              <p><span class="font-medium">وقت العمل:</span> ${project.work_time} ساعة</p>
            </div>
          </section>

          <section>
            <h3 class="text-lg font-semibold text-gray-700 mb-2">معلومات إضافية</h3>
            <div class="grid grid-cols-2 gap-4">
              <p><span class="font-medium">الموظف المستلم:</span> ${project.receiving_employee}</p>
              ${project.service_types ? `<p><span class="font-medium">أنواع الخدمات:</span> ${project.service_types.join(", ")}</p>` : ""}
            </div>
          </section>

          ${
            project.notes
              ? `
            <section>
              <h3 class="text-lg font-semibold text-gray-700 mb-2">الملاحظات</h3>
              <p class="text-gray-600">${project.notes}</p>
            </section>
          `
              : ""
          }

          ${
            project.quotation_image_url
              ? `
            <section>
              <h3 class="text-lg font-semibold text-gray-700 mb-2">صورة العرض</h3>
              <img src="${project.quotation_image_url}" alt="صورة العرض" class="max-w-full h-auto rounded-lg">
            </section>
          `
              : ""
          }
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    modal.querySelector(".close-btn").addEventListener("click", () => {
      modal.remove();
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  } catch (error) {
    console.error("Error loading project details:", error);
    toast.error("حدث خطأ أثناء تحميل تفاصيل المشروع");
  }
};

const handleEditProject = (id) => {
  // Implement edit functionality
  console.log("Edit project:", id);
};

const handleDeleteProject = async (id) => {
  const confirmed = await confirm.delete();
  if (!confirmed) return;

  try {
    await projectService.deleteProject(id);
    toast.success("تم حذف المشروع بنجاح");
    // Refresh project list
    window.dispatchEvent(new CustomEvent("projectDeleted", { detail: { id } }));
  } catch (error) {
    toast.error("حدث خطأ أثناء حذف المشروع");
    console.error("Error deleting project:", error);
  }
};

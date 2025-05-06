import { projectService } from "../services/supabase.js";
import { loadingIndicator, toast } from "../utils/ui.js";
import { generateProjectCard } from "./projectCard.js";

export class ProjectList {
  constructor(container) {
    if (!container) {
      throw new Error("Project list container element is required");
    }
    this.container = container;
    this.currentPage = 1;
    this.pageSize = 10;
    this.totalPages = 0;
    this.initialize();
  }

  initialize() {
    try {
      this.loadProjects();
    } catch (error) {
      console.error("Error initializing project list:", error);
      toast.error("حدث خطأ أثناء تهيئة قائمة المشاريع");
    }
  }

  async loadProjects(page = 1) {
    try {
      loadingIndicator.show();
      this.currentPage = page;

      const {
        data: projects,
        error,
        count,
        totalPages,
      } = await projectService.getAllProjects(page, this.pageSize);

      if (error) {
        throw error;
      }

      this.totalPages = totalPages;
      this.render(projects);
      this.renderPagination();
    } catch (error) {
      console.error("Error loading projects:", error);
      toast.error("حدث خطأ أثناء تحميل المشاريع");
    } finally {
      loadingIndicator.hide();
    }
  }

  render(projects) {
    if (!this.container) {
      console.error("Project list container not found");
      return;
    }

    if (!Array.isArray(projects)) {
      console.error("Invalid projects data:", projects);
      return;
    }

    this.container.innerHTML = "";

    if (projects.length === 0) {
      this.container.innerHTML = `
        <div class="col-span-full text-center py-8">
          <p class="text-gray-500">لا توجد مشاريع حالياً</p>
        </div>
      `;
      return;
    }

    projects.forEach((project) => {
      if (!project || typeof project !== "object") {
        console.error("Invalid project data:", project);
        return;
      }
      const projectCard = generateProjectCard(project);
      this.container.appendChild(projectCard);
    });
  }

  renderPagination() {
    if (this.totalPages <= 1) return;

    const paginationContainer = document.createElement("div");
    paginationContainer.className =
      "col-span-full flex justify-center items-center space-x-2 mt-4";

    // Previous button
    const prevButton = document.createElement("button");
    prevButton.className = `px-3 py-1 rounded ${this.currentPage === 1 ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`;
    prevButton.textContent = "السابق";
    prevButton.disabled = this.currentPage === 1;
    prevButton.addEventListener("click", () => {
      if (this.currentPage > 1) {
        this.loadProjects(this.currentPage - 1);
      }
    });

    // Page numbers
    const pageNumbers = document.createElement("div");
    pageNumbers.className = "flex space-x-2";

    for (let i = 1; i <= this.totalPages; i++) {
      const pageButton = document.createElement("button");
      pageButton.className = `px-3 py-1 rounded ${i === this.currentPage ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`;
      pageButton.textContent = i;
      pageButton.addEventListener("click", () => this.loadProjects(i));
      pageNumbers.appendChild(pageButton);
    }

    // Next button
    const nextButton = document.createElement("button");
    nextButton.className = `px-3 py-1 rounded ${this.currentPage === this.totalPages ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`;
    nextButton.textContent = "التالي";
    nextButton.disabled = this.currentPage === this.totalPages;
    nextButton.addEventListener("click", () => {
      if (this.currentPage < this.totalPages) {
        this.loadProjects(this.currentPage + 1);
      }
    });

    paginationContainer.appendChild(prevButton);
    paginationContainer.appendChild(pageNumbers);
    paginationContainer.appendChild(nextButton);

    this.container.parentElement.appendChild(paginationContainer);
  }

  addProject(project) {
    if (!project || typeof project !== "object") {
      console.error("Invalid project data:", project);
      return;
    }
    const projectCard = generateProjectCard(project);
    this.container.insertBefore(projectCard, this.container.firstChild);
  }

  removeProject(id) {
    const projectCard = this.container.querySelector(`[data-id="${id}"]`);
    if (projectCard) {
      projectCard.remove();
    }
  }

  updateProject(project) {
    if (!project || typeof project !== "object") {
      console.error("Invalid project data:", project);
      return;
    }
    const projectCard = this.container.querySelector(
      `[data-id="${project.id}"]`
    );
    if (projectCard) {
      const newProjectCard = generateProjectCard(project);
      projectCard.replaceWith(newProjectCard);
    }
  }

  filterProjects(filters) {
    const projectCards = this.container.querySelectorAll(".project-card");

    projectCards.forEach((card) => {
      const projectData = {
        id: card.dataset.id,
        type: card.dataset.type,
        name: card.querySelector("h3")?.textContent || "",
        remainingAmount: parseFloat(
          card.querySelector(".text-lg")?.textContent || "0"
        ),
        receiptDate: new Date(
          card.querySelector("p:nth-child(4)")?.textContent.split(": ")[1] || ""
        ),
        deliveryDate: new Date(
          card.querySelector("p:nth-child(5)")?.textContent.split(": ")[1] || ""
        ),
      };

      const matchesSearch =
        !filters.searchTerm ||
        projectData.name.toLowerCase().includes(filters.searchTerm);

      const matchesType =
        filters.projectType === "all" ||
        projectData.type === filters.projectType;

      const matchesDateRange =
        (!filters.dateRange.start ||
          projectData.receiptDate >= new Date(filters.dateRange.start)) &&
        (!filters.dateRange.end ||
          projectData.deliveryDate <= new Date(filters.dateRange.end));

      const matchesAmountRange =
        (!filters.amountRange.min ||
          projectData.remainingAmount >= filters.amountRange.min) &&
        (!filters.amountRange.max ||
          projectData.remainingAmount <= filters.amountRange.max);

      if (
        matchesSearch &&
        matchesType &&
        matchesDateRange &&
        matchesAmountRange
      ) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
  }

  resetFilters() {
    const projectCards = this.container.querySelectorAll(".project-card");
    projectCards.forEach((card) => (card.style.display = ""));
  }
}

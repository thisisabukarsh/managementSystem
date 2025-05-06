import { format } from "date-fns";
import { INITIAL_FILTER_STATE } from "../config.js";

export class FilterManager {
  constructor(projectList) {
    this.filterState = { ...INITIAL_FILTER_STATE };
    this.filterContainer = null;
    this.projectList = projectList;
  }

  initialize(container) {
    this.filterContainer = container;
    this.render();
    this.attachEventListeners();
  }

  render() {
    this.filterContainer.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Search Input -->
          <div class="relative">
            <input
              type="text"
              id="searchInput"
              placeholder="بحث..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
          </div>

          <!-- Project Type Filter -->
          <div>
            <select
              id="projectTypeFilter"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">جميع المشاريع</option>
              <option value="project">مشاريع جديدة</option>
              <option value="maintenance">صيانة</option>
            </select>
          </div>

          <!-- Date Range Filter -->
          <div class="grid grid-cols-2 gap-2">
            <input
              type="date"
              id="startDateFilter"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
            <input
              type="date"
              id="endDateFilter"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
          </div>

          <!-- Amount Range Filter -->
          <div class="grid grid-cols-2 gap-2">
            <input
              type="number"
              id="minAmountFilter"
              placeholder="الحد الأدنى"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
            <input
              type="number"
              id="maxAmountFilter"
              placeholder="الحد الأقصى"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
          </div>
        </div>

        <!-- Reset Button -->
        <div class="mt-4 flex justify-end">
          <button
            id="resetFilters"
            class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <span>إعادة تعيين</span>
          </button>
        </div>
    `;
  }

  attachEventListeners() {
    // Search input
    this.filterContainer
      .querySelector("#searchInput")
      .addEventListener("input", (e) => {
        this.filterState.searchTerm = e.target.value.toLowerCase();
        this.applyFilters();
      });

    // Project type filter
    this.filterContainer
      .querySelector("#projectTypeFilter")
      .addEventListener("change", (e) => {
        this.filterState.projectType = e.target.value;
        this.applyFilters();
      });

    // Date range filters
    this.filterContainer
      .querySelector("#startDateFilter")
      .addEventListener("change", (e) => {
        this.filterState.dateRange.start = e.target.value;
        this.applyFilters();
      });

    this.filterContainer
      .querySelector("#endDateFilter")
      .addEventListener("change", (e) => {
        this.filterState.dateRange.end = e.target.value;
        this.applyFilters();
      });

    // Amount range filters
    this.filterContainer
      .querySelector("#minAmountFilter")
      .addEventListener("input", (e) => {
        this.filterState.amountRange.min = e.target.value
          ? parseFloat(e.target.value)
          : null;
        this.applyFilters();
      });

    this.filterContainer
      .querySelector("#maxAmountFilter")
      .addEventListener("input", (e) => {
        this.filterState.amountRange.max = e.target.value
          ? parseFloat(e.target.value)
          : null;
        this.applyFilters();
      });

    // Reset button
    this.filterContainer
      .querySelector("#resetFilters")
      .addEventListener("click", () => {
        this.resetFilters();
      });
  }

  applyFilters() {
    this.projectList.filterProjects(this.filterState);
  }

  resetFilters() {
    this.filterState = { ...INITIAL_FILTER_STATE };

    // Reset form inputs
    this.filterContainer.querySelector("#searchInput").value = "";
    this.filterContainer.querySelector("#projectTypeFilter").value = "all";
    this.filterContainer.querySelector("#startDateFilter").value = "";
    this.filterContainer.querySelector("#endDateFilter").value = "";
    this.filterContainer.querySelector("#minAmountFilter").value = "";
    this.filterContainer.querySelector("#maxAmountFilter").value = "";

    // Reset project list
    this.projectList.resetFilters();
  }
}

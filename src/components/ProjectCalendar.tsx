import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  addMonths,
  subMonths,
  isWithinInterval,
  parseISO,
  isValid,
} from "date-fns";
import { ar, enUS } from "date-fns/locale";

interface Project {
  id: string;
  received_at: string;
  delivered_at: string;
  quotation_number: string;
  status: string;
}

interface ProjectCalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  projects: Project[];
  minDate?: string;
  maxDate?: string;
  className?: string;
  mode?: "single" | "range";
  onClear?: () => void;
  startDate?: string;
  endDate?: string;
}

const ProjectCalendar: React.FC<ProjectCalendarProps> = ({
  selectedDate,
  onDateSelect,
  projects,
  minDate,
  maxDate,
  className = "",
  mode = "range",
  onClear,
  startDate: controlledStartDate,
  endDate: controlledEndDate,
}) => {
  const { t, i18n } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Use controlled props if provided
  const effectiveStartDate = controlledStartDate
    ? parseISO(controlledStartDate)
    : startDate;
  const effectiveEndDate = controlledEndDate
    ? parseISO(controlledEndDate)
    : endDate;

  // Get locale based on current language
  const locale = i18n.language === "ar" ? ar : enUS;

  // Get all days in current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get all project date ranges
  const projectRanges = projects
    .map((project) => ({
      start: project.received_at ? parseISO(project.received_at) : null,
      end: project.delivered_at ? parseISO(project.delivered_at) : null,
      project,
    }))
    .filter(
      (range) =>
        range.start && range.end && isValid(range.start) && isValid(range.end)
    );

  // Check if a date is within any project range
  const isDateInProjectRange = (date: Date) => {
    return projectRanges.some(
      (range) =>
        range.start &&
        range.end &&
        isWithinInterval(date, { start: range.start, end: range.end })
    );
  };

  // Get project info for a specific date
  const getProjectInfo = (date: Date) => {
    return projectRanges.find(
      (range) =>
        range.start &&
        range.end &&
        isWithinInterval(date, { start: range.start, end: range.end })
    )?.project;
  };

  // Check if a date is selectable (only check min/max dates)
  const isDateSelectable = (date: Date) => {
    if (minDate && date < parseISO(minDate)) return false;
    if (maxDate && date > parseISO(maxDate)) return false;
    return true;
  };

  // Handle date selection
  const handleDateClick = (date: Date, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    if (!isDateSelectable(date)) return;

    if (mode === "range") {
      if (!effectiveStartDate || (effectiveStartDate && effectiveEndDate)) {
        setStartDate(date);
        setEndDate(null);
        onDateSelect(format(date, "yyyy-MM-dd"));
      } else {
        const newEndDate =
          date > effectiveStartDate ? date : effectiveStartDate;
        setEndDate(newEndDate);
        onDateSelect(format(newEndDate, "yyyy-MM-dd"));
      }
    } else {
      onDateSelect(format(date, "yyyy-MM-dd"));
    }
  };

  // Navigation handlers
  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}
    >
      {/* Calendar Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <button
          type="button"
          onClick={previousMonth}
          className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <svg
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="text-gray-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-900">
          {format(currentMonth, "MMMM yyyy", { locale })}
        </h2>
        <button
          type="button"
          onClick={nextMonth}
          className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <svg
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="text-gray-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-px bg-gray-100">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="bg-gray-50 py-2 text-center text-sm font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-100">
        {days.map((day) => {
          const isInProjectRange = isDateInProjectRange(day);
          const project = isInProjectRange ? getProjectInfo(day) : null;
          const isSelected =
            selectedDate && isSameDay(parseISO(selectedDate), day);
          const isInRange =
            effectiveStartDate &&
            effectiveEndDate &&
            isWithinInterval(day, {
              start: effectiveStartDate,
              end: effectiveEndDate,
            });

          return (
            <button
              key={day.toString()}
              type="button"
              onClick={(e) => handleDateClick(day, e)}
              onMouseEnter={() => setHoveredDate(day)}
              onMouseLeave={() => setHoveredDate(null)}
              disabled={!isDateSelectable(day)}
              className={`
                relative aspect-square p-2 text-center transition-colors
                ${isInProjectRange ? "bg-red-50" : "hover:bg-primary/5"}
                ${isSelected ? "bg-primary text-white" : ""}
                ${isInRange ? "bg-primary/20" : ""}
                ${
                  !isSameMonth(day, currentMonth)
                    ? "text-gray-400"
                    : "text-gray-900"
                }
                ${isToday(day) ? "font-bold" : ""}
                ${!isDateSelectable(day) ? "opacity-50" : ""}
              `}
            >
              <span className="text-sm">{format(day, "d")}</span>

              {/* Project Range Indicator */}
              {isInProjectRange && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="w-full h-full bg-red-100/50" />
                </div>
              )}

              {/* Project Tooltip */}
              {isInProjectRange &&
                hoveredDate &&
                isSameDay(hoveredDate, day) && (
                  <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap">
                    {t("projects.dateReserved", {
                      number: project?.quotation_number,
                      status: project?.status,
                    })}
                  </div>
                )}
            </button>
          );
        })}
      </div>

      {/* Clear Button */}
      {onClear && (effectiveStartDate || effectiveEndDate) && (
        <div className="p-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClear}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            {t("common.clear")}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectCalendar;

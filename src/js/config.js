// Supabase Configuration
export const SUPABASE_CONFIG = {
  storage: {
    bucket: "quotations",
  },
};

// Form Fields Configuration
export const PROJECT_FIELDS = [
  { name: "project_name", label: "اسم المشروع", type: "text", required: true },
  {
    name: "quotation_number",
    label: "رقم الكوتيشن",
    type: "text",
    required: true,
  },
  { name: "location", label: "الموقع", type: "text", required: true },
  { name: "address", label: "العنوان", type: "text", required: true },
  {
    name: "receipt_date",
    label: "وقت الاستلام",
    type: "datetime-local",
    required: true,
  },
  {
    name: "delivery_date",
    label: "وقت التسليم",
    type: "datetime-local",
    required: true,
  },
  {
    name: "installation_team",
    label: "فريق التركيب",
    type: "text",
    required: true,
  },
  {
    name: "total_amount",
    label: "المبلغ الكلي",
    type: "number",
    required: true,
  },
  {
    name: "paid_amount",
    label: "المبلغ المدفوع",
    type: "number",
    required: true,
  },
  {
    name: "remaining_amount",
    label: "المبلغ المتبقي",
    type: "number",
    required: true,
  },
  {
    name: "work_time",
    label: "وقت العمل على المشروع",
    type: "text",
    required: true,
  },
  {
    name: "receiving_employee",
    label: "الموظف المستلم",
    type: "text",
    required: true,
  },
  {
    name: "quotation_image",
    label: "صورة الكوتيشن",
    type: "file",
    required: false,
  },
  { name: "notes", label: "ملاحظات", type: "textarea", required: false },
];

// Service Types
export const SERVICE_TYPES = ["كهرباء", "خشب", "زجاج", "جبص", "حديد", "تنجيد"];

// Filter State Initial Configuration
export const INITIAL_FILTER_STATE = {
  searchTerm: "",
  projectType: "all",
  dateRange: {
    start: null,
    end: null,
  },
  amountRange: {
    min: null,
    max: null,
  },
};

export type ComplaintCategory =
  | "Roads & Potholes"
  | "Garbage & Waste"
  | "Water Supply"
  | "Electricity & Streetlights"
  | "Trees & Public Greenery"
  | "Drainage & Sewage"
  | "Public Infrastructure"
  | "Other";

export type ComplaintSeverity = "Low" | "Medium" | "High" | "Critical";

export type ComplaintStatus = "Pending" | "In Progress" | "Resolved";

export type LanguageCode = "en" | "kn" | "hi";

export type AnalysisMode = "LIVE_AI" | "DEMO_MODE";

export type NavPage =
  | "dashboard"
  | "citizen"
  | "all"
  | "pending"
  | "in-progress"
  | "resolved"
  | "analytics"
  | "settings";

export interface Ticket {
  id: string;
  citizenName: string;
  description: string;
  summary: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  category: ComplaintCategory;
  severity: ComplaintSeverity;
  severityReason: string;
  department: string;
  status: ComplaintStatus;
  detectedLanguage: string;
  reportedLanguage: LanguageCode;
  photoDataUrl?: string;
  createdAt: string;
  updatedAt: string;
  analysisMode: AnalysisMode;
  isDemo: boolean;
  city: string;
}

export interface CitySettings {
  city: string;
  language: LanguageCode;
}

export interface ClassificationResult {
  category: ComplaintCategory;
  severity: ComplaintSeverity;
  severityReason: string;
  department: string;
  summary: string;
  detectedLanguage: string;
  analysisMode: AnalysisMode;
  fallbackReason?: string;
}

export interface DuplicateMatch {
  ticket: Ticket;
  score: number;
  reason: string;
}

export const CATEGORIES: ComplaintCategory[] = [
  "Roads & Potholes",
  "Garbage & Waste",
  "Water Supply",
  "Electricity & Streetlights",
  "Trees & Public Greenery",
  "Drainage & Sewage",
  "Public Infrastructure",
  "Other",
];

export const SEVERITIES: ComplaintSeverity[] = [
  "Critical",
  "High",
  "Medium",
  "Low",
];

export const STATUSES: ComplaintStatus[] = [
  "Pending",
  "In Progress",
  "Resolved",
];

export const DEPARTMENT_MAP: Record<ComplaintCategory, string> = {
  "Roads & Potholes": "Road Maintenance Department",
  "Garbage & Waste": "Solid Waste Management Department",
  "Water Supply": "Water Supply Department",
  "Electricity & Streetlights": "Electrical Department",
  "Trees & Public Greenery": "Parks & Horticulture Department",
  "Drainage & Sewage": "Drainage Department",
  "Public Infrastructure": "Municipal Engineering Department",
  Other: "General Municipal Helpdesk",
};

export const DEPARTMENTS: string[] = Array.from(
  new Set(Object.values(DEPARTMENT_MAP))
);

export const SEVERITY_RANK: Record<ComplaintSeverity, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

export const SUPPORTED_CITIES: Array<{ label: string; code: string }> = [
  { label: "Bengaluru, Karnataka, India", code: "BLR" },
  { label: "Mysuru, Karnataka, India", code: "MYS" },
  { label: "Hubballi-Dharwad, Karnataka, India", code: "HDW" },
  { label: "Mumbai, Maharashtra, India", code: "MUM" },
  { label: "Pune, Maharashtra, India", code: "PUN" },
  { label: "New Delhi, Delhi, India", code: "DEL" },
  { label: "Hyderabad, Telangana, India", code: "HYD" },
  { label: "Chennai, Tamil Nadu, India", code: "CHN" },
];

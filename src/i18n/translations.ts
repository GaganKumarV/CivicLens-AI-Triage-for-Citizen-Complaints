import { LanguageCode } from "../types/civic";

export interface UIStrings {
  appName: string;
  appSubtitle: string;
  nav: {
    dashboard: string;
    citizen: string;
    all: string;
    pending: string;
    inProgress: string;
    resolved: string;
    analytics: string;
    settings: string;
  };
  stats: {
    total: string;
    critical: string;
    pending: string;
    inProgress: string;
    resolved: string;
  };
  portal: {
    title: string;
    subtitle: string;
    citizenName: string;
    citizenNamePlaceholder: string;
    description: string;
    descriptionPlaceholder: string;
    location: string;
    locationPlaceholder: string;
    useGps: string;
    capturingGps: string;
    category: string;
    autoDetect: string;
    language: string;
    photo: string;
    uploadPhoto: string;
    removePhoto: string;
    submit: string;
    submitting: string;
    submitAnother: string;
    duplicateTitle: string;
    successTitle: string;
    ticketIdLabel: string;
  };
  actions: {
    markInProgress: string;
    markResolved: string;
    reopen: string;
    delete: string;
    viewDetails: string;
    clearFilters: string;
    searchPlaceholder: string;
  };
  statuses: {
    Pending: string;
    "In Progress": string;
    Resolved: string;
  };
}

export const TRANSLATIONS: Record<LanguageCode, UIStrings> = {
  en: {
    appName: "CivicLens",
    appSubtitle: "Municipal Triage & Citizen Grievance Portal",
    nav: {
      dashboard: "Dashboard",
      citizen: "Citizen Portal",
      all: "All Complaints",
      pending: "Pending",
      inProgress: "In Progress",
      resolved: "Resolved",
      analytics: "Analytics",
      settings: "Settings",
    },
    stats: {
      total: "Total Complaints",
      critical: "Critical Priority",
      pending: "Pending",
      inProgress: "In Progress",
      resolved: "Resolved",
    },
    portal: {
      title: "Report a Civic Issue",
      subtitle:
        "Submit street, sanitation, water, or utility complaints. CivicLens automatically classifies severity and routes your ticket to the responsible municipal department.",
      citizenName: "Citizen Name (Optional)",
      citizenNamePlaceholder: "e.g., Arjun Kumar (leave blank for anonymous)",
      description: "Complaint Description",
      descriptionPlaceholder:
        "Describe the issue in English, ಕನ್ನಡ (Kannada), or हिन्दी (Hindi)...",
      location: "Location / Address",
      locationPlaceholder: "e.g., 100 Feet Road, Indiranagar, Bengaluru",
      useGps: "Use My Current Location",
      capturingGps: "Fetching GPS...",
      category: "Category (Optional — AI Auto-Detects)",
      autoDetect: "Let CivicLens AI Auto-Detect",
      language: "Preferred Language",
      photo: "Evidence Photo (Optional)",
      uploadPhoto: "Upload Photo",
      removePhoto: "Remove Photo",
      submit: "Submit Complaint",
      submitting: "Analyzing & Creating Ticket...",
      submitAnother: "Submit Another Complaint",
      duplicateTitle: "Possible Duplicate Complaint Detected",
      successTitle: "Complaint Registered & Routed",
      ticketIdLabel: "Official Ticket ID",
    },
    actions: {
      markInProgress: "Mark In Progress",
      markResolved: "Mark Resolved",
      reopen: "Reopen",
      delete: "Delete",
      viewDetails: "View Details",
      clearFilters: "Clear Filters",
      searchPlaceholder: "Search ticket ID, locality, summary...",
    },
    statuses: {
      Pending: "Pending",
      "In Progress": "In Progress",
      Resolved: "Resolved",
    },
  },
  kn: {
    appName: "ಸಿವಿಕ್‌ಲೆನ್ಸ್ (CivicLens)",
    appSubtitle: "ನಾಗರಿಕ ದೂರು ನಿರ್ವಹಣೆ ಮತ್ತು ಪುರಸಭೆ ವಿಂಗಡಣೆ ವ್ಯವಸ್ಥೆ",
    nav: {
      dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      citizen: "ನಾಗರಿಕ ಪೋರ್ಟಲ್",
      all: "ಎಲ್ಲಾ ದೂರುಗಳು",
      pending: "ಬಾಕಿ ಇರುವವು",
      inProgress: "ಪ್ರಗತಿಯಲ್ಲಿದೆ",
      resolved: "ಪರಿಹರಿಸಲಾಗಿದೆ",
      analytics: "ವಿಶ್ಲೇಷಣೆ",
      settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    },
    stats: {
      total: "ಒಟ್ಟು ದೂರುಗಳು",
      critical: "ಅತ್ಯಂತ ಗಂಭೀರ",
      pending: "ಬಾಕಿ ಇರುವವು",
      inProgress: "ಪ್ರಗತಿಯಲ್ಲಿದೆ",
      resolved: "ಪರಿಹರಿಸಲಾಗಿದೆ",
    },
    portal: {
      title: "ನಾಗರಿಕ ದೂರು ಸಲ್ಲಿಸಿ",
      subtitle:
        "ರಸ್ತೆ, ಕಸ, ನೀರು ಅಥವಾ ವಿದ್ಯುತ್ ಸಮಸ್ಯೆಗಳನ್ನು ಸಲ್ಲಿಸಿ. CivicLens ತೀವ್ರತೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಿ ಸಂಬಂಧಿತ ಇಲಾಖೆಗೆ ಕಳುಹಿಸುತ್ತದೆ.",
      citizenName: "ನಾಗರಿಕರ ಹೆಸರು (ಐಚ್ಛಿಕ)",
      citizenNamePlaceholder: "ಉದಾ: ಅರ್ಜುನ್ ಕುಮಾರ್",
      description: "ದೂರಿನ ವಿವರ",
      descriptionPlaceholder: "ನಿಮ್ಮ ದೂರನ್ನು ಕನ್ನಡ, English ಅಥವಾ हिन्दी ಯಲ್ಲಿ ಬರೆಯಿರಿ...",
      location: "ಸ್ಥಳ / ವಿಳಾಸ",
      locationPlaceholder: "ಉದಾ: 100 ಅಡಿ ರಸ್ತೆ, ಇಂದಿರಾನಗರ, ಬೆಂಗಳೂರು",
      useGps: "ನನ್ನ ಪ್ರಸ್ತುತ ಸ್ಥಳ ಬಳಸಿ (GPS)",
      capturingGps: "ಸ್ಥಳ ಪಡೆಯಲಾಗುತ್ತಿದೆ...",
      category: "ವಿಭಾಗ (ಐಚ್ಛಿಕ — AI ಸ್ವಯಂ ಗುರುತಿಸುತ್ತದೆ)",
      autoDetect: "AI ಸ್ವಯಂ ಗುರುತಿಸಲು ಬಿಡಿ",
      language: "ಭಾಷೆ",
      photo: "ಫೋಟೋ (ಐಚ್ಛಿಕ)",
      uploadPhoto: "ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
      removePhoto: "ಫೋಟೋ ತೆಗೆದುಹಾಕಿ",
      submit: "ದೂರು ಸಲ್ಲಿಸಿ",
      submitting: "ವಿಶ್ಲೇಷಿಸಿ ಟಿಕೆಟ್ ರಚಿಸಲಾಗುತ್ತಿದೆ...",
      submitAnother: "ಮತ್ತೊಂದು ದೂರು ಸಲ್ಲಿಸಿ",
      duplicateTitle: "ಇದೇ ರೀತಿಯ ದೂರು ಈಗಾಗಲೇ ದಾಖಲಾಗಿದೆ",
      successTitle: "ದೂರು ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ",
      ticketIdLabel: "ಅಧಿಕೃತ ಟಿಕೆಟ್ ಸಂಖ್ಯೆ",
    },
    actions: {
      markInProgress: "ಪ್ರಗತಿಗೆ ಬದಲಾಯಿಸಿ",
      markResolved: "ಪರಿಹರಿಸಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ",
      reopen: "ಮತ್ತೆ ತೆರೆಯಿರಿ",
      delete: "ಅಳಿಸಿ",
      viewDetails: "ವಿವರ ನೋಡಿ",
      clearFilters: "ಫಿಲ್ಟರ್ ತೆರವುಗೊಳಿಸಿ",
      searchPlaceholder: "ಟಿಕೆಟ್ ID, ಪ್ರದೇಶ, ವಿವರ ಹುಡುಕಿ...",
    },
    statuses: {
      Pending: "ಬಾಕಿ ಇದೆ",
      "In Progress": "ಪ್ರಗತಿಯಲ್ಲಿದೆ",
      Resolved: "ಪರಿಹರಿಸಲಾಗಿದೆ",
    },
  },
  hi: {
    appName: "सिविकलेंस (CivicLens)",
    appSubtitle: "नागरिक शिकायत प्रबंधन एवं नगर निगम ट्राइएज प्रणाली",
    nav: {
      dashboard: "डैशबोर्ड",
      citizen: "नागरिक पोर्टल",
      all: "सभी शिकायतें",
      pending: "लंबित",
      inProgress: "प्रगति पर",
      resolved: "समाधान हो गया",
      analytics: "विश्लेषण",
      settings: "सेटिंग्स",
    },
    stats: {
      total: "कुल शिकायतें",
      critical: "अति गंभीर",
      pending: "लंबित",
      inProgress: "प्रगति पर",
      resolved: "समाधान",
    },
    portal: {
      title: "नागरिक शिकायत दर्ज करें",
      subtitle:
        "सड़क, कचरा, पानी या बिजली से जुड़ी समस्या दर्ज करें। CivicLens गंभीरता का आकलन कर संबंधित विभाग को भेजता है।",
      citizenName: "नागरिक का नाम (वैकल्पिक)",
      citizenNamePlaceholder: "जैसे: अर्जुन कुमार",
      description: "शिकायत का विवरण",
      descriptionPlaceholder: "अपनी समस्या हिन्दी, English या ಕನ್ನಡ में लिखें...",
      location: "स्थान / पता",
      locationPlaceholder: "जैसे: 100 फीट रोड, इंदिरानगर, बेंगलुरु",
      useGps: "मेरा वर्तमान स्थान उपयोग करें (GPS)",
      capturingGps: "लोकेशन प्राप्त हो रही है...",
      category: "श्रेणी (वैकल्पिक — AI स्वयं पहचान लेगा)",
      autoDetect: "CivicLens AI द्वारा स्वतः पहचानें",
      language: "भाषा चुनें",
      photo: "फ़ोटो प्रमाण (वैकल्पिक)",
      uploadPhoto: "फ़ोटो अपलोड करें",
      removePhoto: "फ़ोटो हटाएँ",
      submit: "शिकायत दर्ज करें",
      submitting: "विश्लेषण कर टिकट बनाया जा रहा है...",
      submitAnother: "एक और शिकायत दर्ज करें",
      duplicateTitle: "संभावित डुप्लीकेट शिकायत मिली",
      successTitle: "शिकायत सफलतापूर्वक दर्ज हो गई",
      ticketIdLabel: "आधिकारिक टिकट नंबर",
    },
    actions: {
      markInProgress: "प्रगति पर करें",
      markResolved: "समाधान चिह्नित करें",
      reopen: "पुनः खोलें",
      delete: "हटाएँ",
      viewDetails: "विवरण देखें",
      clearFilters: "फ़िल्टर साफ़ करें",
      searchPlaceholder: "टिकट ID, क्षेत्र या सारांश खोजें...",
    },
    statuses: {
      Pending: "लंबित",
      "In Progress": "प्रगति पर",
      Resolved: "समाधान हो गया",
    },
  },
};

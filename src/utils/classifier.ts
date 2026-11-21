import {
  CATEGORIES,
  ClassificationResult,
  ComplaintCategory,
  ComplaintSeverity,
  DEPARTMENT_MAP,
  DuplicateMatch,
  LanguageCode,
  SUPPORTED_CITIES,
  Ticket,
} from "../types/civic";

const KANNADA_REGEX = /[\u0C80-\u0CFF]/;
const DEVANAGARI_REGEX = /[\u0900-\u097F]/;

interface KeywordRule {
  category: ComplaintCategory;
  keywords: string[];
}

const CATEGORY_RULES: KeywordRule[] = [
  {
    category: "Roads & Potholes",
    keywords: [
      "pothole",
      "potholes",
      "road",
      "asphalt",
      "tar",
      "crack",
      "cave-in",
      "speed breaker",
      "hump",
      "highway",
      "flyover",
      "ಗುಂಡಿ",
      "ರಸ್ತೆ",
      "ಡಾಂಬರು",
      "गड्ढा",
      "गड्ढे",
      "सड़क",
      "रस्ता",
      "sadak",
      "gaddha",
      "raste",
      "gundi",
    ],
  },
  {
    category: "Garbage & Waste",
    keywords: [
      "garbage",
      "trash",
      "waste",
      "dump",
      "dustbin",
      "bin",
      "litter",
      "smell",
      "stink",
      "compost",
      "plastic",
      "ಕಸ",
      "ತ್ಯಾಜ್ಯ",
      "ದುರ್ವಾಸನೆ",
      "कचरा",
      "कूड़ा",
      "गंदगी",
      "kachra",
      "kasa",
    ],
  },
  {
    category: "Water Supply",
    keywords: [
      "water",
      "pipe",
      "pipeline",
      "leak",
      "leakage",
      "drinking",
      "tap",
      "bwssb",
      "tanker",
      "supply",
      "contamination",
      "ನೀರು",
      "ನೀರಿನ",
      "ಕುಡಿಯುವ ನೀರಿನ",
      "ಕೊಳವೆ",
      "ಸೋರಿಕೆ",
      "ಹರಿಯುತ್ತಿದೆ",
      "पानी",
      "पाइप",
      "जल",
      "रिसाव",
      "paani",
      "neeru",
    ],
  },
  {
    category: "Electricity & Streetlights",
    keywords: [
      "streetlight",
      "street light",
      "light",
      "lamp",
      "electric",
      "electricity",
      "bescom",
      "wire",
      "transformer",
      "power",
      "dark",
      "pole",
      "shock",
      "spark",
      "ವಿದ್ಯುತ್",
      "ಬೀದಿ ದೀಪ",
      "ದೀಪ",
      "ತಂತಿ",
      "बिजली",
      "स्ट्रीट लाइट",
      "लाइट",
      "तार",
      "अंधेरा",
      "bijli",
      "current",
    ],
  },
  {
    category: "Trees & Public Greenery",
    keywords: [
      "tree",
      "branch",
      "fallen",
      "park",
      "garden",
      "greenery",
      "leaf",
      "pruning",
      "uprooted",
      "ಮರ",
      "ಕೊಂಬೆ",
      "ಉದ್ಯಾನ",
      "पेड़",
      "डाल",
      "पार्क",
      "mara",
      "ped",
    ],
  },
  {
    category: "Drainage & Sewage",
    keywords: [
      "drain",
      "drainage",
      "sewage",
      "sewer",
      "manhole",
      "gutter",
      "flood",
      "flooding",
      "overflow",
      "clogged",
      "blocked",
      "ಮೋರಿ",
      "ಚರಂಡಿ",
      "ಕೊಳಚೆ",
      "नाला",
      "नाली",
      "सीवर",
      "गटर",
      "naala",
      "naali",
      "charandi",
      "mori",
    ],
  },
  {
    category: "Public Infrastructure",
    keywords: [
      "footpath",
      "sidewalk",
      "bus stop",
      "shelter",
      "toilet",
      "signboard",
      "bench",
      "bridge",
      "signal",
      "railing",
      "ಪಾದಚಾರಿ",
      "ಬಸ್ ನಿಲ್ದಾಣ",
      "शौचालय",
      "फुटपाथ",
      "बस स्टॉप",
    ],
  },
];

const CRITICAL_KEYWORDS = [
  "dangerous",
  "accident",
  "injury",
  "live wire",
  "exposed wire",
  "electrocution",
  "sparking",
  "open manhole",
  "cave-in",
  "collapse",
  "flooded",
  "emergency",
  "life threatening",
  "sewage entering",
  "fatal",
  "ಅಪಾಯ",
  "ಜೀವ",
  "खतरनाक",
  "जानलेवा",
  "करंट",
  "खुला मेनहोल",
  "khatarnak",
  "apaya",
];

const HIGH_KEYWORDS = [
  "overflowing",
  "blocked",
  "burst",
  "major",
  "heavy",
  "days",
  "school",
  "hospital",
  "junction",
  "main road",
  "arterial",
  "dark",
  "fallen",
  "stinking",
  "urgent",
  "ಸೋರಿಕೆ",
  "ತುಂಬಿದೆ",
  "मुश्किल",
  "बंद",
  "बड़ा",
];

const LOW_KEYWORDS = [
  "minor",
  "small",
  "faded",
  "paint",
  "bench",
  "trim",
  "prune",
  "cosmetic",
  "request",
  "ಸಣ್ಣ",
  "छोटा",
  "हल्का",
];

export function detectLanguageHeuristic(text: string): string {
  const hasKannada = KANNADA_REGEX.test(text);
  const hasHindi = DEVANAGARI_REGEX.test(text);
  const hasLatin = /[a-zA-Z]/.test(text);

  if (hasKannada && hasLatin) return "Mixed (Kannada/English)";
  if (hasHindi && hasLatin) return "Mixed (Hindi/English)";
  if (hasKannada) return "Kannada";
  if (hasHindi) return "Hindi";

  const lower = text.toLowerCase();
  const kanglishHints = ["neeru", "raste", "gundi", "kasa", "charandi", "mori", "mara"];
  const hinglishHints = ["paani", "sadak", "gaddha", "kachra", "bijli", "naali", "naala"];

  if (kanglishHints.some((w) => lower.includes(w))) return "Mixed (Kannada/English)";
  if (hinglishHints.some((w) => lower.includes(w))) return "Mixed (Hindi/English)";
  return "English";
}

export function classifyComplaintDemo(params: {
  description: string;
  location: string;
  categoryHint?: ComplaintCategory | "";
  language: LanguageCode;
}): ClassificationResult {
  const combined = `${params.description} ${params.location}`.toLowerCase();

  let chosenCategory: ComplaintCategory = "Other";
  if (params.categoryHint && CATEGORIES.includes(params.categoryHint)) {
    chosenCategory = params.categoryHint;
  } else {
    let bestScore = 0;
    for (const rule of CATEGORY_RULES) {
      let score = 0;
      for (const kw of rule.keywords) {
        if (combined.includes(kw)) {
          score += kw.length > 5 ? 2 : 1;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        chosenCategory = rule.category;
      }
    }
  }

  let severity: ComplaintSeverity = "Medium";
  let severityReason =
    "Standard municipal repair or service dispatch is required within the scheduled turnaround window.";

  if (CRITICAL_KEYWORDS.some((kw) => combined.includes(kw))) {
    severity = "Critical";
    severityReason =
      "Immediate public safety or life-hazard risk identified requiring emergency municipal response.";
  } else if (HIGH_KEYWORDS.some((kw) => combined.includes(kw))) {
    severity = "High";
    severityReason =
      "Significant disruption to essential civic services or sanitation affecting commuters and residents.";
  } else if (LOW_KEYWORDS.some((kw) => combined.includes(kw))) {
    severity = "Low";
    severityReason =
      "Localized non-urgent issue suitable for routine ward maintenance scheduling.";
  }

  const cleanDesc = params.description.trim().replace(/\s+/g, " ");
  const shortDesc =
    cleanDesc.length > 72 ? `${cleanDesc.slice(0, 69).trim()}...` : cleanDesc;
  const localityShort = params.location.split(",")[0]?.trim() || "reported area";
  const summary =
    chosenCategory === "Other"
      ? `${shortDesc} (${localityShort})`
      : `${chosenCategory} issue reported near ${localityShort}`;

  const detectedLanguage = detectLanguageHeuristic(params.description);

  return {
    category: chosenCategory,
    severity,
    severityReason,
    department: DEPARTMENT_MAP[chosenCategory],
    summary: summary.slice(0, 115),
    detectedLanguage,
    analysisMode: "DEMO_MODE",
  };
}

export async function classifyComplaint(params: {
  description: string;
  location: string;
  categoryHint?: ComplaintCategory | "";
  language: LanguageCode;
  city: string;
  imageBase64?: string;
  imageMimeType?: string;
}): Promise<ClassificationResult> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch("/api/classify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
      signal: controller.signal,
    });
    window.clearTimeout(timeoutId);

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const demo = classifyComplaintDemo(params);
      return {
        ...demo,
        fallbackReason:
          errData?.error || `Live AI unavailable (HTTP ${response.status}). Using Demo Mode.`,
      };
    }

    const data = await response.json();
    const category: ComplaintCategory = CATEGORIES.includes(data.category)
      ? data.category
      : "Other";
    const severity: ComplaintSeverity = ["Low", "Medium", "High", "Critical"].includes(
      data.severity
    )
      ? data.severity
      : "Medium";

    return {
      category,
      severity,
      severityReason:
        data.severityReason || "Assessed by Gemini AI triage based on civic safety impact.",
      department: DEPARTMENT_MAP[category],
      summary: data.summary || params.description.slice(0, 100),
      detectedLanguage: data.detectedLanguage || "English",
      analysisMode: "LIVE_AI",
    };
  } catch (err: unknown) {
    window.clearTimeout(timeoutId);
    const demo = classifyComplaintDemo(params);
    const isAbort = err instanceof Error && err.name === "AbortError";
    return {
      ...demo,
      fallbackReason: isAbort
        ? "Live AI request timed out. Switched transparently to Demo Mode."
        : err instanceof Error
        ? err.message
        : "Network error contacting AI service. Using Demo Mode.",
    };
  }
}

export function generateTicketId(city: string, existingTickets: Ticket[]): string {
  const cityMatch = SUPPORTED_CITIES.find((c) => c.label === city);
  const prefix = cityMatch ? cityMatch.code : "IND";
  const year = new Date().getFullYear();
  const existingIds = new Set(existingTickets.map((t) => t.id));

  for (let attempt = 0; attempt < 50; attempt++) {
    const num = Math.floor(1000 + Math.random() * 9000);
    const candidate = `${prefix}-${year}-${num}`;
    if (!existingIds.has(candidate)) {
      return candidate;
    }
  }
  return `${prefix}-${year}-${Date.now().toString().slice(-5)}`;
}

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "near",
  "from",
  "with",
  "this",
  "that",
  "have",
  "has",
  "are",
  "was",
  "been",
  "very",
  "road",
  "main",
  "block",
  "cross",
  "bengaluru",
  "bangalore",
  "india",
  "karnataka",
]);

function tokenize(text: string): Set<string> {
  const cleaned = text
    .toLowerCase()
    .replace(/[^a-z0-9\u0C80-\u0CFF\u0900-\u097F\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  return new Set(cleaned);
}

export function findPotentialDuplicates(
  description: string,
  location: string,
  existingTickets: Ticket[]
): DuplicateMatch[] {
  const descTokens = tokenize(description);
  const locTokens = tokenize(location);

  if (descTokens.size < 2 && locTokens.size < 1) {
    return [];
  }

  const matches: DuplicateMatch[] = [];

  for (const ticket of existingTickets) {
    const tDescTokens = tokenize(`${ticket.description} ${ticket.summary}`);
    const tLocTokens = tokenize(ticket.location);

    let descIntersection = 0;
    descTokens.forEach((tok) => {
      if (tDescTokens.has(tok)) descIntersection++;
    });

    let locIntersection = 0;
    locTokens.forEach((tok) => {
      if (tLocTokens.has(tok)) locIntersection++;
    });

    const descUnion = new Set([...descTokens, ...tDescTokens]).size || 1;
    const locUnion = new Set([...locTokens, ...tLocTokens]).size || 1;

    const descJaccard = descIntersection / descUnion;
    const locJaccard = locIntersection / locUnion;

    const combinedScore = descJaccard * 0.55 + locJaccard * 0.45;

    if (
      (locIntersection >= 1 && descIntersection >= 2 && combinedScore >= 0.18) ||
      descJaccard >= 0.35 ||
      (locJaccard >= 0.5 && descIntersection >= 1)
    ) {
      const reasonParts: string[] = [];
      if (locIntersection >= 1) reasonParts.push("matching locality");
      if (descIntersection >= 2) reasonParts.push("similar issue description");
      matches.push({
        ticket,
        score: Math.round(combinedScore * 100),
        reason: reasonParts.join(" & ") || "similar complaint pattern",
      });
    }
  }

  return matches.sort((a, b) => b.score - a.score).slice(0, 3);
}

export async function compressImageFile(file: File): Promise<{
  dataUrl: string;
  mimeType: string;
}> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please upload a valid image file (PNG, JPG, WebP)."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read the selected image."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to decode image preview."));
      img.onload = () => {
        const maxDim = 900;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve({ dataUrl: String(reader.result), mimeType: file.type });
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL("image/jpeg", 0.78);
        resolve({ dataUrl: compressed, mimeType: "image/jpeg" });
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

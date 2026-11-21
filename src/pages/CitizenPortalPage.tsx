import React, { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Crosshair,
  Eye,
  FilePlus2,
  ImagePlus,
  Loader2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { LocationSuggestion } from "../data/bengaluruLocations";
import { UIStrings } from "../i18n/translations";
import {
  AnalysisMode,
  CATEGORIES,
  ComplaintCategory,
  LanguageCode,
  NavPage,
  Ticket,
} from "../types/civic";
import {
  classifyComplaint,
  compressImageFile,
  findPotentialDuplicates,
  generateTicketId,
} from "../utils/classifier";
import { LocationAutocomplete } from "../components/LocationAutocomplete";
import { SeverityIndicator, StatusIndicator } from "../components/TicketBadge";

interface CitizenPortalPageProps {
  existingTickets: Ticket[];
  city: string;
  language: LanguageCode;
  aiMode: AnalysisMode;
  strings: UIStrings;
  onLanguageChange: (lang: LanguageCode) => void;
  onSubmitTicket: (ticket: Ticket) => { ok: boolean; error?: string };
  onViewTicket: (ticket: Ticket) => void;
  onNavigate: (page: NavPage) => void;
  onNotify: (type: "success" | "error" | "info", message: string) => void;
}

const SAMPLE_PROMPTS: Array<{
  label: string;
  lang: LanguageCode;
  description: string;
  location: string;
}> = [
  {
    label: "Live Wire & Pole (EN)",
    lang: "en",
    description:
      "Electric pole sparking with exposed live wire hanging low over the footpath near MG Road Metro gate. Immediate danger to pedestrians.",
    location: "MG Road Metro Station Exit, Bengaluru",
  },
  {
    label: "Kannada Water Leak (ಕನ್ನಡ)",
    lang: "kn",
    description:
      "ನಮ್ಮ ಬಡಾವಣೆಯಲ್ಲಿ ಕುಡಿಯುವ ನೀರಿನ ಕೊಳವೆ ಒಡೆದು ರಸ್ತೆಯ ಮೇಲೆ ನೀರು ತುಂಬಿ ಹರಿಯುತ್ತಿದೆ. ದಯವಿಟ್ಟು ತಕ್ಷಣ ಸರಿಪಡಿಸಿ.",
    location: "4th Main, Malleswaram, Bengaluru",
  },
  {
    label: "Hindi Streetlight (हिन्दी)",
    lang: "hi",
    description:
      "मुख्य सड़क पर पिछले तीन दिनों से स्ट्रीट लाइट बंद है और बहुत अंधेरा रहता है। कृपया बिजली विभाग से ठीक करवाएं।",
    location: "BTM Layout 2nd Stage, Bengaluru",
  },
];

export const CitizenPortalPage: React.FC<CitizenPortalPageProps> = ({
  existingTickets,
  city,
  language,
  aiMode,
  strings,
  onLanguageChange,
  onSubmitTicket,
  onViewTicket,
  onNavigate,
  onNotify,
}) => {
  const [citizenName, setCitizenName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [categoryHint, setCategoryHint] = useState<ComplaintCategory | "">("");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoMimeType, setPhotoMimeType] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatusMsg, setGpsStatusMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<Ticket | null>(null);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);
  const submittingRef = useRef(false);

  const duplicateMatches = useMemo(() => {
    if (description.trim().length < 8 || location.trim().length < 3) {
      return [];
    }
    return findPotentialDuplicates(description, location, existingTickets);
  }, [description, location, existingTickets]);

  const handleUseGps = () => {
    setGpsStatusMsg(null);
    if (!("geolocation" in navigator)) {
      setGpsStatusMsg(
        "Geolocation is not supported in this browser. Please enter your address manually."
      );
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoordinates({ lat, lng });
        if (!location.trim()) {
          setLocation(
            `GPS (${lat.toFixed(4)}, ${lng.toFixed(4)}), ${city.split(",")[0]}`
          );
        }
        setGpsStatusMsg(
          `GPS coordinates attached (${lat.toFixed(4)}, ${lng.toFixed(4)}). You can refine the street address above.`
        );
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        const msg =
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. You can continue typing your address manually."
            : "Could not acquire GPS signal. Please type your address manually.";
        setGpsStatusMsg(msg);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file);
      setPhotoDataUrl(compressed.dataUrl);
      setPhotoMimeType(compressed.mimeType);
      setFormError(null);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Unable to load selected photo.";
      setFormError(msg);
      onNotify("error", msg);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoDataUrl(null);
    setPhotoMimeType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current || isSubmitting) return;

    const cleanDesc = description.trim();
    const cleanLoc = location.trim();

    let firstInvalid: "desc" | "loc" | null = null;
    if (cleanDesc.length < 3) {
      setDescriptionError("Please enter a description of the civic issue (at least 3 characters).");
      firstInvalid = "desc";
    } else {
      setDescriptionError(null);
    }

    if (cleanLoc.length < 2) {
      setLocationError("Please enter or select a locality, road, or landmark address.");
      if (!firstInvalid) firstInvalid = "loc";
    } else {
      setLocationError(null);
    }

    if (firstInvalid) {
      const msg =
        firstInvalid === "desc"
          ? "Please enter a complaint description before submitting."
          : "Please enter or select a location before submitting.";
      setFormError(msg);
      onNotify("error", msg);
      if (firstInvalid === "desc") {
        descriptionRef.current?.focus();
        descriptionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        const locEl = document.getElementById("complaint-location");
        locEl?.focus();
        locEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    submittingRef.current = true;
    setFormError(null);
    setFallbackNotice(null);
    setIsSubmitting(true);

    try {
      const result = await classifyComplaint({
        description: cleanDesc,
        location: cleanLoc,
        categoryHint,
        language,
        city,
        imageBase64: photoDataUrl || undefined,
        imageMimeType: photoMimeType || undefined,
      });

      const now = new Date().toISOString();
      const newTicket: Ticket = {
        id: generateTicketId(city, existingTickets),
        citizenName: citizenName.trim(),
        description: cleanDesc,
        summary: result.summary,
        location: cleanLoc,
        coordinates: coordinates || undefined,
        category: result.category,
        severity: result.severity,
        severityReason: result.severityReason,
        department: result.department,
        status: "Pending",
        detectedLanguage: result.detectedLanguage,
        reportedLanguage: language,
        photoDataUrl: photoDataUrl || undefined,
        createdAt: now,
        updatedAt: now,
        analysisMode: result.analysisMode,
        isDemo: false,
        city,
      };

      const saved = onSubmitTicket(newTicket);
      if (!saved.ok) {
        const saveMsg =
          saved.error ||
          "Failed to persist ticket to browser storage. Please try again without a large attachment.";
        setFormError(saveMsg);
        onNotify("error", saveMsg);
        return;
      }

      if (result.fallbackReason) {
        setFallbackNotice(result.fallbackReason);
      }

      setSubmittedTicket(newTicket);
      onNotify(
        "success",
        `Complaint ${newTicket.id} registered and routed to ${newTicket.department}.`
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Unexpected error while submitting complaint.";
      setFormError(msg);
      onNotify("error", msg);
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const resetFormForAnother = () => {
    setSubmittedTicket(null);
    setCitizenName("");
    setDescription("");
    setLocation("");
    setCoordinates(null);
    setCategoryHint("");
    handleRemovePhoto();
    setGpsStatusMsg(null);
    setFormError(null);
    setDescriptionError(null);
    setLocationError(null);
    setFallbackNotice(null);
  };

  // Success Receipt Screen
  if (submittedTicket) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-[#138808]/8 border-b border-[#138808]/20 px-6 py-5 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#138808] text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#138808]">
                {submittedTicket.analysisMode === "LIVE_AI"
                  ? "Analyzed via Gemini Live AI"
                  : "Analyzed via DEMO MODE Classifier"}
              </p>
              <h1 className="font-display text-xl font-bold text-[#0B2545] mt-0.5">
                {strings.portal.successTitle}
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Your grievance is now visible in the Officer Dashboard and Pending queue.
              </p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {fallbackNotice && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-900">
                <span className="font-semibold">DEMO MODE Active:</span>{" "}
                {fallbackNotice}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg bg-[#FAF9F5] border border-slate-200">
              <div>
                <p className="text-xs text-slate-500">
                  {strings.portal.ticketIdLabel}
                </p>
                <p className="font-mono text-2xl font-bold text-[#0B2545] tabular-nums mt-0.5">
                  {submittedTicket.id}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <SeverityIndicator severity={submittedTicket.severity} />
                <StatusIndicator
                  status={submittedTicket.status}
                  label={strings.statuses[submittedTicket.status]}
                />
              </div>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Category</dt>
                <dd className="font-semibold text-[#0B2545] mt-0.5">
                  {submittedTicket.category}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Assigned Department</dt>
                <dd className="font-semibold text-[#0B2545] mt-0.5">
                  {submittedTicket.department}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Detected Language</dt>
                <dd className="font-medium text-slate-700 mt-0.5">
                  {submittedTicket.detectedLanguage}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Location</dt>
                <dd className="font-medium text-slate-700 mt-0.5">
                  {submittedTicket.location}
                </dd>
              </div>
            </dl>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <p className="text-xs font-semibold text-slate-500">
                Triage Summary & Severity Explanation
              </p>
              <p className="text-sm font-medium text-[#0B2545]">
                {submittedTicket.summary}
              </p>
              <p className="text-sm text-slate-600">
                {submittedTicket.severityReason}
              </p>
            </div>

            {submittedTicket.photoDataUrl && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1.5">
                  Attached Evidence
                </p>
                <img
                  src={submittedTicket.photoDataUrl}
                  alt="Submitted complaint evidence"
                  referrerPolicy="no-referrer"
                  className="h-36 rounded-lg border border-slate-200 object-cover"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={resetFormForAnother}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#0B2545] rounded-lg hover:bg-[#132E5B] transition-colors whitespace-nowrap shrink-0"
              >
                <FilePlus2 className="w-4 h-4" />
                <span>{strings.portal.submitAnother}</span>
              </button>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => onNavigate("pending")}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#9A4E00] bg-[#FF9933]/12 border border-[#FF9933]/40 rounded-lg hover:bg-[#FF9933]/20 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>View Pending Queue</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate("dashboard")}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#0B2545] bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Open Officer Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <RecentComplaintsBox
          tickets={existingTickets}
          strings={strings}
          highlightId={submittedTicket.id}
          onViewTicket={onViewTicket}
          onNavigate={onNavigate}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#9A4E00] mb-1">
            {city} ·{" "}
            {aiMode === "LIVE_AI"
              ? "Live Gemini AI Triage"
              : "DEMO MODE Triage Engine"}
          </p>
          <h1 className="font-display text-2xl font-bold text-[#0B2545]">
            {strings.portal.title}
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            {strings.portal.subtitle}
          </p>
        </div>

        {/* Language Quick Switcher */}
        <div className="shrink-0">
          <label
            htmlFor="portal-language-select"
            className="block text-xs font-medium text-slate-500 mb-1"
          >
            {strings.portal.language}
          </label>
          <select
            id="portal-language-select"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
            className="px-3 py-2 text-sm font-medium bg-white border border-slate-300 rounded-lg text-[#0B2545] focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20"
          >
            <option value="en">English</option>
            <option value="kn">ಕನ್ನಡ (Kannada)</option>
            <option value="hi">हिन्दी (Hindi)</option>
          </select>
        </div>
      </div>

      {/* Quick Test Samples Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FF9933]" />
            Quick Fill Examples (English · ಕನ್ನಡ · हिन्दी)
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PROMPTS.map((sample) => (
            <button
              key={sample.label}
              type="button"
              onClick={() => {
                onLanguageChange(sample.lang);
                setDescription(sample.description);
                setLocation(sample.location);
                setFormError(null);
              }}
              className="px-3 py-1.5 text-xs font-medium text-[#0B2545] bg-[#FAF9F5] border border-slate-200 rounded-lg hover:border-[#0B2545]/40 transition-colors whitespace-nowrap shrink-0"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Submission Form */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-white rounded-xl border border-slate-200 p-6 space-y-5"
      >
        {formError && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-start gap-2.5"
          >
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Duplicate Warning Banner */}
        {duplicateMatches.length > 0 && (
          <div
            role="status"
            className="rounded-lg border border-[#FF9933]/50 bg-[#FF9933]/10 p-4 space-y-2.5"
          >
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-[#9A4E00] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#9A4E00]">
                  {strings.portal.duplicateTitle}
                </p>
                <p className="text-xs text-slate-700 mt-0.5">
                  A similar issue may already be logged. You can still submit your complaint anyway if it is a separate incident.
                </p>
              </div>
            </div>

            <div className="space-y-2 pl-6">
              {duplicateMatches.map((match) => (
                <div
                  key={match.ticket.id}
                  className="flex flex-wrap items-center justify-between gap-2 bg-white rounded-lg border border-slate-200 px-3 py-2 text-xs"
                >
                  <div className="min-w-0">
                    <span className="font-mono font-semibold text-[#0B2545]">
                      {match.ticket.id}
                    </span>
                    <span className="text-slate-400 mx-1.5">·</span>
                    <span className="text-slate-700 font-medium">
                      {match.ticket.summary}
                    </span>
                    <span className="text-slate-400 mx-1.5">·</span>
                    <span className="text-slate-500">
                      {match.ticket.status} ({match.reason})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onViewTicket(match.ticket)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#0B2545] bg-slate-100 rounded hover:bg-slate-200 shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Citizen Name */}
          <div>
            <label
              htmlFor="citizen-name"
              className="block text-sm font-medium text-[#0B2545] mb-1.5"
            >
              {strings.portal.citizenName}
            </label>
            <input
              id="citizen-name"
              type="text"
              value={citizenName}
              onChange={(e) => setCitizenName(e.target.value)}
              placeholder={strings.portal.citizenNamePlaceholder}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-[#0B2545] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 focus:border-[#0B2545]"
            />
          </div>

          {/* Optional Category Override */}
          <div>
            <label
              htmlFor="category-select"
              className="block text-sm font-medium text-[#0B2545] mb-1.5"
            >
              {strings.portal.category}
            </label>
            <select
              id="category-select"
              value={categoryHint}
              onChange={(e) =>
                setCategoryHint(e.target.value as ComplaintCategory | "")
              }
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-[#0B2545] focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 focus:border-[#0B2545]"
            >
              <option value="">{strings.portal.autoDetect}</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Complaint Description */}
        <div>
          <label
            htmlFor="complaint-description"
            className="block text-sm font-medium text-[#0B2545] mb-1.5"
          >
            {strings.portal.description}{" "}
            <span className="text-red-600" aria-hidden="true">
              *
            </span>
          </label>
          <textarea
            ref={descriptionRef}
            id="complaint-description"
            required
            rows={4}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (descriptionError) setDescriptionError(null);
            }}
            placeholder={strings.portal.descriptionPlaceholder}
            className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-[#0B2545] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 ${
              descriptionError
                ? "border-red-400 focus:border-red-500"
                : "border-slate-300 focus:border-[#0B2545]"
            }`}
          />
          {descriptionError ? (
            <p className="mt-1 text-xs font-medium text-red-600">
              {descriptionError}
            </p>
          ) : (
            <p className="mt-1 text-xs text-slate-500">
              Supports English, Kannada (ಕನ್ನಡ), Hindi (हिन्दी), and mixed languages.
            </p>
          )}
        </div>

        {/* Location Autocomplete Input + Optional GPS */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <label
              htmlFor="complaint-location"
              className="block text-sm font-medium text-[#0B2545]"
            >
              {strings.portal.location}{" "}
              <span className="text-red-600" aria-hidden="true">
                *
              </span>
            </label>
            <button
              type="button"
              onClick={handleUseGps}
              disabled={gpsLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#0B2545] bg-[#FAF9F5] border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0"
            >
              {gpsLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Crosshair className="w-3.5 h-3.5 text-[#138808]" />
              )}
              <span>
                {gpsLoading
                  ? strings.portal.capturingGps
                  : strings.portal.useGps}
              </span>
            </button>
          </div>

          <LocationAutocomplete
            id="complaint-location"
            value={location}
            city={city}
            hasError={Boolean(locationError)}
            placeholder={strings.portal.locationPlaceholder}
            onChange={(val) => {
              setLocation(val);
              if (locationError) setLocationError(null);
            }}
            onSelectLocation={(suggestion: LocationSuggestion) => {
              setLocation(suggestion.fullAddress);
              if (
                typeof suggestion.lat === "number" &&
                typeof suggestion.lng === "number"
              ) {
                setCoordinates({ lat: suggestion.lat, lng: suggestion.lng });
              }
              if (locationError) setLocationError(null);
            }}
          />

          {locationError && (
            <p className="mt-1 text-xs font-medium text-red-600">
              {locationError}
            </p>
          )}

          {gpsStatusMsg && (
            <p className="mt-1.5 text-xs text-slate-600">{gpsStatusMsg}</p>
          )}
        </div>

        {/* Photo Upload & Preview */}
        <div>
          <label className="block text-sm font-medium text-[#0B2545] mb-1.5">
            {strings.portal.photo}
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
            id="complaint-photo-input"
          />

          {!photoDataUrl ? (
            <label
              htmlFor="complaint-photo-input"
              className="flex items-center justify-center gap-2.5 px-4 py-6 rounded-lg border border-dashed border-slate-300 bg-[#FAF9F5] hover:bg-slate-100/70 cursor-pointer transition-colors text-sm font-medium text-slate-700"
            >
              <ImagePlus className="w-5 h-5 text-[#0B2545]" />
              <span>{strings.portal.uploadPhoto} (PNG, JPG, WebP)</span>
            </label>
          ) : (
            <div className="rounded-lg border border-slate-200 p-3 bg-[#FAF9F5] flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <img
                src={photoDataUrl}
                alt="Complaint preview"
                referrerPolicy="no-referrer"
                className="w-full sm:w-44 h-32 object-cover rounded-md border border-slate-200 bg-white"
              />
              <div className="flex-1 space-y-2">
                <p className="text-xs font-medium text-[#0B2545]">
                  Photo attached and ready for triage
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 text-xs font-medium text-[#0B2545] bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    Replace Photo
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{strings.portal.removePhoto}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Bar */}
        <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            New complaints start as <span className="font-semibold">Pending</span> and appear in the Officer Dashboard immediately.
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#0B2545] rounded-lg hover:bg-[#132E5B] disabled:opacity-60 transition-colors whitespace-nowrap shrink-0"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{strings.portal.submitting}</span>
              </>
            ) : (
              <>
                <FilePlus2 className="w-4 h-4 text-[#FF9933]" />
                <span>{strings.portal.submit}</span>
              </>
            )}
          </button>
        </div>
      </form>

      <RecentComplaintsBox
        tickets={existingTickets}
        strings={strings}
        onViewTicket={onViewTicket}
        onNavigate={onNavigate}
      />
    </div>
  );
};

interface RecentComplaintsBoxProps {
  tickets: Ticket[];
  strings: UIStrings;
  highlightId?: string;
  onViewTicket: (ticket: Ticket) => void;
  onNavigate: (page: NavPage) => void;
}

const RecentComplaintsBox: React.FC<RecentComplaintsBoxProps> = ({
  tickets,
  strings,
  highlightId,
  onViewTicket,
  onNavigate,
}) => {
  const recentList = useMemo(() => {
    return [...tickets]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 6);
  }, [tickets]);

  return (
    <section
      aria-label="Recent Submitted Complaints"
      className="bg-white rounded-xl border border-slate-200 overflow-hidden mt-6"
    >
      <div className="px-5 py-4 border-b border-slate-200 bg-[#FAF9F5]/80 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-base font-bold text-[#0B2545]">
            Live Complaints Register ({tickets.length})
          </h2>
          <p className="text-xs text-slate-500">
            Updates immediately when new complaints are submitted
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate("all")}
          className="text-xs font-semibold text-[#0B2545] hover:underline whitespace-nowrap"
        >
          View All Complaints →
        </button>
      </div>

      {recentList.length === 0 ? (
        <div className="p-6 text-center text-sm text-slate-500">
          No complaints submitted yet. Your submitted complaints will appear here immediately.
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {recentList.map((t) => {
            const isHighlighted = highlightId === t.id;
            return (
              <li
                key={t.id}
                className={`px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  isHighlighted ? "bg-[#138808]/6" : "hover:bg-[#FAF9F5]"
                }`}
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-semibold text-[#0B2545] tabular-nums">
                      {t.id}
                    </span>
                    <span className="text-slate-300" aria-hidden="true">·</span>
                    <span className="text-slate-600">{t.category}</span>
                    <span className="text-slate-300" aria-hidden="true">·</span>
                    <span className="text-slate-600 truncate max-w-xs">
                      {t.location}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[#0f1e36] truncate">
                    {t.summary}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <SeverityIndicator severity={t.severity} />
                  <StatusIndicator
                    status={t.status}
                    label={strings.statuses[t.status]}
                  />
                  <button
                    type="button"
                    onClick={() => onViewTicket(t)}
                    className="px-2.5 py-1 text-xs font-medium text-[#0B2545] bg-slate-100 rounded hover:bg-slate-200"
                  >
                    View
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const MODEL_NAME = "gemini-4-hydrogen";

const ALLOWED_CATEGORIES = [
  "Roads & Potholes",
  "Garbage & Waste",
  "Water Supply",
  "Electricity & Streetlights",
  "Trees & Public Greenery",
  "Drainage & Sewage",
  "Public Infrastructure",
  "Other",
] as const;

const ALLOWED_SEVERITIES = ["Low", "Medium", "High", "Critical"] as const;

const DEPARTMENT_MAP: Record<string, string> = {
  "Roads & Potholes": "Road Maintenance Department",
  "Garbage & Waste": "Solid Waste Management Department",
  "Water Supply": "Water Supply Department",
  "Electricity & Streetlights": "Electrical Department",
  "Trees & Public Greenery": "Parks & Horticulture Department",
  "Drainage & Sewage": "Drainage Department",
  "Public Infrastructure": "Municipal Engineering Department",
  Other: "General Municipal Helpdesk",
};

function hasValidApiKey(): boolean {
  const key = process.env.GEMINI_API_KEY?.trim();
  return Boolean(key && key !== "MY_GEMINI_API_KEY" && key.length > 10);
}

function getGeminiClient(): GoogleGenAI | null {
  if (!hasValidApiKey()) return null;
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "6mb" }));

  // Health check endpoint to report honest AI availability
  app.get("/api/health", (_req, res) => {
    const aiAvailable = hasValidApiKey();
    res.json({
      status: "ok",
      aiAvailable,
      model: aiAvailable ? MODEL_NAME : null,
      mode: aiAvailable ? "LIVE_AI" : "DEMO_MODE",
    });
  });

  // Location autocomplete proxy using Photon (OpenStreetMap) with Nominatim fallback
  app.get("/api/locations", async (req, res) => {
    const rawQuery = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const rawCity =
      typeof req.query.city === "string" && req.query.city.trim()
        ? req.query.city.trim()
        : "Bengaluru, Karnataka, India";

    if (rawQuery.length < 2) {
      return res.json({ suggestions: [] });
    }

    const cityShort = rawCity.split(",")[0]?.trim() || "Bengaluru";
    const searchQuery = rawQuery.toLowerCase().includes(cityShort.toLowerCase())
      ? rawQuery
      : `${rawQuery}, ${cityShort}, India`;

    const isBengaluru = cityShort.toLowerCase().includes("bengaluru");
    const biasParams = isBengaluru ? "&lat=12.9716&lon=77.5946" : "";

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3200);

    try {
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
        searchQuery
      )}&limit=6${biasParams}`;

      const photonRes = await fetch(photonUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "CivicLens-Municipal-Triage/1.0",
          Accept: "application/json",
        },
      });
      clearTimeout(timer);

      if (photonRes.ok) {
        const data = (await photonRes.json()) as {
          features?: Array<{
            geometry?: { coordinates?: [number, number] };
            properties?: {
              osm_id?: number;
              name?: string;
              street?: string;
              suburb?: string;
              district?: string;
              city?: string;
              state?: string;
              country?: string;
              countrycode?: string;
            };
          }>;
        };

        const seen = new Set<string>();
        const suggestions = (data.features || [])
          .filter((f) => {
            const cc = f.properties?.countrycode?.toUpperCase();
            return !cc || cc === "IN";
          })
          .map((f, idx) => {
            const p = f.properties || {};
            const coords = f.geometry?.coordinates;
            const primary =
              p.name || p.street || p.suburb || p.district || rawQuery;
            const secondaryParts = [
              p.street && p.street !== primary ? p.street : null,
              p.suburb && p.suburb !== primary ? p.suburb : null,
              p.city || p.district || cityShort,
              p.state,
            ].filter(Boolean);

            const subtitle =
              secondaryParts.join(", ") || `${cityShort}, India`;
            const fullAddress =
              primary.toLowerCase().includes(cityShort.toLowerCase())
                ? primary
                : `${primary}, ${p.city || cityShort}`;

            return {
              id: `osm-${p.osm_id || idx}-${primary}`,
              title: primary,
              subtitle,
              fullAddress,
              lng: Array.isArray(coords) ? coords[0] : undefined,
              lat: Array.isArray(coords) ? coords[1] : undefined,
              source: "osm" as const,
            };
          })
          .filter((s) => {
            const key = s.fullAddress.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });

        return res.json({ suggestions });
      }
    } catch {
      clearTimeout(timer);
    }

    // Fallback to OpenStreetMap Nominatim if Photon failed
    const nomController = new AbortController();
    const nomTimer = setTimeout(() => nomController.abort(), 3000);
    try {
      const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=in&limit=5&q=${encodeURIComponent(
        searchQuery
      )}`;
      const nomRes = await fetch(nomUrl, {
        signal: nomController.signal,
        headers: {
          "User-Agent": "CivicLens-Municipal-Triage/1.0",
          Accept: "application/json",
        },
      });
      clearTimeout(nomTimer);

      if (nomRes.ok) {
        const items = (await nomRes.json()) as Array<{
          place_id: number;
          display_name: string;
          lat: string;
          lon: string;
          name?: string;
        }>;
        const suggestions = items.map((item) => {
          const parts = item.display_name.split(",").map((s) => s.trim());
          const title = item.name || parts[0] || rawQuery;
          const subtitle = parts.slice(1, 4).join(", ") || `${cityShort}, India`;
          return {
            id: `nom-${item.place_id}`,
            title,
            subtitle,
            fullAddress: parts.slice(0, 2).join(", "),
            lat: Number(item.lat),
            lng: Number(item.lon),
            source: "osm" as const,
          };
        });
        return res.json({ suggestions });
      }
    } catch {
      clearTimeout(nomTimer);
    }

    return res.json({ suggestions: [] });
  });

  // Server-side Gemini classification endpoint
  app.post("/api/classify", async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: "Gemini API key is not configured on the server.",
        code: "AI_UNAVAILABLE",
      });
    }

    try {
      const {
        description,
        location,
        categoryHint,
        language,
        city,
        imageBase64,
        imageMimeType,
      } = req.body ?? {};

      if (!description || typeof description !== "string" || !description.trim()) {
        return res.status(400).json({
          error: "Complaint description is required.",
          code: "INVALID_INPUT",
        });
      }

      const systemInstruction = `You are CivicLens Municipal Triage AI for Indian urban local bodies (default city: ${city || "Bengaluru, Karnataka, India"}).
Analyze citizen civic complaints written in English, Kannada (ಕನ್ನಡ), Hindi (हिन्दी), or mixed/transliterated languages (Kanglish, Hinglish).

You MUST return valid JSON with:
1. "category": Strictly one of: ${ALLOWED_CATEGORIES.join(", ")}. ${
        categoryHint && ALLOWED_CATEGORIES.includes(categoryHint)
          ? `The citizen suggested "${categoryHint}" — honor this if accurate, or refine if clearly mismatched.`
          : ""
      }
2. "severity": Strictly one of: Low, Medium, High, Critical.
   - Critical: Immediate threat to human life/safety, major road cave-in/deep pothole on arterial road, live exposed electrical wires, severe flooding/open manhole, fallen tree blocking road or hitting power lines.
   - High: Major service disruption or health hazard affecting many residents (burst water main, large overflowing garbage dump, prolonged dark street stretch, overflowing sewage).
   - Medium: Moderate civic disruption needing scheduled repair (minor pothole, partial streetlight outage, irregular waste pickup, damaged footpath).
   - Low: Minor cosmetic or non-urgent civic issue (faded signage, minor park bench repair, routine pruning request).
3. "severityReason": Exactly ONE concise sentence explaining why that severity level was assigned.
4. "summary": A clear, crisp 1-sentence English operational summary suitable for a municipal officer table (max 110 characters, mentioning the issue and locality).
5. "detectedLanguage": One of "English", "Kannada", "Hindi", or "Mixed".`;

      const promptText = `City: ${city || "Bengaluru, Karnataka, India"}
Selected UI Language: ${language || "en"}
Location / Address: ${location || "Not specified"}
Citizen Category Hint: ${categoryHint || "Auto-detect"}
Complaint Description:
"""
${description.trim()}
"""`;

      const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
        { text: promptText },
      ];

      if (
        typeof imageBase64 === "string" &&
        imageBase64.length > 0 &&
        typeof imageMimeType === "string" &&
        imageMimeType.startsWith("image/")
      ) {
        const cleanBase64 = imageBase64.includes(",")
          ? imageBase64.split(",")[1]
          : imageBase64;
        parts.push({
          inlineData: {
            mimeType: imageMimeType,
            data: cleanBase64,
          },
        });
      }

      const callWithTimeout = () =>
        Promise.race([
          ai.models.generateContent({
            model: MODEL_NAME,
            contents: { parts },
            config: {
              systemInstruction,
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  category: {
                    type: Type.STRING,
                    description: "One of the 8 allowed civic complaint categories.",
                  },
                  severity: {
                    type: Type.STRING,
                    description: "One of Low, Medium, High, Critical.",
                  },
                  severityReason: {
                    type: Type.STRING,
                    description: "One concise sentence explaining the assigned severity.",
                  },
                  summary: {
                    type: Type.STRING,
                    description: "Short operational summary for municipal officers.",
                  },
                  detectedLanguage: {
                    type: Type.STRING,
                    description: "Detected language: English, Kannada, Hindi, or Mixed.",
                  },
                },
                required: [
                  "category",
                  "severity",
                  "severityReason",
                  "summary",
                  "detectedLanguage",
                ],
              },
            },
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("AI request timed out.")), 3800)
          ),
        ]);

      let response: Awaited<ReturnType<typeof ai.models.generateContent>> | null =
        null;
      try {
        response = await callWithTimeout();
      } catch (firstErr: unknown) {
        const msg =
          firstErr instanceof Error ? firstErr.message : String(firstErr);
        const fastRetryable =
          !msg.includes("timed out") &&
          (msg.includes("503") || msg.includes("UNAVAILABLE"));
        if (fastRetryable) {
          await new Promise((r) => setTimeout(r, 350));
          response = await callWithTimeout();
        } else {
          throw firstErr;
        }
      }

      const rawText = (response.text ?? "").trim();
      if (!rawText) {
        return res.status(502).json({
          error: "Empty response from Gemini model.",
          code: "AI_EMPTY_RESPONSE",
        });
      }

      const parsed = JSON.parse(rawText);
      const validCategory = ALLOWED_CATEGORIES.includes(parsed.category)
        ? parsed.category
        : "Other";
      const validSeverity = ALLOWED_SEVERITIES.includes(parsed.severity)
        ? parsed.severity
        : "Medium";

      const department =
        DEPARTMENT_MAP[validCategory] || "General Municipal Helpdesk";

      return res.json({
        category: validCategory,
        severity: validSeverity,
        severityReason:
          typeof parsed.severityReason === "string" && parsed.severityReason.trim()
            ? parsed.severityReason.trim()
            : "Assessed based on civic impact and public safety risk.",
        department,
        summary:
          typeof parsed.summary === "string" && parsed.summary.trim()
            ? parsed.summary.trim()
            : description.trim().slice(0, 100),
        detectedLanguage:
          typeof parsed.detectedLanguage === "string" && parsed.detectedLanguage.trim()
            ? parsed.detectedLanguage.trim()
            : "English",
        analysisMode: "LIVE_AI",
        model: MODEL_NAME,
      });
    } catch (err: unknown) {
      const rawMessage =
        err instanceof Error ? err.message : "Failed to classify complaint via Gemini API.";
      let friendlyMessage = rawMessage;
      try {
        const parsedErr = JSON.parse(rawMessage);
        if (parsedErr?.error?.message) {
          friendlyMessage = parsedErr.error.message;
        }
      } catch {
        // keep rawMessage
      }
      console.error("[CivicLens /api/classify error]:", friendlyMessage);
      return res.status(502).json({
        error: friendlyMessage,
        code: "AI_REQUEST_FAILED",
      });
    }
  });

  // Vite middleware in development, static serving in production
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CivicLens server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start CivicLens server:", err);
  process.exit(1);
});

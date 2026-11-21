import React, { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, X } from "lucide-react";
import {
  LocationSuggestion,
  searchLocalIndianLocations,
} from "../data/bengaluruLocations";

interface LocationAutocompleteProps {
  id: string;
  value: string;
  city: string;
  placeholder?: string;
  hasError?: boolean;
  onChange: (value: string) => void;
  onSelectLocation: (suggestion: LocationSuggestion) => void;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  id,
  value,
  city,
  placeholder,
  hasError = false,
  onChange,
  onSelectLocation,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [shouldQuery, setShouldQuery] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
        setShouldQuery(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced live + local suggestions
  useEffect(() => {
    const q = value.trim();
    if (!shouldQuery) {
      return;
    }

    if (q.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setLoading(false);
      setHighlightedIndex(-1);
      return;
    }

    // Immediate Bengaluru / Indian local suggestions
    const localMatches = searchLocalIndianLocations(q, city);
    if (localMatches.length > 0) {
      setSuggestions(localMatches);
      setIsOpen(true);
      setHighlightedIndex(0);
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const url = `/api/locations?q=${encodeURIComponent(
          q
        )}&city=${encodeURIComponent(city)}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
          throw new Error("Location lookup unavailable");
        }
        const data = (await res.json()) as {
          suggestions?: LocationSuggestion[];
        };
        const osmResults = Array.isArray(data.suggestions)
          ? data.suggestions
          : [];

        // Merge local curated matches first (high Indian precision), then live OSM results
        const merged: LocationSuggestion[] = [];
        const seen = new Set<string>();

        for (const item of [...localMatches, ...osmResults]) {
          const key = item.fullAddress.toLowerCase();
          if (seen.has(key)) continue;
          seen.add(key);
          merged.push(item);
        }

        const finalItems = merged.slice(0, 7);
        setSuggestions(finalItems);
        setIsOpen(finalItems.length > 0);
        setHighlightedIndex(finalItems.length > 0 ? 0 : -1);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        // Fall back gracefully to local matches
        setSuggestions(localMatches);
        setIsOpen(localMatches.length > 0);
        setHighlightedIndex(localMatches.length > 0 ? 0 : -1);
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [value, city, shouldQuery]);

  // Keep active keyboard selection scrolled into view
  useEffect(() => {
    if (!isOpen || highlightedIndex < 0 || !listRef.current) return;
    const activeEl = listRef.current.children[highlightedIndex] as
      | HTMLElement
      | undefined;
    activeEl?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex, isOpen]);

  const handleSelect = (item: LocationSuggestion) => {
    setShouldQuery(false);
    onChange(item.fullAddress);
    onSelectLocation(item);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShouldQuery(true);
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "ArrowDown" && value.trim().length >= 2) {
        e.preventDefault();
        setShouldQuery(true);
        const local = searchLocalIndianLocations(value, city);
        if (local.length > 0) {
          setSuggestions(local);
          setIsOpen(true);
          setHighlightedIndex(0);
        }
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        e.preventDefault();
        e.stopPropagation();
        handleSelect(suggestions[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />

      <input
        id={id}
        type="text"
        required
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={`${id}-listbox`}
        aria-activedescendant={
          isOpen && highlightedIndex >= 0
            ? `${id}-option-${highlightedIndex}`
            : undefined
        }
        value={value}
        onChange={handleInputChange}
        onFocus={() => {
          if (shouldQuery && value.trim().length >= 2 && suggestions.length > 0) {
            setIsOpen(true);
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full pl-10 pr-16 py-2.5 text-sm bg-white border rounded-lg text-[#0B2545] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 ${
          hasError
            ? "border-red-400 focus:border-red-500"
            : "border-slate-300 focus:border-[#0B2545]"
        }`}
      />

      {/* Right-side status: loading or clear */}
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {loading && (
          <Loader2
            className="w-4 h-4 text-[#0B2545] animate-spin"
            aria-label="Searching locations"
          />
        )}
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setShouldQuery(false);
              onChange("");
              setSuggestions([]);
              setIsOpen(false);
            }}
            aria-label="Clear location"
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <ul
          ref={listRef}
          id={`${id}-listbox`}
          role="listbox"
          aria-label="Location suggestions"
          className="absolute left-0 right-0 top-full mt-1.5 z-40 max-h-64 overflow-y-auto rounded-xl bg-white border border-slate-200 shadow-xl divide-y divide-slate-100"
        >
          {suggestions.map((item, idx) => {
            const active = idx === highlightedIndex;
            return (
              <li
                key={item.id}
                id={`${id}-option-${idx}`}
                role="option"
                aria-selected={active}
              >
                <button
                  type="button"
                  onMouseDown={(e) => {
                    // Prevent input blur before click registers
                    e.preventDefault();
                  }}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`w-full text-left px-3.5 py-2.5 flex items-start gap-2.5 transition-colors ${
                    active ? "bg-[#FAF9F5]" : "bg-white hover:bg-slate-50"
                  }`}
                >
                  <MapPin
                    className={`w-4 h-4 mt-0.5 shrink-0 ${
                      active ? "text-[#FF9933]" : "text-[#0B2545]"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#0B2545] truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {item.subtitle}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

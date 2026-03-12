"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { MapPin, LocateFixed, X, Loader, ChevronDown } from "lucide-react";
import {
  getUserLocation,
  setUserLocation,
  clearUserLocation,
  type UserLocation,
} from "@/utils/location-storage";
import { lookupZipCode } from "@/utils/geo";

export default function LocationPill() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [error, setError] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const lat = searchParams.get("lat");

  useEffect(() => {
    setLocation(getUserLocation());
  }, [lat]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const syncToUrl = (loc: UserLocation | null) => {
    const params = new URLSearchParams(searchParams);
    if (loc) {
      params.set("lat", String(loc.lat));
      params.set("lng", String(loc.lng));
      if (!params.get("radius")) params.set("radius", "10");
    } else {
      params.delete("lat");
      params.delete("lng");
      params.delete("radius");
    }
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const commit = (loc: UserLocation) => {
    setUserLocation(loc);
    setLocation(loc);
    syncToUrl(loc);
    setIsOpen(false);
    setZip("");
    setError("");
  };

  const handleZip = async () => {
    const trimmed = zip.trim();
    if (!/^\d{5}$/.test(trimmed)) {
      setError("Valid 5-digit ZIP required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const loc = await lookupZipCode(trimmed);
      commit(loc);
    } catch {
      setError("ZIP not found.");
    } finally {
      setLoading(false);
    }
  };

  const handleGeo = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported.");
      return;
    }
    setGeoLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        commit({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: "Current location",
        });
        setGeoLoading(false);
      },
      () => {
        setError("Location access denied.");
        setGeoLoading(false);
      },
    );
  };

  const handleClear = () => {
    clearUserLocation();
    setLocation(null);
    syncToUrl(null);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="flex items-center gap-2 border-2 border-zinc-900 px-3 py-1.5 bg-white hover:bg-zinc-50 transition-colors cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
      >
        <MapPin
          size={12}
          className={location ? "text-emerald-700" : "text-zinc-400"}
        />
        <span className="text-label font-bold uppercase tracking-wide text-zinc-900 max-w-28 truncate">
          {location ? location.label : "Set location"}
        </span>
        <ChevronDown size={10} className="text-zinc-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border-2 border-zinc-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] z-50">
          {/* Current location display */}
          {location && (
            <div className="border-b-2 border-zinc-100 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={12} className="text-emerald-700 shrink-0" />
                <span className="text-label font-bold text-zinc-900 uppercase tracking-wide">
                  {location.label}
                </span>
              </div>
              <button
                onClick={handleClear}
                className="text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
                aria-label="Clear location"
              >
                <X size={12} />
              </button>
            </div>
          )}

          <div className="px-4 py-4 space-y-3">
            <span className="text-label font-black uppercase tracking-[0.2em] text-zinc-400 block">
              {location ? "Change location" : "Set location"}
            </span>

            {/* ZIP input */}
            <div className="flex border-2 border-zinc-900">
              <input
                type="text"
                value={zip}
                onChange={(e) => { setZip(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleZip()}
                placeholder="ZIP code"
                maxLength={5}
                className="flex-1 px-3 py-2 text-label font-bold uppercase tracking-wide text-zinc-900 placeholder:text-zinc-300 outline-none"
              />
              <button
                onClick={handleZip}
                disabled={loading}
                className="px-3 py-2 bg-zinc-900 text-white text-label font-black uppercase hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-50 border-l-2 border-zinc-900"
              >
                {loading ? <Loader size={10} className="animate-spin" /> : "Set"}
              </button>
            </div>

            {/* Geolocation */}
            <button
              onClick={handleGeo}
              disabled={geoLoading}
              className="w-full flex items-center justify-center gap-2 border-2 border-zinc-900 px-3 py-2 text-label font-black uppercase tracking-widest bg-white hover:bg-zinc-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              {geoLoading
                ? <Loader size={11} className="animate-spin" />
                : <LocateFixed size={11} />
              }
              Locate me
            </button>

            {error && (
              <p className="text-label font-bold uppercase text-red-600 tracking-wide">
                {error}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { MapPin, LocateFixed, X, Loader } from "lucide-react";
import {
  getUserLocation,
  setUserLocation,
  clearUserLocation,
  type UserLocation,
} from "@/utils/location-storage";

import { DEFAULT_RADIUS_MILES_MILES } from "@/lib/constants";

const RADIUS_OPTIONS = [5, 10, 25, 50, 100];

async function lookupZip(zip: string): Promise<UserLocation> {
  const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
  if (!res.ok) throw new Error("ZIP not found");
  const data = await res.json();
  const place = data.places[0];
  return {
    lat: parseFloat(place.latitude),
    lng: parseFloat(place.longitude),
    label: `${place["place name"]}, ${place["state abbreviation"]} ${zip}`,
  };
}

export default function LocationBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [location, setLocation] = useState<UserLocation | null>(null);
  const [zip, setZip] = useState("");
  const [radius, setRadius] = useState(DEFAULT_RADIUS_MILES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // On mount: restore saved location + radius from localStorage / URL
  useEffect(() => {
    const saved = getUserLocation();
    if (saved) setLocation(saved);

    const urlRadius = searchParams.get("radius");
    if (urlRadius) setRadius(Number(urlRadius));
  }, []);

  // Sync location + radius to URL params whenever they change
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (location) {
      params.set("lat", String(location.lat));
      params.set("lng", String(location.lng));
      params.set("radius", String(radius));
    } else {
      params.delete("lat");
      params.delete("lng");
      params.delete("radius");
    }
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  }, [location, radius]);

  const applyZip = async () => {
    const trimmed = zip.trim();
    if (!/^\d{5}$/.test(trimmed)) {
      setError("Enter a valid 5-digit ZIP.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const loc = await lookupZip(trimmed);
      setUserLocation(loc);
      setLocation(loc);
      setZip("");
    } catch {
      setError("ZIP not found. Try another.");
    } finally {
      setLoading(false);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser.");
      return;
    }
    setLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: UserLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: "Current location",
        };
        setUserLocation(loc);
        setLocation(loc);
        setLoading(false);
      },
      () => {
        setError("Location access denied.");
        setLoading(false);
      },
    );
  };

  const handleClear = () => {
    clearUserLocation();
    setLocation(null);
    setError("");
    setRadius(DEFAULT_RADIUS_MILES);
  };

  const handleRadiusChange = (r: number) => {
    setRadius(r);
  };

  return (
    <div className="border-t border-zinc-200 pt-2 pb-1">
      <div className="flex flex-wrap items-center gap-4">

        {/* Location input or active location display */}
        {location ? (
          <div className="flex items-center gap-3 border-2 border-zinc-900 bg-white px-4 py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <MapPin size={14} className="text-emerald-700 shrink-0" />
            <span className="text-label font-bold text-zinc-900 uppercase tracking-wide">
              {location.label}
            </span>
            <button
              onClick={handleClear}
              className="text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer ml-1"
              aria-label="Clear location"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center border-2 border-zinc-900 bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <input
              ref={inputRef}
              type="text"
              value={zip}
              onChange={(e) => { setZip(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && applyZip()}
              placeholder="Enter ZIP code"
              maxLength={5}
              className="px-4 py-2 text-label font-bold uppercase tracking-wide text-zinc-900 placeholder:text-zinc-400 outline-none w-36 bg-transparent"
            />
            <button
              onClick={applyZip}
              disabled={loading}
              className="px-4 py-2 bg-zinc-900 text-white text-label font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-50 border-l-2 border-zinc-900"
            >
              {loading ? <Loader size={12} className="animate-spin" /> : "Set"}
            </button>
          </div>
        )}

        {/* Use my location button */}
        {!location && (
          <button
            onClick={useMyLocation}
            disabled={loading}
            className="flex items-center gap-2 border-2 border-zinc-900 px-4 py-2 text-label font-black uppercase tracking-widest bg-white hover:bg-zinc-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            <LocateFixed size={13} />
            Locate me
          </button>
        )}

        {/* Radius selector — only shown when location is active */}
        {location && (
          <div className="flex items-center gap-2">
            <span className="text-label font-black uppercase tracking-widest text-zinc-500">
              Radius:
            </span>
            <div className="flex gap-1">
              {RADIUS_OPTIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => handleRadiusChange(r)}
                  className={`text-label font-black uppercase tracking-wider px-3 py-2 border-2 transition-all cursor-pointer
                    ${radius === r
                      ? "bg-zinc-900 text-white border-zinc-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      : "bg-white text-zinc-900 border-zinc-900 hover:bg-zinc-100"
                    }`}
                >
                  {r}mi
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Inline error */}
        {error && (
          <span className="text-label font-bold text-red-600 uppercase tracking-wide">
            {error}
          </span>
        )}

      </div>
    </div>
  );
}

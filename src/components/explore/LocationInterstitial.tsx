"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { LocateFixed, Loader } from "lucide-react";
import {
  getUserLocation,
  setUserLocation,
  type UserLocation,
} from "@/utils/location-storage";
import { lookupZipCode } from "@/utils/geo";
import { DEFAULT_RADIUS_MILES } from "@/lib/constants";

const DISMISSED_KEY = "location_interstitial_dismissed";

export default function LocationInterstitial() {
  const [visible, setVisible] = useState(false);
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const syncToUrl = (loc: UserLocation) => {
    const params = new URLSearchParams(searchParams);
    params.set("lat", String(loc.lat));
    params.set("lng", String(loc.lng));
    if (!params.get("radius")) params.set("radius", String(DEFAULT_RADIUS_MILES));
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const existing = getUserLocation();
    if (existing) {
      syncToUrl(existing);
      return;
    }
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (!dismissed) setVisible(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commit = (loc: UserLocation) => {
    setUserLocation(loc);
    syncToUrl(loc);
    setVisible(false);
  };

  const handleZip = async () => {
    const trimmed = zip.trim();
    if (!/^\d{5}$/.test(trimmed)) {
      setError("Enter a valid 5-digit ZIP.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const loc = await lookupZipCode(trimmed);
      commit(loc);
    } catch {
      setError("ZIP not found. Try another.");
    } finally {
      setLoading(false);
    }
  };

  const handleGeo = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser.");
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

  const handleSkip = () => {
    localStorage.setItem(DISMISSED_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-100 bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center px-6">
      <div className="bg-[#F9F8F6] border-4 border-zinc-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full max-w-md">

        {/* Header */}
        <div className="border-b-4 border-zinc-900 px-8 py-6">
          <span className="text-label font-black uppercase tracking-[0.3em] text-zinc-500 block mb-2">
            Local Exchange
          </span>
          <h2 className="text-header font-black uppercase italic text-zinc-900 leading-tight">
            Where are you operating from?
          </h2>
          <p className="text-detail text-zinc-500 mt-3 leading-relaxed">
            SwapStandard is a local exchange. Distance is the enemy of a good
            swap. Set your location to see what&apos;s nearby.
          </p>
        </div>

        {/* Inputs */}
        <div className="px-8 py-8 space-y-4">
          {/* ZIP entry */}
          <div className="flex border-2 border-zinc-900 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <input
              type="text"
              value={zip}
              onChange={(e) => { setZip(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleZip()}
              placeholder="Enter ZIP code"
              maxLength={5}
              className="flex-1 px-5 py-4 text-body font-bold uppercase tracking-wide text-zinc-900 placeholder:text-zinc-400 outline-none bg-transparent"
            />
            <button
              onClick={handleZip}
              disabled={loading}
              className="px-6 py-4 bg-zinc-900 text-white text-label font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-50 border-l-2 border-zinc-900"
            >
              {loading ? <Loader size={14} className="animate-spin" /> : "Set"}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 border-t border-zinc-300" />
            <span className="text-label font-black uppercase tracking-widest text-zinc-500">or</span>
            <div className="flex-1 border-t border-zinc-300" />
          </div>

          {/* Geolocation */}
          <button
            onClick={handleGeo}
            disabled={geoLoading}
            className="text-zinc-600 w-full flex items-center justify-center gap-3 border-2 border-zinc-900 px-6 py-4 text-label font-black uppercase tracking-widest bg-white hover:bg-zinc-100 transition-colors cursor-pointer disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            {geoLoading
              ? <Loader size={14} className="animate-spin" />
              : <LocateFixed size={14} />
            }
            Use my current location
          </button>

          {error && (
            <p className="text-label font-bold uppercase text-red-600 tracking-wide">
              {error}
            </p>
          )}
        </div>

        {/* Skip */}
        <div className="border-t border-zinc-200 px-8 py-4 flex justify-center">
          <button
            onClick={handleSkip}
            className="text-label text-zinc-500 hover:text-zinc-600 uppercase tracking-widest cursor-pointer transition-colors"
          >
            Skip — browse all listings
          </button>
        </div>
      </div>
    </div>
  );
}

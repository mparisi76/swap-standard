"use client";

import { useState, useEffect } from "react";
import { MapPin, X } from "lucide-react";
import { getUserLocation } from "@/utils/location-storage";

export default function LocationPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const alreadyDismissed = localStorage.getItem("location_prompt_dismissed");
    const hasLocation = !!getUserLocation();
    if (!alreadyDismissed && !hasLocation) setVisible(true);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem("location_prompt_dismissed", "1");
    setVisible(false);
  };

  return (
    <div className="border-b-2 border-zinc-300 bg-white px-6 py-3 flex items-center gap-3">
      <MapPin size={15} className="text-zinc-500 shrink-0" />
      <p className="text-detail text-zinc-600 flex-1">
        <span className="font-black uppercase text-zinc-900">Set your location</span>
        {" "}to see listings near you first.
        {" "}Click the location pill in the header to get started.
      </p>
      <button onClick={dismiss} className="text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}

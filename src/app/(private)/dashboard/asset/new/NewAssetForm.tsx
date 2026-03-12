"use client";

import { useActionState, useState } from "react";
import { createAssetAction, type AssetFormState } from "@/app/actions/assets/create";
import { lookupZipCode } from "@/utils/geo";
import HoneypotField from "@/components/shared/HoneypotField";
import { Loader, MapPin, CheckCircle } from "lucide-react";
import PhotoUploader from "@/components/assets/PhotoUploader";

const ASSET_TYPES = ["goods", "skills", "services"] as const;

export default function NewAssetForm() {
  const [state, action, pending] = useActionState<AssetFormState, FormData>(
    createAssetAction,
    null,
  );

  const [assetType, setAssetType] = useState<string>("goods");
  const [title, setTitle] = useState("");
  const [offering, setOffering] = useState("");
  const [seeking, setSeeking] = useState("");
  const [zip, setZip] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [zipLoading, setZipLoading] = useState(false);
  const [zipError, setZipError] = useState("");

  const handleVerifyZip = async () => {
    const trimmed = zip.trim();
    if (!/^\d{5}$/.test(trimmed)) {
      setZipError("Enter a valid 5-digit ZIP.");
      setLocationLabel("");
      return;
    }
    setZipLoading(true);
    setZipError("");
    setLocationLabel("");
    try {
      const loc = await lookupZipCode(trimmed);
      setLocationLabel(loc.label);
    } catch {
      setZipError("ZIP not found. Try another.");
    } finally {
      setZipLoading(false);
    }
  };

  const fieldError = (field: string) => state?.fieldErrors?.[field];
  const isValid = title.trim().length > 0 && offering.trim().length > 0 && seeking.trim().length > 0;

  return (
    <form action={action} className="space-y-10">
      <HoneypotField />

      {/* Global error */}
      {state?.error && (
        <div className="border-2 border-red-600 bg-red-50 px-6 py-4">
          <p className="text-label font-black uppercase text-red-600 tracking-wide">
            {state.error}
          </p>
        </div>
      )}

      {/* Type selector */}
      <div className="space-y-3">
        <label className="text-label font-black uppercase tracking-widest text-zinc-400 block">
          Type
        </label>
        <div className="flex gap-2">
          {ASSET_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setAssetType(t)}
              className={`text-label font-black uppercase tracking-widest px-6 py-3 border-2 transition-all cursor-pointer
                ${assetType === t
                  ? "bg-zinc-900 text-white border-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  : "bg-white text-zinc-900 border-zinc-900 hover:bg-zinc-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                }`}
            >
              {t}
            </button>
          ))}
        </div>
        {/* Hidden input carries the selected type */}
        <input type="hidden" name="type" value={assetType} />
        {fieldError("type") && (
          <p className="text-label font-bold text-red-600 uppercase">{fieldError("type")}</p>
        )}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <label
          htmlFor="title"
          className="text-label font-black uppercase tracking-widest text-zinc-400 block"
        >
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Cordless drill, Vegetable garden surplus, Tax prep help"
          className="w-full border-2 border-zinc-900 px-5 py-4 text-body font-bold text-zinc-900 placeholder:text-zinc-300 outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow bg-white"
        />
        {fieldError("title") && (
          <p className="text-label font-bold text-red-600 uppercase">{fieldError("title")}</p>
        )}
      </div>

      {/* Offering */}
      <div className="space-y-2">
        <label
          htmlFor="offering"
          className="text-label font-black uppercase tracking-widest text-zinc-400 block"
        >
          I&apos;m offering
        </label>
        <p className="text-detail text-zinc-500 italic">
          Describe what you have. Be specific — condition, quantity, availability.
        </p>
        <textarea
          id="offering"
          name="offering"
          rows={4}
          value={offering}
          onChange={(e) => setOffering(e.target.value)}
          placeholder="e.g. A working cordless drill with two batteries. Used but well maintained. Available weekends."
          className="w-full border-2 border-zinc-900 px-5 py-4 text-body text-zinc-900 placeholder:text-zinc-300 outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow bg-white resize-none"
        />
        {fieldError("offering") && (
          <p className="text-label font-bold text-red-600 uppercase">{fieldError("offering")}</p>
        )}
      </div>

      {/* Seeking */}
      <div className="space-y-2">
        <label
          htmlFor="seeking"
          className="text-label font-black uppercase tracking-widest text-zinc-400 block"
        >
          I&apos;m needing
        </label>
        <p className="text-detail text-zinc-500 italic">
          What would make this a fair exchange for you?
        </p>
        <textarea
          id="seeking"
          name="seeking"
          rows={4}
          value={seeking}
          onChange={(e) => setSeeking(e.target.value)}
          placeholder="e.g. Help moving furniture, home-grown produce, or similar tools I'm missing."
          className="w-full border-2 border-zinc-900 px-5 py-4 text-body text-zinc-900 placeholder:text-zinc-300 outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow bg-white resize-none border-l-4 border-l-emerald-600"
        />
        {fieldError("seeking") && (
          <p className="text-label font-bold text-red-600 uppercase">{fieldError("seeking")}</p>
        )}
      </div>

      {/* Location */}
      <div className="space-y-2">
        <label className="text-label font-black uppercase tracking-widest text-zinc-400 block">
          Location
        </label>
        <p className="text-detail text-zinc-500 italic">
          Your ZIP code is used to match you with nearby members.
        </p>
        <div className="flex gap-0">
          <input
            type="text"
            value={zip}
            onChange={(e) => { setZip(e.target.value); setLocationLabel(""); setZipError(""); }}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleVerifyZip())}
            placeholder="ZIP code"
            maxLength={5}
            className="flex-1 border-2 border-r-0 border-zinc-900 px-5 py-4 text-body font-bold text-zinc-900 placeholder:text-zinc-300 outline-none bg-white"
          />
          <button
            type="button"
            onClick={handleVerifyZip}
            disabled={zipLoading}
            className="px-6 py-4 bg-zinc-900 text-white text-label font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-50 border-2 border-zinc-900"
          >
            {zipLoading ? <Loader size={14} className="animate-spin" /> : "Verify"}
          </button>
        </div>

        {/* Hidden field — actual value submitted */}
        <input type="hidden" name="zip" value={zip} />

        {locationLabel && (
          <div className="flex items-center gap-2 text-label font-bold text-emerald-700 uppercase tracking-wide">
            <CheckCircle size={13} />
            {locationLabel}
          </div>
        )}
        {(zipError || fieldError("zip")) && (
          <p className="text-label font-bold text-red-600 uppercase">
            {zipError || fieldError("zip")}
          </p>
        )}
      </div>

      {/* Photos */}
      <div className="space-y-3">
        <label className="text-label font-black uppercase tracking-widest text-zinc-400 block">
          Photos <span className="text-zinc-300 normal-case font-bold tracking-normal">(optional)</span>
        </label>
        <PhotoUploader />
      </div>

      {/* Location note */}
      <div className="border-l-4 border-zinc-300 pl-6 py-1">
        <p className="text-detail text-zinc-400 italic flex items-center gap-2">
          <MapPin size={13} />
          Only your general area is shown publicly — never your exact address.
        </p>
      </div>

      {/* Submit */}
      <div className="pt-4 border-t-4 border-zinc-900 flex gap-4">
        <button
          type="submit"
          name="submitType"
          value="draft"
          disabled={pending || !isValid}
          className="flex-1 border-2 border-zinc-900 bg-white text-zinc-900 font-black uppercase tracking-[0.2em] py-5 text-label hover:bg-zinc-100 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
        >
          {pending ? (
            <span className="flex items-center justify-center gap-3">
              <Loader size={14} className="animate-spin" />
            </span>
          ) : (
            "Save Draft"
          )}
        </button>
        <button
          type="submit"
          name="submitType"
          value="publish"
          disabled={pending || !isValid}
          className="flex-[2] bg-zinc-900 text-white font-black uppercase tracking-[0.3em] py-5 text-label hover:bg-emerald-700 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
        >
          {pending ? (
            <span className="flex items-center justify-center gap-3">
              <Loader size={14} className="animate-spin" />
              Saving...
            </span>
          ) : (
            "Publish to Exchange"
          )}
        </button>
      </div>

    </form>
  );
}

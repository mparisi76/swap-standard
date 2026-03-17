"use client";

import { useActionState, useState } from "react";
import { updateAssetAction, type AssetFormState } from "@/app/actions/assets/update";
import { lookupZipCode } from "@/utils/geo";
import { Loader, MapPin, CheckCircle } from "lucide-react";
import PhotoUploader, { type InitialPhoto } from "@/components/assets/PhotoUploader";
import TagSelector from "@/components/assets/TagSelector";
import { type Asset } from "@/types/schema";
import { parseTags } from "@/lib/tags";

const ASSET_TYPES = ["goods", "skills", "services"] as const;

const ASSET_STATUSES = [
  { value: "available", label: "Available" },
  { value: "pending", label: "Pending" },
  { value: "unavailable", label: "Unavailable" },
] as const;

interface Props {
  asset: Asset;
  initialPhotos: InitialPhoto[];
}

export default function EditAssetForm({ asset, initialPhotos }: Props) {
  const boundAction = updateAssetAction.bind(null, String(asset.id));
  const [state, action, pending] = useActionState<AssetFormState, FormData>(
    boundAction,
    null,
  );

  const [assetType, setAssetType] = useState(asset.type);
  const [assetStatus, setAssetStatus] = useState(asset.asset_status);
  const [title, setTitle] = useState(asset.title);
  const [offering, setOffering] = useState(asset.offering);
  const [offeringTags, setOfferingTags] = useState<string[]>(parseTags(asset.offering_tags));
  const [seeking, setSeeking] = useState(asset.seeking);
  const [seekingTags, setSeekingTags] = useState<string[]>(parseTags(asset.seeking_tags));
  const [zip, setZip] = useState("");
  const [newLocationLabel, setNewLocationLabel] = useState("");
  const [zipLoading, setZipLoading] = useState(false);
  const [zipError, setZipError] = useState("");

  const handleVerifyZip = async () => {
    const trimmed = zip.trim();
    if (!/^\d{5}$/.test(trimmed)) {
      setZipError("Enter a valid 5-digit ZIP.");
      setNewLocationLabel("");
      return;
    }
    setZipLoading(true);
    setZipError("");
    setNewLocationLabel("");
    try {
      const loc = await lookupZipCode(trimmed);
      setNewLocationLabel(loc.label);
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
        <label className="text-label font-black uppercase tracking-widest text-zinc-500 block">
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
        <input type="hidden" name="type" value={assetType} />
        {fieldError("type") && (
          <p className="text-label font-bold text-red-600 uppercase">{fieldError("type")}</p>
        )}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <label
          htmlFor="title"
          className="text-label font-black uppercase tracking-widest text-zinc-500 block"
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
          className="w-full border-2 border-zinc-900 px-5 py-4 text-body font-bold text-zinc-900 placeholder:text-zinc-400 outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow bg-white"
        />
        {fieldError("title") && (
          <p className="text-label font-bold text-red-600 uppercase">{fieldError("title")}</p>
        )}
      </div>

      {/* Offering */}
      <div className="space-y-2">
        <label
          htmlFor="offering"
          className="text-label font-black uppercase tracking-widest text-zinc-500 block"
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
          className="w-full border-2 border-zinc-900 px-5 py-4 text-body text-zinc-900 placeholder:text-zinc-400 outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow bg-white resize-none"
        />
        {fieldError("offering") && (
          <p className="text-label font-bold text-red-600 uppercase">{fieldError("offering")}</p>
        )}
        <p className="text-detail text-zinc-500 italic">
          Tag what you&apos;re offering to help others find your listing.
        </p>
        <TagSelector
          selected={offeringTags}
          onChange={setOfferingTags}
          name="offering_tags"
          placeholder="e.g. Power Tools, Fresh Produce…"
        />
      </div>

      {/* Seeking */}
      <div className="space-y-2">
        <label
          htmlFor="seeking"
          className="text-label font-black uppercase tracking-widest text-zinc-500 block"
        >
          I&apos;m seeking
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
          className="w-full border-2 border-zinc-900 px-5 py-4 text-body text-zinc-900 placeholder:text-zinc-400 outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow bg-white resize-none border-l-4 border-l-emerald-600"
        />
        {fieldError("seeking") && (
          <p className="text-label font-bold text-red-600 uppercase">{fieldError("seeking")}</p>
        )}
        <p className="text-detail text-zinc-500 italic">
          Tag what you&apos;d accept in trade — used to match you with other members.
        </p>
        <TagSelector
          selected={seekingTags}
          onChange={setSeekingTags}
          name="seeking_tags"
          placeholder="e.g. Childcare &amp; Babysitting, Carpentry…"
        />
      </div>

      {/* Asset Status */}
      <div className="space-y-3">
        <label className="text-label font-black uppercase tracking-widest text-zinc-500 block">
          Availability
        </label>
        <div className="flex gap-2">
          {ASSET_STATUSES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setAssetStatus(value)}
              className={`text-label font-black uppercase tracking-widest px-6 py-3 border-2 transition-all cursor-pointer
                ${assetStatus === value
                  ? "bg-zinc-900 text-white border-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  : "bg-white text-zinc-900 border-zinc-900 hover:bg-zinc-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                }`}
            >
              {label}
            </button>
          ))}
        </div>
        <input type="hidden" name="asset_status" value={assetStatus} />
      </div>

      {/* Location */}
      <div className="space-y-2">
        <label className="text-label font-black uppercase tracking-widest text-zinc-500 block">
          Location
        </label>

        {/* Existing location */}
        {asset.location_label && (
          <div className="flex items-center gap-2 text-label font-bold text-zinc-500 uppercase tracking-wide border-2 border-zinc-200 px-4 py-3 bg-zinc-50">
            <MapPin size={13} className="text-zinc-500" />
            Current: {asset.location_label}
          </div>
        )}

        <p className="text-detail text-zinc-500 italic">
          Enter a new ZIP to update your location, or leave blank to keep the current one.
        </p>
        <div className="flex gap-0">
          <input
            type="text"
            value={zip}
            onChange={(e) => { setZip(e.target.value); setNewLocationLabel(""); setZipError(""); }}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleVerifyZip())}
            placeholder="New ZIP code (optional)"
            maxLength={5}
            className="flex-1 border-2 border-r-0 border-zinc-900 px-5 py-4 text-body font-bold text-zinc-900 placeholder:text-zinc-400 outline-none bg-white"
          />
          <button
            type="button"
            onClick={handleVerifyZip}
            disabled={zipLoading || !zip}
            className="px-6 py-4 bg-zinc-900 text-white text-label font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-50 border-2 border-zinc-900"
          >
            {zipLoading ? <Loader size={14} className="animate-spin" /> : "Verify"}
          </button>
        </div>

        {/* Hidden fields for the server action */}
        <input type="hidden" name="newZip" value={newLocationLabel ? zip : ""} />
        <input type="hidden" name="existingLat" value={asset.latitude ?? ""} />
        <input type="hidden" name="existingLng" value={asset.longitude ?? ""} />
        <input type="hidden" name="existingLocationLabel" value={asset.location_label ?? ""} />

        {newLocationLabel && (
          <div className="flex items-center gap-2 text-label font-bold text-emerald-700 uppercase tracking-wide">
            <CheckCircle size={13} />
            {newLocationLabel}
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
        <label className="text-label font-black uppercase tracking-widest text-zinc-500 block">
          Photos <span className="text-zinc-400 normal-case font-bold tracking-normal">(optional)</span>
        </label>
        <PhotoUploader initialPhotos={initialPhotos} />
      </div>

      {/* Privacy note */}
      <div className="border-l-4 border-zinc-300 pl-6 py-1">
        <p className="text-detail text-zinc-500 italic flex items-center gap-2">
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
          className="flex-2 bg-zinc-900 text-white font-black uppercase tracking-[0.3em] py-5 text-label hover:bg-emerald-700 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
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

"use server";

import { redirect } from "next/navigation";
import { getValidToken } from "@/lib/auth";

export type AssetFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
} | null;

export async function updateAssetAction(
  assetId: string,
  _prevState: AssetFormState,
  formData: FormData,
): Promise<AssetFormState> {
  const token = await getValidToken();
  if (!token) return { error: "Not authenticated. Please log in." };

  const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL!;

  // Validate required fields
  const title = (formData.get("title") as string)?.trim();
  const type = formData.get("type") as string;
  const offering = (formData.get("offering") as string)?.trim();
  const offering_tags = formData.getAll("offering_tags") as string[];
  const seeking = (formData.get("seeking") as string)?.trim();
  const seeking_tags = formData.getAll("seeking_tags") as string[];
  const asset_status = formData.get("asset_status") as string;

  const fieldErrors: Record<string, string> = {};
  if (!title) fieldErrors.title = "Title is required.";
  if (!type) fieldErrors.type = "Select a type.";
  if (!offering) fieldErrors.offering = "Describe what you are offering.";
  if (!seeking) fieldErrors.seeking = "Describe what you need in return.";

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  // Location — only re-resolve if a new ZIP was entered
  const newZip = (formData.get("newZip") as string)?.trim();
  let latitude: number | null = parseFloat(formData.get("existingLat") as string) || null;
  let longitude: number | null = parseFloat(formData.get("existingLng") as string) || null;
  let location_label: string | null = (formData.get("existingLocationLabel") as string) || null;

  if (newZip && /^\d{5}$/.test(newZip)) {
    try {
      const geoRes = await fetch(`https://api.zippopotam.us/us/${newZip}`);
      if (!geoRes.ok) return { fieldErrors: { zip: "ZIP code not found." } };
      const geoData = await geoRes.json();
      const place = geoData.places[0];
      latitude = parseFloat(place.latitude);
      longitude = parseFloat(place.longitude);
      location_label = `${place["place name"]}, ${place["state abbreviation"]} ${newZip}`;
    } catch {
      return { fieldErrors: { zip: "Could not resolve ZIP code." } };
    }
  }

  // Photos
  const thumbnailId = (formData.get("thumbnailId") as string) || null;
  const galleryIds = formData.getAll("galleryIds") as string[];
  const image_gallery = galleryIds.filter(Boolean).map((id) => ({ directus_files_id: id }));

  const submitType = formData.get("submitType") as string;
  const isPublishing = submitType === "publish";
  const isSavingDraft = submitType === "draft";

  const res = await fetch(`${baseUrl}/items/assets/${assetId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      type,
      offering,
      offering_tags,
      seeking,
      seeking_tags,
      asset_status,
      ...(isPublishing && { status: "published" }),
      ...(isSavingDraft && { status: "draft" }),
      thumbnail: thumbnailId,
      image_gallery,
      latitude,
      longitude,
      location_label,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    return { error: err.errors?.[0]?.message || "Failed to update listing." };
  }

  if (isPublishing) redirect(`/explore/${assetId}`);
  redirect("/dashboard");
}

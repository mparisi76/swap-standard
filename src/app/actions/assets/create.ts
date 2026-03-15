"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isBot } from "@/utils/honeypot";

export type AssetFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
} | null;

export async function createAssetAction(
  _prevState: AssetFormState,
  formData: FormData,
): Promise<AssetFormState> {
  const cookieStore = await cookies();
  const token = cookieStore.get("directus_session")?.value;
  if (!token) return { error: "Not authenticated. Please log in." };

  if (isBot(formData)) return null;

  const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL!;

  // Validate required fields
  const title = (formData.get("title") as string)?.trim();
  const type = formData.get("type") as string;
  const offering = (formData.get("offering") as string)?.trim();
  const seeking = (formData.get("seeking") as string)?.trim();
  const zip = (formData.get("zip") as string)?.trim();

  const fieldErrors: Record<string, string> = {};
  if (!title) fieldErrors.title = "Title is required.";
  if (!type) fieldErrors.type = "Select a type.";
  if (!offering) fieldErrors.offering = "Describe what you are offering.";
  if (!seeking) fieldErrors.seeking = "Describe what you need in return.";
  if (!zip) fieldErrors.zip = "Location is required.";

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  // Resolve ZIP to coordinates
  let latitude: number | null = null;
  let longitude: number | null = null;
  let location_label: string | null = null;

  if (zip) {
    try {
      const geoRes = await fetch(`https://api.zippopotam.us/us/${zip}`);
      if (!geoRes.ok) {
        return { fieldErrors: { zip: "ZIP code not found." } };
      }
      const geoData = await geoRes.json();
      const place = geoData.places[0];
      latitude = parseFloat(place.latitude);
      longitude = parseFloat(place.longitude);
      location_label = `${place["place name"]}, ${place["state abbreviation"]} ${zip}`;
    } catch {
      return { fieldErrors: { zip: "Could not resolve ZIP code." } };
    }
  }

  // Photos are pre-uploaded client-side via /api/upload
  const thumbnailId = (formData.get("thumbnailId") as string) || null;
  const galleryIds = formData.getAll("galleryIds") as string[];

  // Build image_gallery M2M nested create payload
  const image_gallery = galleryIds
    .filter(Boolean)
    .map((id) => ({ directus_files_id: id }));

  const offering_tags = formData.getAll("offering_tags") as string[];
  const seeking_tags = formData.getAll("seeking_tags") as string[];

  const submitType = formData.get("submitType") as string;
  const isPublishing = submitType === "publish";

  // Create the asset
  const res = await fetch(`${baseUrl}/items/assets`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      type,
      offering,
      seeking,
      status: isPublishing ? "published" : "draft",
      asset_status: "available",
      thumbnail: thumbnailId,
      image_gallery,
      latitude,
      longitude,
      location_label,
      offering_tags: offering_tags.length > 0 ? offering_tags : [],
      seeking_tags: seeking_tags.length > 0 ? seeking_tags : [],
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    return { error: err.errors?.[0]?.message || "Failed to create listing." };
  }

  redirect("/dashboard");
}

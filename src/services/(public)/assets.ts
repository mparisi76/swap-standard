import { directus } from "@/lib/directus";
import { Asset } from "@/types/schema";
import { readItems, aggregate } from "@directus/sdk";
import { cache } from "react";
import { haversineDistance, boundingBox } from "@/utils/geo";
import { parseTags } from "@/lib/tags";

type DirectusFilter = Record<string, unknown>;

const buildFilters = (params: {
  type?: string;
  search?: string;
  tags?: string[];
  userLat?: number;
  userLng?: number;
  radius?: number;
}) => {
  const { type, search, userLat, userLng, radius = 10 } = params;

  const andFilters: DirectusFilter[] = [{ status: { _eq: "published" } }];

  if (type && type !== "all") {
    andFilters.push({ type: { _eq: type } });
  }

  if (search) {
    andFilters.push({
      _or: [
        { title: { _icontains: search } },
        { offering: { _icontains: search } },
        { seeking: { _icontains: search } },
      ],
    });
  }


  if (userLat != null && userLng != null) {
    const box = boundingBox(userLat, userLng, radius);
    andFilters.push({
      latitude: { _between: [box.lat_min, box.lat_max] },
    });
    andFilters.push({
      longitude: { _between: [box.lng_min, box.lng_max] },
    });
  }

  return { _and: andFilters };
};

export const getAssets = cache(
  async (params: {
    type?: string;
    search?: string;
    tags?: string[];
    page?: number;
    limit?: number;
    userLat?: number;
    userLng?: number;
    radius?: number;
  }) => {
    const { page = 1, limit = 20, userLat, userLng, tags } = params;
    const filter = buildFilters(params);

    const fields = [
      "id", "title", "type", "offering", "seeking", "status",
      "asset_status", "date_created", "thumbnail", "image_gallery",
      "latitude", "longitude", "location_label", "offering_tags", "seeking_tags",
    ];

    const hasTags = tags && tags.length > 0;

    const data = await directus.request(
      readItems("assets", {
        filter,
        fields: fields as unknown as (keyof Asset)[],
        sort: ["-date_created", "-id"] as unknown as (keyof Asset)[],
        limit: hasTags ? -1 : limit,
        page: hasTags ? undefined : page,
      }),
    );

    let assets = data as Asset[];

    // Tag filtering must be done in JS — CSV fields don't support Directus filter operators
    if (hasTags) {
      const tagSet = new Set(tags!.map((t) => t.toLowerCase()));
      assets = assets.filter((a) =>
        parseTags(a.offering_tags).some((t) => tagSet.has(t.toLowerCase())) ||
        parseTags(a.seeking_tags).some((t) => tagSet.has(t.toLowerCase())),
      );
    }

    const totalCount = hasTags
      ? assets.length
      : Number((await directus.request(aggregate("assets", { aggregate: { count: "*" }, query: { filter } })))[0]?.count || 0);

    // Manual pagination when tag filtering in JS
    if (hasTags) {
      const offset = (page - 1) * limit;
      assets = assets.slice(offset, offset + limit);
    }

    // If user location is known, compute distance and sort by proximity
    if (userLat != null && userLng != null) {
      assets = assets
        .map((a) => ({
          ...a,
          distance_miles:
            a.latitude != null && a.longitude != null
              ? haversineDistance(userLat, userLng, a.latitude, a.longitude)
              : undefined,
        }))
        .sort(
          (a, b) => (a.distance_miles ?? Infinity) - (b.distance_miles ?? Infinity),
        );
    }

    return {
      data: assets,
      meta: { filter_count: totalCount },
    };
  },
);

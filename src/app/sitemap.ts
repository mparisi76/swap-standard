import { MetadataRoute } from "next";

interface AssetRow {
  id: number;
  date_updated: string | null;
  date_created: string;
}

async function getPublishedAssets(): Promise<AssetRow[]> {
  const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL!;
  const params = new URLSearchParams({
    fields: "id,date_updated,date_created",
    "filter[status][_eq]": "published",
    limit: "1000",
    sort: "-date_created",
  });

  try {
    const res = await fetch(`${baseUrl}/items/assets?${params}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data as AssetRow[]) ?? [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://swapstandard.com";
  const assets = await getPublishedAssets();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date("2026-03-01"),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: new Date("2026-03-01"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: new Date("2026-03-01"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const assetRoutes: MetadataRoute.Sitemap = assets.map((asset) => ({
    url: `${siteUrl}/explore/${asset.id}`,
    lastModified: new Date(asset.date_updated ?? asset.date_created),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...assetRoutes];
}

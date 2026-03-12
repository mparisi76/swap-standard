import { directus } from "@/lib/directus";
import { readItems } from "@directus/sdk";
import { Asset } from "@/types/schema";
import AssetCard from "@/components/explore/AssetCard";

async function fetchSimilar(type: string, excludeId: number): Promise<Asset[]> {
  try {
    const response = await directus.request(
      readItems("assets", {
        filter: {
          status: { _eq: "published" },
          type: { _eq: type },
          id: { _neq: excludeId },
        } as unknown as Record<string, unknown>,
        fields: [
          "id",
          "title",
          "type",
          "offering",
          "seeking",
          "thumbnail",
          "asset_status",
        ] as unknown as (keyof Asset)[],
        limit: 3,
        sort: ["-date_created"] as unknown as (keyof Asset)[],
      }),
    );
    return Array.isArray(response) ? (response as unknown as Asset[]) : [];
  } catch {
    return [];
  }
}

export default async function SimilarItems({
  type,
  currentId,
}: {
  type: string;
  currentId: number;
}) {
  const items = await fetchSimilar(type, currentId);
  if (items.length === 0) return null;

  return (
    <section className="max-w-5xl mx-auto px-6 mt-12 border-t-2 border-zinc-900 pt-16 pb-8">
      <div className="mb-10">
        <h2 className="text-header font-bold uppercase tracking-tighter text-zinc-900 italic">
          You May Also Like
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <AssetCard key={item.id} asset={item} />
        ))}
      </div>
    </section>
  );
}

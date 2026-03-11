import { Suspense } from "react";
import AssetCard from "@/components/explore/AssetCard";
import { getAssets } from "@/services/(public)/assets";
import EmptyState from "@/components/shared/EmptyState";
import ControlBar from "@/components/explore/ControlBar";
import LocationInterstitial from "@/components/explore/LocationInterstitial";

interface ExploreParams {
  page?: string;
  limit?: string;
  search?: string;
  type?: string;
  lat?: string;
  lng?: string;
  radius?: string;
}

async function ResourceFeed({ params }: { params: ExploreParams }) {
  const itemsPerPage = 24;
  const currentPage = Number(params.page) || 1;
  const searchTerm = params.search || "";
  const userLat = params.lat ? parseFloat(params.lat) : undefined;
  const userLng = params.lng ? parseFloat(params.lng) : undefined;
  const radius = params.radius ? parseFloat(params.radius) : 10;

  const { data: items } = await getAssets({
    type: params.type || "all",
    search: searchTerm,
    page: currentPage,
    limit: itemsPerPage,
    userLat,
    userLng,
    radius,
  });

  if (items.length === 0) return <EmptyState activeSearch={searchTerm} />;

  return (
    <>
      {/* Reduced grid density: From 6 columns to a max of 3 or 4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <AssetCard key={item.id} asset={item} />
        ))}
      </div>

      <div className="py-12 border-t border-zinc-200 mt-12">
        {/* Pagination logic */}
      </div>
    </>
  );
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<ExploreParams>;
}) {
  const params = await searchParams;

  return (
    <main className="bg-[#F9F8F6] min-h-screen">
      <Suspense fallback={null}>
        <LocationInterstitial />
      </Suspense>
      <ControlBar />

      <div className="max-w-400 mx-auto px-6 py-8">
        {/* Search Bar goes here, acting as the primary command center for the feed */}
        {/* <div className="mb-8">
          <SearchBar />
        </div> */}

        {/* Content feed follows */}
        <div className="min-h-[60vh]">
          <Suspense
            key={JSON.stringify(params)}
            fallback={
              <div className="p-10 text-detail font-mono uppercase text-zinc-400 animate-pulse">
                Synchronizing registry...
              </div>
            }
          >
            <ResourceFeed params={params} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

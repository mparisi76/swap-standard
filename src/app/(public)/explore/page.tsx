import { Suspense } from "react";
import { type Metadata } from "next";
import AssetCard from "@/components/explore/AssetCard";
import { getAssets } from "@/services/(public)/assets";
import EmptyState from "@/components/shared/EmptyState";
import ControlBar from "@/components/explore/ControlBar";
import LocationInterstitial from "@/components/explore/LocationInterstitial";
import { AssetFeedSkeleton } from "@/components/explore/AssetCardSkeleton";
import Pagination from "@/components/explore/Pagination";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://swapstandard.com";

export const metadata: Metadata = {
  title: "Explore the Exchange",
  description:
    "Browse tools, skills, and services available for direct exchange in your community. Find what you need or offer what you have.",
  alternates: {
    canonical: `${SITE_URL}/explore`,
  },
  openGraph: {
    title: "Explore the Exchange | SwapStandard",
    description:
      "Browse tools, skills, and services available for direct exchange in your community.",
    url: `${SITE_URL}/explore`,
  },
};

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

  const { data: items, meta } = await getAssets({
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <AssetCard key={item.id} asset={item} />
        ))}
      </div>

      <Suspense fallback={null}>
        <Pagination
          currentPage={currentPage}
          totalCount={meta.filter_count}
          pageSize={itemsPerPage}
        />
      </Suspense>
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
    <main className="bg-[#F9F8F6]">
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
        <div>
          <Suspense
            key={JSON.stringify(params)}
            fallback={<AssetFeedSkeleton />}
          >
            <ResourceFeed params={params} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

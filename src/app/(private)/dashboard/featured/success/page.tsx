import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default async function FeaturedSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ asset?: string }>;
}) {
  const { asset: assetId } = await searchParams;

  return (
    <main className="min-h-screen bg-[#F9F8F6] flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white border-4 border-zinc-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-10 text-center">
        <CheckCircle size={40} className="text-emerald-700 mx-auto mb-6" strokeWidth={2} />

        <span className="text-label font-black uppercase tracking-[0.3em] text-zinc-500 block mb-2">
          Payment Confirmed
        </span>
        <h1 className="text-header font-black uppercase italic text-zinc-900 leading-tight mb-4">
          Your Listing is Now Featured
        </h1>
        <p className="text-body text-zinc-500 leading-relaxed mb-8">
          Your listing will appear at the top of the explore feed for the next
          7 days. Thank you for supporting SwapStandard.
        </p>

        <div className="flex flex-col gap-3">
          {assetId && (
            <Link
              href={`/explore/${assetId}`}
              className="w-full py-4 bg-emerald-700 text-white text-label font-black uppercase tracking-widest hover:bg-emerald-800 transition-colors"
            >
              View Your Listing →
            </Link>
          )}
          <Link
            href="/dashboard"
            className="w-full py-4 border-2 border-zinc-900 text-zinc-900 text-label font-black uppercase tracking-widest hover:bg-zinc-100 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

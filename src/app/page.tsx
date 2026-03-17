import { type Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { directus } from "@/lib/directus";
import { readItems } from "@directus/sdk";
import { Asset } from "@/types/schema";
import AnimatedSection from "@/components/layout/AnimatedSection";

export const metadata: Metadata = {
  title: "SwapStandard — Stronger Together",
  description:
    "A stewardship registry built on the duty of care. Share what you have, find what you need, and build a network of mutual resilience through direct exchange.",
  openGraph: {
    title: "SwapStandard — Stronger Together",
    description:
      "Share what you have, find what you need. Direct exchange. Mutual resilience.",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://swapstandard.com",
  },
};

export const revalidate = 0;

export default async function HomePage() {
  const assets = await directus.request<Asset[]>(
    readItems("assets", {
      filter: { asset_status: { _eq: "available" } },
      fields: ["id", "title", "offering", "seeking", "type", "asset_status"],
    }),
  );

  const sharedCount = assets.filter((a) => a.offering).length;
  const seekingCount = assets.filter((a) => a.seeking).length;

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#F9F8F6] py-20 px-6 font-serif">
      <div className="max-w-3xl mx-auto">
        <AnimatedSection delay={0.1}>
          <section className="mb-16">
            <h1 className="text-[calc(var(--text-header-size)*2.5)] md:text-[calc(var(--text-header-size)*3)] font-bold text-zinc-900 leading-tight mb-6">
              Stronger Together.
            </h1>
            <p className="text-[calc(var(--text-body-size)*1.25)] text-zinc-600 leading-relaxed max-w-2xl italic">
              SwapStandard is a stewardship registry built on the duty of care.
              We believe in direct exchange as a way to look out for our fellow
              humans. Find what you need, share what you can, and build a
              network of mutual resilience.
            </p>
          </section>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <section className="mb-12">
            <form
              action={async (formData: FormData) => {
                "use server";
                const q = (formData.get("search") as string).trim();
                redirect(q ? `/explore?search=${encodeURIComponent(q)}` : "/explore");
              }}
            >
              <div className="flex flex-col gap-2">
                <label className="text-label font-bold uppercase tracking-widest text-zinc-500 ml-2">
                  Search the local exchange
                </label>
                <div className="flex border-4 border-zinc-900 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <input
                    name="search"
                    type="text"
                    placeholder="Search for tools, skills, or items..."
                    className="flex-1 px-6 py-5 text-body outline-none placeholder:text-zinc-500"
                  />
                  <button
                    type="submit"
                    className="px-10 py-5 bg-zinc-900 text-white font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all text-label cursor-pointer"
                  >
                    Search
                  </button>
                </div>
              </div>
            </form>
          </section>
        </AnimatedSection>

        <AnimatedSection delay={0.3}>
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <Link
              href="/dashboard/asset/new"
              className="border-4 border-zinc-900 p-8 hover:bg-zinc-100 transition-all hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
              <span className="block text-header font-bold text-zinc-900 mb-2">
                Share a Resource
              </span>
              <span className="text-zinc-600 italic text-detail">
                Register tools, skills, or surplus to support your community.
              </span>
            </Link>
            <Link
              href="/explore"
              className="border-4 border-zinc-900 p-8 hover:bg-zinc-100 transition-all hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
              <span className="block text-header font-bold text-zinc-900 mb-2">
                Identify a Need
              </span>
              <span className="text-zinc-600 italic text-detail">
                Browse what others require and offer your support.
              </span>
            </Link>
          </section>
        </AnimatedSection>

        <AnimatedSection delay={0.4}>
          <section className="flex flex-wrap gap-12 pt-8 border-t-2 border-zinc-200">
            <div>
              <p className="text-[calc(var(--text-header-size)*2)] font-black text-zinc-900">
                {sharedCount}
              </p>
              <p className="text-label font-bold uppercase tracking-widest text-zinc-500">
                Community Assets
              </p>
            </div>
            <div>
              <p className="text-[calc(var(--text-header-size)*2)] font-black text-zinc-900">
                {seekingCount}
              </p>
              <p className="text-label font-bold uppercase tracking-widest text-zinc-500">
                Ways to Help
              </p>
            </div>
            <div className="md:ml-auto">
              <p className="text-detail italic text-zinc-500 max-w-50">
                &ldquo;The duty of care is the foundation of our local
                strength.&rdquo;
              </p>
            </div>
          </section>
        </AnimatedSection>
      </div>
    </main>
  );
}

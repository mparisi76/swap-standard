import { type Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AnimatedSection from "@/components/layout/AnimatedSection";

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;

export const metadata: Metadata = {
  title: "SwapStandard — The Standard for Swapping Goods and Services",
  description:
    "The standard for swapping goods and services. A community barter registry built on a duty of care to our earth and one another.",
  openGraph: {
    title: "SwapStandard — The Standard for Swapping Goods and Services",
    description:
      "The standard for swapping goods and services. Direct person-to-person exchange — no middleman, no unnecessary costs.",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://swapstandard.com",
  },
};

export const revalidate = 3600;

async function getCount(filter: Record<string, unknown>): Promise<number> {
  const params = new URLSearchParams({
    filter: JSON.stringify(filter),
    limit: "0",
    meta: "filter_count",
  });
  const res = await fetch(`${DIRECTUS_URL}/items/assets?${params}`, { cache: "no-store" });
  if (!res.ok) return 0;
  const json = await res.json();
  return json?.meta?.filter_count ?? 0;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.swapstandard.com";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "SwapStandard",
      url: SITE_URL,
      description:
        "The standard for swapping goods and services. A community barter registry built on a duty of care to our earth and one another.",
      contactPoint: {
        "@type": "ContactPoint",
        email: "swapstandard@gmail.com",
        contactType: "customer support",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "SwapStandard",
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/explore?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default async function HomePage() {
  const [sharedCount, seekingCount] = await Promise.all([
    getCount({ _and: [{ status: { _eq: "published" } }, { offering: { _nnull: true } }] }),
    getCount({ _and: [{ status: { _eq: "published" } }, { seeking: { _nnull: true } }] }),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    <main className="min-h-[calc(100vh-80px)] bg-[#F9F8F6] py-20 px-6 font-serif">
      <div className="max-w-3xl mx-auto">
        <AnimatedSection delay={0.1}>
          <section className="mb-16">
            <h1 className="text-[calc(var(--text-header-size)*2.5)] md:text-[calc(var(--text-header-size)*3)] font-bold text-zinc-900 leading-tight mb-6">
              Keep Good Things in Use.
            </h1>
            <p className="text-[calc(var(--text-body-size)*1.25)] text-zinc-600 leading-relaxed max-w-2xl italic mb-6">
              The things we no longer need still hold immense value for someone
              else. SwapStandard is built on a simple, human duty of care: by
              sharing our resources — through exchange or gift — we strengthen
              the fabric of our local community.
            </p>
            <p className="text-[calc(var(--text-body-size)*1.1)] text-zinc-500 leading-relaxed max-w-2xl">
              No middleman, no unnecessary costs. Just a straightforward way to
              keep good items in use, support a neighbor, and move away from a
              culture of waste toward one of connection.
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
                Offer Something
              </span>
              <span className="text-zinc-600 italic text-detail">
                Clear out your workspace. List a tool, a skill, or anything
                with life left in it.
              </span>
            </Link>
            <Link
              href="/explore"
              className="border-4 border-zinc-900 p-8 hover:bg-zinc-100 transition-all hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
              <span className="block text-header font-bold text-zinc-900 mb-2">
                Find What You Need
              </span>
              <span className="text-zinc-600 italic text-detail">
                Browse your local exchange. Everything here is offered
                person-to-person, directly.
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
                &ldquo;Every swap is an opportunity to support a neighbor.&rdquo;
              </p>
            </div>
          </section>
        </AnimatedSection>
      </div>
    </main>
    </>
  );
}

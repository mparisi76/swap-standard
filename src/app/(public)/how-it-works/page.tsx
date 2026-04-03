import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How It Works | SwapStandard",
  description:
    "SwapStandard connects neighbors through direct barter — no money, no middleman. Learn how listings, direct matching, and chain trades work.",
};

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-[#F9F8F6] px-4 md:px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-16">

        <header className="border-b-4 border-zinc-900 pb-6">
          <span className="text-label font-black uppercase tracking-[0.3em] text-zinc-500 block mb-2">
            The Exchange
          </span>
          <h1 className="text-header font-black uppercase italic text-zinc-900 leading-tight">
            How It Works
          </h1>
          <p className="text-body text-zinc-600 mt-4 leading-relaxed">
            SwapStandard is a community barter registry. No money changes hands — only goods, skills, and services between neighbors. Here&rsquo;s how it all fits together.
          </p>
        </header>

        {/* Step 1 */}
        <section className="space-y-4">
          <div className="flex items-start gap-6">
            <span className="text-[3rem] font-black text-zinc-200 leading-none select-none">01</span>
            <div className="space-y-3">
              <h2 className="text-body font-black uppercase tracking-wider text-zinc-900">
                Post What You Have. Say What You Need.
              </h2>
              <p className="text-body text-zinc-600 leading-relaxed">
                Create a listing for anything you&rsquo;re willing to offer — a tool you rarely use, a skill you have, a service you can provide. In the same listing, describe what you&rsquo;re hoping to get in return. Both sides of the exchange live in one place.
              </p>
              <p className="text-body text-zinc-600 leading-relaxed">
                Use tags to categorize what you&rsquo;re offering and seeking. Tags are how the platform finds matches for you automatically.
              </p>
            </div>
          </div>
        </section>

        <div className="border-t-2 border-zinc-300" />

        {/* Step 2 */}
        <section className="space-y-4">
          <div className="flex items-start gap-6">
            <span className="text-[3rem] font-black text-zinc-200 leading-none select-none">02</span>
            <div className="space-y-3">
              <h2 className="text-body font-black uppercase tracking-wider text-zinc-900">
                Browse the Exchange
              </h2>
              <p className="text-body text-zinc-600 leading-relaxed">
                Explore listings near you filtered by distance. You can search by keyword, filter by category, and save listings you&rsquo;re interested in. When you find something worth pursuing, send an opening message to start the conversation.
              </p>
            </div>
          </div>
        </section>

        <div className="border-t-2 border-zinc-300" />

        {/* Direct Matching */}
        <section className="space-y-6">
          <div className="flex items-start gap-6">
            <span className="text-[3rem] font-black text-zinc-200 leading-none select-none">03</span>
            <div className="space-y-3">
              <h2 className="text-body font-black uppercase tracking-wider text-zinc-900">
                Direct Matching
              </h2>
              <p className="text-body text-zinc-600 leading-relaxed">
                You don&rsquo;t have to find matches yourself. Once a day, SwapStandard scans all published listings and looks for members whose tags line up — someone offering what you&rsquo;re seeking, and seeking what you&rsquo;re offering.
              </p>
              <p className="text-body text-zinc-600 leading-relaxed">
                When a match is found, both members receive an email digest. No browsing required — the platform surfaces the connection for you.
              </p>
              <div className="border-2 border-zinc-900 p-5 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-label font-black uppercase tracking-wider text-zinc-500 mb-2">Example</p>
                <p className="text-body text-zinc-700 leading-relaxed">
                  Member A offers <strong>Plumbing</strong> and is seeking <strong>Carpentry</strong>.<br />
                  Member B offers <strong>Carpentry</strong> and is seeking <strong>Plumbing</strong>.<br />
                  Both get notified — a direct two-way match.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="border-t-2 border-zinc-300" />

        {/* Chain Trades */}
        <section className="space-y-6">
          <div className="flex items-start gap-6">
            <span className="text-[3rem] font-black text-zinc-200 leading-none select-none">04</span>
            <div className="space-y-3">
              <h2 className="text-body font-black uppercase tracking-wider text-zinc-900">
                Chain Trades
              </h2>
              <p className="text-body text-zinc-600 leading-relaxed">
                Sometimes a direct two-way match doesn&rsquo;t exist — but a three-way trade does. Chain trades connect three members in a cycle where each person gives to one neighbor and receives from another.
              </p>
              <div className="border-2 border-zinc-900 p-5 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-label font-black uppercase tracking-wider text-zinc-500 mb-2">Example</p>
                <p className="text-body text-zinc-700 leading-relaxed">
                  Member A offers <strong>Eggs</strong>, needs <strong>Firewood</strong>.<br />
                  Member B offers <strong>Firewood</strong>, needs <strong>Carpentry</strong>.<br />
                  Member C offers <strong>Carpentry</strong>, needs <strong>Eggs</strong>.<br />
                  All three get notified of the cycle — nobody is left out.
                </p>
              </div>
              <p className="text-body text-zinc-600 leading-relaxed">
                Chain trades unlock exchanges that would otherwise never happen. The more tags you add to your listing, the better your chances of appearing in a match.
              </p>
            </div>
          </div>
        </section>

        <div className="border-t-2 border-zinc-300" />

        {/* CTA */}
        <section className="space-y-6 pb-4">
          <h2 className="text-body font-black uppercase tracking-wider text-zinc-900">
            Ready to Join?
          </h2>
          <p className="text-body text-zinc-600 leading-relaxed">
            Create an account, post your first listing, and let the exchange find you. Every swap keeps something useful in circulation and builds a stronger local community.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/register"
              className="px-8 py-4 bg-zinc-900 text-white font-black uppercase tracking-widest text-label hover:bg-emerald-700 transition-all"
            >
              Create Account
            </Link>
            <Link
              href="/explore"
              className="px-8 py-4 border-2 border-zinc-900 font-black uppercase tracking-widest text-label text-zinc-900 hover:bg-zinc-100 transition-all"
            >
              Browse Listings
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}

import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#F9F8F6] text-zinc-900 border-t-4 border-zinc-900 mt-auto">
      <div className="px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10 border-b-2 border-zinc-200">

          {/* Brand */}
          <div>
            <div className="text-header font-black uppercase tracking-tighter text-zinc-900 mb-4">
              <span className="flex flex-col leading-[0.6] tracking-tight">
                <span><span className="pl-4 text-[1.5em]">S</span>wap</span>
                <span><span className="text-[1.5em]">S</span>tandard</span>
              </span>
            </div>
            <p className="text-detail text-zinc-500 leading-relaxed">
              A stewardship registry built on the duty of care. Direct exchange. Mutual resilience.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <span className="text-label font-black uppercase tracking-[0.3em] text-zinc-400 block mb-4">
              Registry
            </span>
            <nav className="space-y-2">
              <Link
                href="/explore"
                className="block text-detail font-bold uppercase tracking-widest text-zinc-600 hover:text-emerald-700 transition-colors"
              >
                Explore Exchange
              </Link>
              <Link
                href="/dashboard"
                className="block text-detail font-bold uppercase tracking-widest text-zinc-600 hover:text-emerald-700 transition-colors"
              >
                Member Portal
              </Link>
              <Link
                href="/dashboard/asset/new"
                className="block text-detail font-bold uppercase tracking-widest text-zinc-600 hover:text-emerald-700 transition-colors"
              >
                Register Asset
              </Link>
            </nav>
          </div>

          {/* Ethos */}
          <div>
            <span className="text-label font-black uppercase tracking-[0.3em] text-zinc-400 block mb-4">
              Duty of Care
            </span>
            <p className="text-detail text-zinc-500 leading-relaxed italic">
              &ldquo;The strength of a community is measured by what its members share, not what they own.&rdquo;
            </p>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <span className="font-mono text-label text-zinc-400 uppercase tracking-widest">
            &copy; {year} SwapStandard — All exchanges logged.
          </span>
        </div>
      </div>
    </footer>
  );
}

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
              <span className="flex items-center leading-none tracking-tight">
                <span className="text-[2.25em] font-black">S</span>
                <span className="flex flex-col leading-[.8] ml-0">
                  <span>wap</span>
                  <span>tandard</span>
                </span>
              </span>
            </div>
            <p className="text-detail text-zinc-500 leading-relaxed">
              A stewardship registry built on the duty of care. Direct exchange. Mutual resilience.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <span className="text-label font-black uppercase tracking-[0.3em] text-zinc-500 block mb-4">
              Explore
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
                New Listing
              </Link>
              <Link
                href="/contact"
                className="block text-detail font-bold uppercase tracking-widest text-zinc-600 hover:text-emerald-700 transition-colors"
              >
                Contact
              </Link>
            </nav>
          </div>

          {/* Ethos */}
          <div>
            {/* <span className="text-label font-black uppercase tracking-[0.3em] text-zinc-500 block mb-4">
              Duty of Care
            </span> */}
            <p className="text-detail text-zinc-500 leading-relaxed italic">
              &ldquo;The strength of a community is measured by what its members share, not what they own.&rdquo;
            </p>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <span className="font-mono text-label text-zinc-500 uppercase tracking-widest">
            &copy; {year} SwapStandard — All exchanges logged.
          </span>
          <div className="flex gap-6">
            <Link href="/terms" className="text-label font-bold uppercase tracking-widest text-zinc-500 hover:text-emerald-700 transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-label font-bold uppercase tracking-widest text-zinc-500 hover:text-emerald-700 transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

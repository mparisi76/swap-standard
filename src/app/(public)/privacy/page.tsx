import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | SwapStandard",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#F9F8F6] px-4 md:px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-10">

        <header className="border-b-4 border-zinc-900 pb-6">
          <span className="text-label font-black uppercase tracking-[0.3em] text-zinc-500 block mb-2">Legal</span>
          <h1 className="text-header font-black uppercase italic text-zinc-900">Privacy Policy</h1>
          <p className="text-body text-zinc-500 mt-2">Last updated: March 2026</p>
        </header>

        <div className="space-y-8 text-body text-zinc-700 leading-relaxed">

          <section className="space-y-3">
            <h2 className="text-body font-black uppercase text-zinc-900">1. What We Collect</h2>
            <p>When you use SwapStandard, we collect the following information:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Account information:</strong> your name, email address, and password (stored encrypted)</li>
              <li><strong>Listing content:</strong> titles, descriptions, photos, and tags you provide when creating listings</li>
              <li><strong>Location data:</strong> your ZIP code and approximate coordinates, used to show your listings to nearby members</li>
              <li><strong>Usage data:</strong> pages visited and actions taken, used to improve the platform</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-body font-black uppercase text-zinc-900">2. How We Use It</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To operate and display your listings to other members</li>
              <li>To match you with nearby members offering or seeking what you need</li>
              <li>To send you email notifications about matches, trades, and account activity</li>
              <li>To prevent fraud and enforce our Terms of Service</li>
            </ul>
            <p>We do not sell your personal information to third parties.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-body font-black uppercase text-zinc-900">3. What's Visible to Others</h2>
            <p>Your listings are publicly visible, including title, description, photos, and general location (city/state — never your exact address or coordinates). Your email address is never shown publicly.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-body font-black uppercase text-zinc-900">4. Third-Party Services</h2>
            <p>We use the following third-party services to operate the platform:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Directus</strong> — our backend database and content management system</li>
              <li><strong>Resend</strong> — transactional email delivery</li>
              <li><strong>Cloudflare Turnstile</strong> — bot protection on registration and login forms</li>
              <li><strong>Stripe</strong> — payment processing for optional featured listings</li>
            </ul>
            <p>Each of these services has its own privacy policy governing how they handle data.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-body font-black uppercase text-zinc-900">5. Email Communications</h2>
            <p>We may send you emails about trade matches, exchange activity, and platform updates. Every notification email includes an unsubscribe link. You can opt out at any time and will no longer receive match or trade notifications.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-body font-black uppercase text-zinc-900">6. Data Retention</h2>
            <p>Your account and listing data is retained as long as your account is active. If you request account deletion, we will remove your personal information within 30 days. Some data may be retained longer if required by law.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-body font-black uppercase text-zinc-900">7. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. To make a request, contact us at <a href="mailto:swapstandard@gmail.com" className="text-emerald-700 hover:underline">swapstandard@gmail.com</a>.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-body font-black uppercase text-zinc-900">8. Changes to This Policy</h2>
            <p>We may update this policy from time to time. We will notify registered members of material changes via email.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-body font-black uppercase text-zinc-900">9. Contact</h2>
            <p>Questions about your privacy? Email us at <a href="mailto:swapstandard@gmail.com" className="text-emerald-700 hover:underline">swapstandard@gmail.com</a>.</p>
          </section>

        </div>
      </div>
    </main>
  );
}

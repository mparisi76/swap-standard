import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | SwapStandard",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#F9F8F6] px-4 md:px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-10">

        <header className="border-b-4 border-zinc-900 pb-6">
          <span className="text-label font-black uppercase tracking-[0.3em] text-zinc-500 block mb-2">Legal</span>
          <h1 className="text-header font-black uppercase italic text-zinc-900">Terms of Service</h1>
          <p className="text-body text-zinc-500 mt-2">Last updated: March 2026</p>
        </header>

        <div className="space-y-8 text-body text-zinc-700 leading-relaxed">

          <section className="space-y-3">
            <h2 className="text-body font-black uppercase text-zinc-900">1. What SwapStandard Is</h2>
            <p>SwapStandard is a community barter registry. It allows members to post listings of goods, skills, and services they are willing to exchange with others in their local area. No money changes hands through SwapStandard. We are not a marketplace, broker, or party to any exchange between members.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-body font-black uppercase text-zinc-900">2. Eligibility</h2>
            <p>You must be at least 18 years old to create an account. By registering, you represent that you are legally able to enter into a binding agreement and that all information you provide is accurate.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-body font-black uppercase text-zinc-900">3. Member Responsibilities</h2>
            <p>You are solely responsible for the listings you post and any exchanges you initiate. You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Post false, misleading, or fraudulent listings</li>
              <li>Offer illegal goods, controlled substances, or stolen property</li>
              <li>Harass, threaten, or abuse other members</li>
              <li>Use the platform for commercial resale or spam</li>
              <li>Attempt to circumvent the platform's moderation systems</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-body font-black uppercase text-zinc-900">4. No Guarantee of Exchange</h2>
            <p>SwapStandard facilitates connections between members but does not guarantee that any exchange will be completed, that listings are accurate, or that members will fulfill their commitments. All exchanges are conducted at your own risk. We strongly encourage meeting in public places and using good judgment.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-body font-black uppercase text-zinc-900">5. Content Ownership</h2>
            <p>You retain ownership of content you post. By posting, you grant SwapStandard a non-exclusive, royalty-free license to display your content on the platform. You are responsible for ensuring you have the right to share any content you post, including photos.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-body font-black uppercase text-zinc-900">6. Account Termination</h2>
            <p>We reserve the right to suspend or terminate any account that violates these terms or that we determine, in our sole discretion, is harmful to the community. You may delete your account at any time by contacting us.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-body font-black uppercase text-zinc-900">7. Limitation of Liability</h2>
            <p>SwapStandard is provided "as is" without warranties of any kind. To the fullest extent permitted by law, SwapStandard and its operators shall not be liable for any damages arising from your use of the platform, including disputes between members, failed exchanges, or loss of data.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-body font-black uppercase text-zinc-900">8. Changes to These Terms</h2>
            <p>We may update these terms from time to time. Continued use of the platform after changes are posted constitutes your acceptance of the updated terms.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-body font-black uppercase text-zinc-900">9. Contact</h2>
            <p>Questions about these terms? Email us at <a href="mailto:swapstandard@gmail.com" className="text-emerald-700 hover:underline">swapstandard@gmail.com</a>.</p>
          </section>

        </div>
      </div>
    </main>
  );
}

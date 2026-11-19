import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — NC State Icepack Hockey",
  description: "Privacy policy and SMS messaging compliance for the Ice Hockey Club at NC State, Inc.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-[#222222]">
      {/* Top Header */}
      <header className="bg-[#e10600] text-white px-4 sm:px-8 py-3.5 border-b-4 border-[#b00400] shadow-md">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img
              src="/brand/nc-state-hockey-header-logo.png"
              alt="NC State Hockey Logo"
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </Link>
          <Link
            href="/"
            className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white hover:text-white/80"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[900px] w-full mx-auto px-4 sm:px-8 py-10">
        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-10 shadow-sm space-y-6">
          <div className="border-b border-stone-200 pb-4">
            <span className="text-xs font-bold tracking-widest uppercase text-[#e10600]">
              LEGAL & REGULATORY COMPLIANCE
            </span>
            <h1 className="font-heading text-3xl sm:text-5xl text-[#222222] mt-1">
              PRIVACY POLICY
            </h1>
            <p className="text-xs text-stone-500 font-mono mt-1">
              Effective Date: November 16, 2026 · Ice Hockey Club at NC State, Inc. (501(c)(3) Nonprofit · EIN: 46-4129861)
            </p>
          </div>

          <section className="space-y-3 text-sm sm:text-base text-stone-700 leading-relaxed font-questrial">
            <p>
              The Ice Hockey Club at NC State, Inc. (&ldquo;NC State Icepack&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is an independent student-run 501(c)(3) nonprofit organization. We are committed to protecting the privacy of our fans, donors, alumni, and website visitors.
            </p>

            <h2 className="font-heading text-xl text-[#222222] pt-3">1. Information We Collect</h2>
            <p>
              When you interact with our website (icepackhockey.com) or subscribe to our gameday updates, we may collect personal information that you voluntarily provide to us, including:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Contact information such as your name, email address, and mobile phone number.</li>
              <li>Donation and ticket purchase details (processed securely via our third-party ticketing and payment partners; we do not store full payment card details).</li>
              <li>Opt-in preferences for communications and mobile text notifications.</li>
            </ul>

            <h2 className="font-heading text-xl text-[#222222] pt-3">2. Mobile Phone Numbers &amp; SMS Messaging (10DLC Compliance)</h2>
            <div className="bg-stone-50 border-l-4 border-[#e10600] p-4 rounded-r-lg space-y-2">
              <p className="font-bold text-stone-900">
                Carrier &amp; Privacy Protection Clause:
              </p>
              <p className="text-stone-800">
                <strong>No mobile information will be shared with third parties or affiliates for marketing or promotional purposes.</strong> All the above categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties under any circumstances.
              </p>
            </div>
            <p>
              If you opt in to receive text alerts (such as live gameday scores, period updates, or club announcements), your phone number will only be used to deliver the specific alerts you requested from the NC State Icepack.
            </p>

            <h2 className="font-heading text-xl text-[#222222] pt-3">3. How to Opt Out of Text Messages</h2>
            <p>
              You can cancel the SMS service at any time. Simply text <strong>STOP</strong> to our number <strong>(984) 333-8041</strong>. After texting STOP, you will receive a single confirmation message that you have been unsubscribed, and no further messages will be sent to your mobile phone unless you re-subscribe by texting <strong>START</strong>.
            </p>

            <h2 className="font-heading text-xl text-[#222222] pt-3">4. Customer Support</h2>
            <p>
              For questions regarding our messaging program or privacy practices, you can text <strong>HELP</strong> to <strong>(984) 333-8041</strong> or email our administrative staff directly at{" "}
              <a href="mailto:Admin@icepackhockey.com" className="text-[#e10600] underline">
                Admin@icepackhockey.com
              </a>.
            </p>

            <h2 className="font-heading text-xl text-[#222222] pt-3">5. Data Security</h2>
            <p>
              We implement industry-standard physical, administrative, and technical safeguards to protect your personal information against unauthorized access, loss, or misuse.
            </p>

            <h2 className="font-heading text-xl text-[#222222] pt-3">6. Organization Contact</h2>
            <p>
              Ice Hockey Club at NC State, Inc.<br />
              Attn: Compliance &amp; Communications<br />
              EIN: 46-4129861<br />
              Email:{" "}
              <a href="mailto:Admin@icepackhockey.com" className="text-[#e10600] underline">
                Admin@icepackhockey.com
              </a><br />
              Home Rink: Wake Competition Center, 111 Competition Center Dr, Morrisville, NC 27560
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#222222] text-white/70 py-6 text-center text-xs font-questrial border-t border-stone-800">
        <p>© 2026 Ice Hockey Club at NC State, Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms and Conditions — NC State Icepack Hockey",
  description: "Terms and conditions for NC State Icepack Hockey text alerts and digital services.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-[#222222]">
      {/* Top Header */}
      <header className="bg-[#e10600] text-white px-4 sm:px-8 py-3.5 border-b-4 border-[#b00400] shadow-md">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/07cdeb598c1716ddf52f5438f9484da2.png"
              alt="NC State Icepack Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
            />
            <div>
              <span className="font-heading text-2xl sm:text-3xl leading-none text-white block">
                ICEPACK HOCKEY
              </span>
              <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-white/90">
                NC STATE · ACHA DIVISION I
              </span>
            </div>
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
              SMS MESSAGING &amp; SERVICE TERMS
            </span>
            <h1 className="font-heading text-3xl sm:text-5xl text-[#222222] mt-1">
              TERMS AND CONDITIONS
            </h1>
            <p className="text-xs text-stone-500 font-mono mt-1">
              Last Updated: November 16, 2026 · Ice Hockey Club at NC State, Inc. (EIN: 46-4129861)
            </p>
          </div>

          <section className="space-y-4 text-sm sm:text-base text-stone-700 leading-relaxed font-questrial">
            <p>
              Welcome to the NC State Icepack Hockey mobile text messaging service (&ldquo;Service&rdquo;), operated by the Ice Hockey Club at NC State, Inc. (&ldquo;NC State Icepack&rdquo;, &ldquo;we&rdquo;, or &ldquo;us&rdquo;). By subscribing to our SMS notifications, you agree to these Terms and Conditions.
            </p>

            <h2 className="font-heading text-xl text-[#222222] pt-2">1. Program Description</h2>
            <p>
              Subscribers to the NC State Icepack text messaging program receive automated and recurring informational alerts, including live in-game score updates, period recaps, gameday broadcast links, schedule updates, and official club announcements.
            </p>

            <h2 className="font-heading text-xl text-[#222222] pt-2">2. Message Frequency</h2>
            <p>
              Message frequency varies depending on game schedules and team activity. During live games, subscribers may receive 2–5 updates per match (period summaries and final scores). You will not receive unrequested commercial marketing or third-party advertisements.
            </p>

            <h2 className="font-heading text-xl text-[#222222] pt-2">3. Cost, Message &amp; Data Rates</h2>
            <p>
              There is no fee charged by NC State Icepack to receive text alerts. However, <strong>standard message and data rates may apply</strong> based on your mobile service carrier plan.
            </p>

            <h2 className="font-heading text-xl text-[#222222] pt-2">4. How to Opt Out (Cancellation)</h2>
            <p>
              You can cancel the SMS service at any time. Text <strong>STOP</strong> to <strong>(984) 333-8041</strong>. After sending STOP, you will receive one final confirmation message stating that you have been unsubscribed. No further messages will be sent unless you re-subscribe by texting START.
            </p>

            <h2 className="font-heading text-xl text-[#222222] pt-2">5. How to Get Help</h2>
            <p>
              If you experience any issues or need assistance, text <strong>HELP</strong> to <strong>(984) 333-8041</strong>, or contact us directly via email at{" "}
              <a href="mailto:Admin@icepackhockey.com" className="text-[#e10600] underline">
                Admin@icepackhockey.com
              </a>.
            </p>

            <h2 className="font-heading text-xl text-[#222222] pt-2">6. Supported Carriers &amp; Liability</h2>
            <p>
              Major supported mobile carriers include AT&amp;T, T-Mobile, Verizon, Sprint, and regional affiliates. Carriers are not liable for delayed or undelivered messages. Delivery is subject to effective transmission from your mobile network operator.
            </p>

            <h2 className="font-heading text-xl text-[#222222] pt-2">7. Privacy Policy</h2>
            <p>
              Your privacy is extremely important to us. Please review our{" "}
              <Link href="/privacy" className="text-[#e10600] underline font-bold">
                Privacy Policy
              </Link>{" "}
              to understand how we handle your personal information. We strictly pledge that <strong>no mobile numbers or opt-in consent will ever be sold, rented, or shared with third parties or affiliates</strong>.
            </p>

            <h2 className="font-heading text-xl text-[#222222] pt-2">8. Contact Information</h2>
            <p>
              Ice Hockey Club at NC State, Inc.<br />
              Email:{" "}
              <a href="mailto:Admin@icepackhockey.com" className="text-[#e10600] underline">
                Admin@icepackhockey.com
              </a><br />
              Wake Competition Center, 111 Competition Center Dr, Morrisville, NC 27560
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

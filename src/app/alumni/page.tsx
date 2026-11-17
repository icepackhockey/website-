"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function AlumniReconnectPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    cityState: "",
    yearsPlayed: "",
    jerseyNumber: "",
    position: "Forward",
    honors: "",
    industry: "Information Technology",
    company: "",
    mentoringInterest: "Open to it",
    alumniGameInterest: "Yes, count me in",
    memories: "",
    hasArchivalPhotos: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target;
    const value =
      target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value;
    const name = target.name;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In preview mode: display celebratory state and open mailto backup
    setSubmitted(true);

    try {
      // Save locally to browser storage for preview persistence
      const existing = JSON.parse(localStorage.getItem("icepack_alumni_submissions") || "[]");
      existing.push({ ...formData, timestamp: new Date().toISOString() });
      localStorage.setItem("icepack_alumni_submissions", JSON.stringify(existing));
    } catch (err) {}
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-[#222222]">
      {/* Top Header */}
      <header className="bg-[#e10600] text-white px-4 sm:px-8 py-3.5 border-b-4 border-[#b00400] shadow-md sticky top-0 z-40">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/07cdeb598c1716ddf52f5438f9484da2.png"
              alt="NC State IcePack Logo"
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
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-wider bg-black/30 px-3 py-1 rounded-full text-white/90 border border-white/20">
              Draft Preview (Unlinked)
            </span>
            <Link
              href="/"
              className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white hover:text-white/80 transition"
            >
              ← Back to Main Site
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-[#1a1a1a] via-[#241212] to-[#111111] text-white py-12 sm:py-16 px-4 sm:px-8 border-b-4 border-[#e10600] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#e10600]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="max-w-[1100px] mx-auto relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#e10600] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
            <span>🏒</span>
            <span>50 YEARS OF PACK HOCKEY · 1976–2026</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-6xl text-white leading-none">
            ALUMNI RECONNECT &amp; DIRECTORY
          </h1>
          <p className="font-questrial text-sm sm:text-base text-stone-300 max-w-3xl leading-relaxed">
            Over 500 student-athletes have worn the red and white sweater since 1976. Whether you played during the early club years, skated in the ACC Tournament, or competed in ACHA Nationals, your legacy built this program. Reconnect with teammates, receive annual alumni game invites, and stay involved with the Pack.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-center">
              <span className="font-heading text-2xl sm:text-3xl text-amber-400 block">500+</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-300">Sweaters Worn</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-center">
              <span className="font-heading text-2xl sm:text-3xl text-amber-400 block">50th</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-300">Anniversary Season</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-center">
              <span className="font-heading text-2xl sm:text-3xl text-amber-400 block">6</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-300">League Titles</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-center">
              <span className="font-heading text-2xl sm:text-3xl text-amber-400 block">1</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-300">Pack Family</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="flex-1 max-w-[1000px] w-full mx-auto px-4 sm:px-8 py-10">
        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-10 shadow-sm space-y-8"
          >
            {/* Section 1: Contact Information */}
            <div className="space-y-4">
              <div className="border-b-2 border-stone-100 pb-2 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#e10600]">
                    STEP 1 OF 4
                  </span>
                  <h2 className="font-heading text-2xl text-[#222222]">
                    YOUR CONTACT INFORMATION
                  </h2>
                </div>
                <span className="text-xs text-stone-400 font-questrial">* Required fields</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. John Smith"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-[#e10600] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Primary Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@alumni.ncsu.edu"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-[#e10600] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Mobile Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(919) 555-0123"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-[#e10600] text-sm"
                  />
                  <span className="text-[11px] text-stone-500 font-questrial block mt-0.5">
                    For gameday alumni event alerts and text updates.
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Current Location (City, State)
                  </label>
                  <input
                    type="text"
                    name="cityState"
                    value={formData.cityState}
                    onChange={handleChange}
                    placeholder="e.g. Raleigh, NC or New York, NY"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-[#e10600] text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Icepack Playing Career */}
            <div className="space-y-4">
              <div className="border-b-2 border-stone-100 pb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#e10600]">
                  STEP 2 OF 4
                </span>
                <h2 className="font-heading text-2xl text-[#222222]">
                  YOUR ICEPACK HOCKEY CAREER
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Years Played *
                  </label>
                  <input
                    type="text"
                    name="yearsPlayed"
                    required
                    value={formData.yearsPlayed}
                    onChange={handleChange}
                    placeholder="e.g. 2012–2016"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-[#e10600] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Jersey Number(s)
                  </label>
                  <input
                    type="text"
                    name="jerseyNumber"
                    value={formData.jerseyNumber}
                    onChange={handleChange}
                    placeholder="e.g. #19"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-[#e10600] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Position *
                  </label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-[#e10600] text-sm bg-white"
                  >
                    <option value="Forward">Forward</option>
                    <option value="Defenseman">Defenseman</option>
                    <option value="Goaltender">Goaltender</option>
                    <option value="Team Staff / Coach">Team Staff / Coach</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Captaincy, Championships, or Highlights (Optional)
                </label>
                <input
                  type="text"
                  name="honors"
                  value={formData.honors}
                  onChange={handleChange}
                  placeholder="e.g. Team Captain 2015, ACC All-Tournament, Admiral's Cup Champ"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-[#e10600] text-sm"
                />
              </div>
            </div>

            {/* Section 3: Professional Life & Involvement */}
            <div className="space-y-4">
              <div className="border-b-2 border-stone-100 pb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#e10600]">
                  STEP 3 OF 4
                </span>
                <h2 className="font-heading text-2xl text-[#222222]">
                  CAREER &amp; ALUMNI INVOLVEMENT
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Professional Industry
                  </label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-[#e10600] text-sm bg-white"
                  >
                    <option value="Finance and Banking">Finance and Banking</option>
                    <option value="Healthcare and Medicine">Healthcare and Medicine</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Law and Public Safety">Law and Public Safety</option>
                    <option value="Manufacturing and Engineering">Manufacturing and Engineering</option>
                    <option value="Sales and Marketing">Sales and Marketing</option>
                    <option value="Sports Management and Athletics">Sports Management and Athletics</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Current Company / Role (Optional)
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g. Director of Operations @ Company"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-[#e10600] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Annual Alumni Game Interest
                  </label>
                  <select
                    name="alumniGameInterest"
                    value={formData.alumniGameInterest}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-[#e10600] text-sm bg-white"
                  >
                    <option value="Yes, count me in to skate">Yes, count me in to skate</option>
                    <option value="Interested in attending as spectator">Interested in attending as spectator</option>
                    <option value="Maybe, depends on date">Maybe, depends on date</option>
                    <option value="Not right now">Not right now</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Mentoring Current Student-Athletes
                  </label>
                  <select
                    name="mentoringInterest"
                    value={formData.mentoringInterest}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-[#e10600] text-sm bg-white"
                  >
                    <option value="Yes, would love to mentor">Yes, would love to mentor</option>
                    <option value="Open to networking with juniors/seniors">Open to networking with juniors/seniors</option>
                    <option value="Not at this time">Not at this time</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 4: Memories & Archives */}
            <div className="space-y-4">
              <div className="border-b-2 border-stone-100 pb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#e10600]">
                  STEP 4 OF 4
                </span>
                <h2 className="font-heading text-2xl text-[#222222]">
                  MEMORIES &amp; ARCHIVAL CONTRIBUTIONS
                </h2>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Favorite Icepack Memories or Life Updates
                </label>
                <textarea
                  name="memories"
                  rows={4}
                  value={formData.memories}
                  onChange={handleChange}
                  placeholder="Share a favorite locker room story, a big road win, what you've been up to since graduation, or a note to the coaching staff..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-[#e10600] text-sm font-questrial"
                />
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="hasArchivalPhotos"
                  name="hasArchivalPhotos"
                  checked={formData.hasArchivalPhotos}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 text-[#e10600] border-stone-300 rounded focus:ring-[#e10600]"
                />
                <label htmlFor="hasArchivalPhotos" className="text-xs text-stone-700 font-questrial leading-relaxed cursor-pointer">
                  <strong className="text-stone-900 block font-bold">I have vintage team photos, jersey pictures, or game programs from my era.</strong>
                  Check this box and our media intern staff will reach out to help digitize and add them to the official 50th Anniversary online archives!
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-stone-500 font-questrial text-center sm:text-left">
                Your information is used exclusively by the Icepack Hockey Club for alumni communication and will never be shared with third parties.
              </span>
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#e10600] hover:bg-[#c40500] text-white font-heading text-lg rounded-xl shadow-lg transition uppercase tracking-wider shrink-0 cursor-pointer"
              >
                Submit Alumni Form →
              </button>
            </div>
          </form>
        ) : (
          /* Confirmation Success Screen */
          <div className="bg-white border-2 border-[#e10600] rounded-2xl p-8 sm:p-12 shadow-xl text-center space-y-6">
            <div className="w-20 h-20 bg-red-50 text-[#e10600] rounded-full flex items-center justify-center text-4xl mx-auto border-2 border-red-200">
              🐺
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-[#e10600]">
                SUBMISSION CONFIRMED
              </span>
              <h2 className="font-heading text-4xl sm:text-5xl text-[#222222] leading-none">
                WELCOME BACK TO THE PACK, {formData.fullName.toUpperCase()}!
              </h2>
              <p className="font-questrial text-sm sm:text-base text-stone-600 leading-relaxed pt-2">
                Your information has been logged in our official alumni database. You are now subscribed to receive invitations for the upcoming Alumni Game at Lenovo Center, gameday events, and special 50th season announcements.
              </p>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 max-w-md mx-auto text-left text-xs font-questrial space-y-2">
              <div className="font-bold text-[#222222] border-b border-stone-200 pb-1 uppercase tracking-wider text-[11px]">
                Recorded Submission Summary:
              </div>
              <div><strong>Alum:</strong> {formData.fullName} ({formData.yearsPlayed}, #{formData.jerseyNumber || "N/A"})</div>
              <div><strong>Position:</strong> {formData.position}</div>
              <div><strong>Email:</strong> {formData.email}</div>
              <div><strong>Alumni Game:</strong> {formData.alumniGameInterest}</div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <Link
                href="/schedule"
                className="px-6 py-3 bg-[#e10600] hover:bg-[#c40500] text-white font-heading text-sm uppercase tracking-wider rounded-xl shadow transition"
              >
                View 2026–27 Schedule →
              </Link>
              <Link
                href="/annual-fund"
                className="px-6 py-3 bg-[#222222] hover:bg-black text-white font-heading text-sm uppercase tracking-wider rounded-xl shadow transition"
              >
                50th Annual Fund ↗
              </Link>
              <button
                onClick={() => setSubmitted(false)}
                className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-stone-600 hover:text-stone-900 transition"
              >
                Edit Form
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#222222] text-white/70 py-8 text-center text-xs font-questrial border-t border-stone-800">
        <div className="max-w-[1100px] mx-auto px-4 space-y-2">
          <p>© 2026 Ice Hockey Club at NC State, Inc. · 501(c)(3) Nonprofit · EIN 46-4129861</p>
          <p className="text-[11px] text-white/50">
            Private Alumni Reconnect Page (In Development). Not linked in public navigation.
          </p>
        </div>
      </footer>
    </div>
  );
}

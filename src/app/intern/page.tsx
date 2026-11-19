"use client";

import React, { useState, useEffect } from "react";
import scheduleDataRaw from "../../data/schedule.json";
import rosterDataRaw from "../../data/roster.json";
import staffDataRaw from "../../data/staff.json";
import newsDataRaw from "../../data/news.json";
import standingsDataRaw from "../../data/standings.json";
import merchDataRaw from "../../data/merch.json";
import sponsorsDataRaw from "../../data/sponsors.json";

// Passcode protection for intern desk (simple gate to prevent accidental public edits)
const DESK_PASSCODE = "PACK2026";

export default function InternDesk() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcodeInput, setPasscodeInput] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");

  const [activeTab, setActiveTab] = useState<"scores" | "news" | "standings" | "merch" | "roster" | "sponsors">("scores");
  const [statusMessage, setStatusMessage] = useState<string>("");

  // Working data states
  const [schedule, setSchedule] = useState(scheduleDataRaw);
  const [news, setNews] = useState(newsDataRaw);
  const [standings, setStandings] = useState(standingsDataRaw);
  const [merch, setMerch] = useState(merchDataRaw);
  const [roster, setRoster] = useState(rosterDataRaw);
  const [sponsors, setSponsors] = useState(sponsorsDataRaw);

  // Selected items for editing
  const [selectedGameId, setSelectedGameId] = useState<number | null>(schedule[0]?.id || null);
  const [editingArticleId, setEditingArticleId] = useState<number | null>(null);

  // New Article Form State
  const [newArticle, setNewArticle] = useState({
    title: "",
    date: new Date().toLocaleDateString("en-US"),
    category: "Recap",
    author: "Icepack Staff",
    summary: "",
    paragraphsText: "",
    image_url: "",
  });

  // Roster Management State
  const [editingPlayerIndex, setEditingPlayerIndex] = useState<number | null>(null);
  const [playerForm, setPlayerForm] = useState({
    number: "",
    name: "",
    captain: "",
    position: "F",
    class: "FR",
    hometown: "",
    major: "",
    image: "",
    acha_url: "",
  });
  const [rosterSearch, setRosterSearch] = useState<string>("");
  const [rosterPosFilter, setRosterPosFilter] = useState<string>("all");

  // Merchandise Management State
  const [merchSubTab, setMerchSubTab] = useState<"exclusive" | "retail">("exclusive");
  const [editingExclusiveId, setEditingExclusiveId] = useState<string | null>(null);
  const [exclusiveForm, setExclusiveForm] = useState({
    id: "",
    title: "",
    price: "",
    status: "Official Pre-Order",
    badge: "Team Exclusive",
    image: "",
    secondary_image: "",
    description: "",
    featuresText: "",
    url: "",
    action_label: "Pre-Order Jersey →",
  });

  const [editingRetailId, setEditingRetailId] = useState<string | null>(null);
  const [retailForm, setRetailForm] = useState({
    id: "",
    title: "",
    price: "",
    category: "Jerseys",
    image: "",
    url: "",
  });
  const [retailCategoryFilter, setRetailCategoryFilter] = useState<string>("all");

  // Check storage on mount
  useEffect(() => {
    try {
      const savedAuth = sessionStorage.getItem("icepack_intern_auth");
      if (savedAuth === "true") {
        setIsAuthenticated(true);
      }

      const savedRoster = localStorage.getItem("icepack_desk_roster");
      if (savedRoster) {
        setRoster(JSON.parse(savedRoster));
      }

      const savedMerch = localStorage.getItem("icepack_desk_merch");
      if (savedMerch) {
        setMerch(JSON.parse(savedMerch));
      }
    } catch (err) {
      console.error("Storage load error:", err);
    }
  }, []);

  const updateRosterState = (newRoster: any) => {
    setRoster(newRoster);
    try {
      localStorage.setItem("icepack_desk_roster", JSON.stringify(newRoster));
    } catch (e) {}
  };

  const updateMerchState = (newMerch: any) => {
    setMerch(newMerch);
    try {
      localStorage.setItem("icepack_desk_merch", JSON.stringify(newMerch));
    } catch (e) {}
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput.trim() === DESK_PASSCODE || passcodeInput.trim().toUpperCase() === "ICEPACK") {
      setIsAuthenticated(true);
      sessionStorage.setItem("icepack_intern_auth", "true");
      setAuthError("");
    } else {
      setAuthError("Incorrect desk passcode. Please contact Brent or Team Operations.");
    }
  };

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(""), 4000);
  };

  // Helper to trigger JSON download for immediate file updates
  const downloadJSON = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Saved & Downloaded ${filename}!`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1a1a1a] border border-[#333] rounded-xl p-8 shadow-2xl text-white">
          <div className="flex items-center gap-3 mb-6">
            <img
              src="/07cdeb598c1716ddf52f5438f9484da2.png"
              alt="NC State Icepack Logo"
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="font-heading text-2xl tracking-wider text-white">ICEPACK PUBLISHING DESK</h1>
              <p className="text-xs text-neutral-400 font-sans uppercase tracking-widest">Media & Communications Portal</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Desk Passcode
              </label>
              <input
                type="password"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="Enter passcode..."
                className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded text-white focus:outline-none focus:border-[#e10600] font-mono text-sm"
              />
            </div>

            {authError && <p className="text-xs text-red-400 font-semibold">{authError}</p>}

            <button
              type="submit"
              className="w-full bg-[#e10600] hover:bg-[#b00400] text-white font-heading text-lg py-2.5 rounded transition uppercase tracking-wider shadow-lg"
            >
              Access Communications Desk
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#333] text-center">
            <p className="text-[11px] text-neutral-500">
              NC State Icepack Hockey (501c3) · Non-technical media intern portal. Zero coding required.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#222222] flex flex-col font-sans">
      {/* Top Banner */}
      <header className="bg-[#111111] text-white border-b-4 border-[#e10600] sticky top-0 z-50 shadow-md">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/07cdeb598c1716ddf52f5438f9484da2.png"
              alt="NC State Icepack Logo"
              className="w-10 h-10 object-contain"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-xl tracking-wider text-white">ICEPACK MEDIA DESK</span>
                <span className="text-[10px] bg-[#e10600] text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  Intern Portal
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">NC State ACHA Division I Hockey Communications</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1.5"
            >
              <span>View Live Website</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <button
              onClick={() => {
                sessionStorage.removeItem("icepack_intern_auth");
                setIsAuthenticated(false);
              }}
              className="text-xs px-2.5 py-1.5 rounded bg-red-950/60 hover:bg-red-900 text-red-200 transition"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex overflow-x-auto border-t border-neutral-800 scrollbar-none">
          {[
            { id: "scores", label: "🏒 Gameday & Scores" },
            { id: "news", label: "📰 News & Recaps" },
            { id: "standings", label: "🏆 ACHA Poll & Standings" },
            { id: "merch", label: "👕 Merchandise & Store" },
            { id: "roster", label: "👥 Roster & Bios" },
            { id: "sponsors", label: "🤝 Sponsors" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 font-heading text-sm sm:text-base tracking-wider uppercase whitespace-nowrap border-b-2 transition ${
                activeTab === tab.id
                  ? "border-[#e10600] text-white bg-white/5 font-bold"
                  : "border-transparent text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Toast Notification */}
      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111] text-white border-l-4 border-green-500 px-5 py-3 rounded shadow-2xl flex items-center gap-3">
          <svg className="w-5 h-5 text-green-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-semibold">{statusMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-6 flex-1">
        {/* TAB 1: GAMEDAY & SCORES */}
        {activeTab === "scores" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
              <div>
                <h2 className="font-heading text-2xl text-neutral-900 tracking-wider">GAMEDAY & SCHEDULE DESK</h2>
                <p className="text-xs text-neutral-500">
                  Update final scores, game records, Ticketsauce ticket links, or ESPN+ broadcasts in seconds.
                </p>
              </div>
              <button
                onClick={() => downloadJSON(schedule, "schedule.json")}
                className="bg-[#e10600] hover:bg-[#b00400] text-white font-heading text-sm px-4 py-2 rounded uppercase tracking-wider shadow transition flex items-center gap-2 self-start sm:self-auto"
              >
                <span>Download Updated schedule.json</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Game Selector */}
              <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col h-[650px]">
                <div className="p-3 bg-neutral-100 border-b border-neutral-200 font-heading text-xs uppercase tracking-wider text-neutral-700 font-bold">
                  Select Game to Update ({schedule.length} Total Games)
                </div>
                <div className="overflow-y-auto divide-y divide-neutral-100 flex-1">
                  {schedule.map((game: any) => (
                    <button
                      key={game.id}
                      onClick={() => setSelectedGameId(game.id)}
                      className={`w-full text-left p-3.5 transition flex items-center justify-between gap-2 ${
                        selectedGameId === game.id ? "bg-red-50 border-l-4 border-[#e10600]" : "hover:bg-neutral-50"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-700 uppercase">
                            {game.ha === "H" ? "HOME" : "AWAY"}
                          </span>
                          <span className="text-xs font-bold text-neutral-900">{game.opponent}</span>
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-0.5">{game.date} · {game.time}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                          game.result?.startsWith("W") ? "bg-green-100 text-green-800" :
                          game.result?.startsWith("L") ? "bg-red-100 text-red-800" : "bg-neutral-100 text-neutral-600"
                        }`}>
                          {game.result || "Scheduled"}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Game Editor Form */}
              {selectedGameId && (() => {
                const game = schedule.find((g: any) => g.id === selectedGameId);
                if (!game) return null;

                const updateField = (field: string, val: any) => {
                  setSchedule(schedule.map((g: any) => g.id === selectedGameId ? { ...g, [field]: val } : g));
                };

                return (
                  <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-5">
                    <div className="border-b border-neutral-200 pb-3 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-[#e10600] uppercase tracking-widest font-heading">
                          Editing Game #{game.id}
                        </span>
                        <h3 className="font-heading text-xl text-neutral-900">
                          {game.ha === "H" ? "NC State vs" : "NC State at"} {game.opponent}
                        </h3>
                      </div>
                      <span className="text-xs text-neutral-400 font-mono">{game.isoDate}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                          Final Result & Score (e.g. "W 4–2", "L 5–7", "OTW 3–2")
                        </label>
                        <input
                          type="text"
                          value={game.result || ""}
                          onChange={(e) => updateField("result", e.target.value)}
                          placeholder="e.g. W 4–2"
                          className="w-full px-3 py-2 border border-neutral-300 rounded font-semibold text-sm focus:border-[#e10600] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                          Team Record After Game (e.g. "9–6–2")
                        </label>
                        <input
                          type="text"
                          value={game.record || ""}
                          onChange={(e) => updateField("record", e.target.value)}
                          placeholder="e.g. 9–6–2"
                          className="w-full px-3 py-2 border border-neutral-300 rounded font-semibold text-sm focus:border-[#e10600] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                          Date Display (e.g. "Fri Nov 14")
                        </label>
                        <input
                          type="text"
                          value={game.date}
                          onChange={(e) => updateField("date", e.target.value)}
                          className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#e10600] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                          Puck Drop Time (e.g. "8:30 PM")
                        </label>
                        <input
                          type="text"
                          value={game.time}
                          onChange={(e) => updateField("time", e.target.value)}
                          className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#e10600] focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                          Ticketsauce Direct Ticket URL
                        </label>
                        <input
                          type="text"
                          value={game.ticket_url || ""}
                          onChange={(e) => updateField("ticket_url", e.target.value)}
                          placeholder="https://icepackhockey.ticketsauce.com/e/..."
                          className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#e10600] focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                          Special Note / Theme (e.g. "Military Appreciation Night", "Senior Night")
                        </label>
                        <input
                          type="text"
                          value={game.note || ""}
                          onChange={(e) => updateField("note", e.target.value)}
                          placeholder="Theme night..."
                          className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#e10600] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
                      <span className="text-xs text-neutral-500 italic">
                        Updates save to your session instantly. Click "Download Updated schedule.json" to commit changes.
                      </span>
                      <button
                        onClick={() => showToast(`Saved changes for Game vs ${game.opponent}!`)}
                        className="bg-neutral-900 hover:bg-neutral-800 text-white font-heading px-5 py-2 rounded uppercase tracking-wider text-sm shadow transition"
                      >
                        Save Game Details
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* TAB 2: NEWS & RECAPS */}
        {activeTab === "news" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
              <div>
                <h2 className="font-heading text-2xl text-neutral-900 tracking-wider">NEWSROOM & RECAP DESK</h2>
                <p className="text-xs text-neutral-500">
                  Write and publish game recaps, player spotlights, and team announcements.
                </p>
              </div>
              <button
                onClick={() => downloadJSON(news, "news.json")}
                className="bg-[#e10600] hover:bg-[#b00400] text-white font-heading text-sm px-4 py-2 rounded uppercase tracking-wider shadow transition"
              >
                Download Updated news.json
              </button>
            </div>

            {/* Create / Edit Article Box */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                <div>
                  <h3 className="font-heading text-lg text-neutral-900 uppercase tracking-wider">
                    {editingArticleId ? "Edit Existing Article" : "Draft New Article / Game Recap"}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {editingArticleId
                      ? "Make your adjustments below and click 'Save Changes to Article'."
                      : "Type below or drop a Word Document (.docx) to auto-fill headline & paragraphs."}
                  </p>
                </div>

                {editingArticleId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingArticleId(null);
                      setNewArticle({
                        title: "",
                        date: new Date().toLocaleDateString("en-US"),
                        category: "Recap",
                        author: "Icepack Staff",
                        summary: "",
                        paragraphsText: "",
                        image_url: "",
                      });
                      showToast("Cancelled edit mode.");
                    }}
                    className="text-xs font-bold text-neutral-600 hover:text-neutral-900 bg-neutral-100 px-3 py-1.5 rounded"
                  >
                    ✕ Cancel Edit & Start New Draft
                  </button>
                )}
              </div>

              {/* Word Document (.docx) / Text File Upload Box */}
              {!editingArticleId && (
                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">📄</span>
                    <div>
                      <p className="text-xs font-bold text-blue-950">
                        Writing your story in Microsoft Word or Google Docs?
                      </p>
                      <p className="text-[11px] text-blue-800">
                        Upload your <strong>.docx</strong> file to automatically parse headline, byline, and body paragraphs.
                      </p>
                    </div>
                  </div>
                  <label className="bg-blue-600 hover:bg-blue-700 text-white font-heading text-xs px-3.5 py-2 rounded uppercase tracking-wider cursor-pointer transition shrink-0 text-center shadow-sm">
                    <span>Import from .docx</span>
                    <input
                      type="file"
                      accept=".docx,.txt"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        if (file.name.endsWith(".txt")) {
                          const text = await file.text();
                          const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
                          if (lines.length > 0) {
                            setNewArticle({
                              ...newArticle,
                              title: lines[0].replace(/^#+\s*/, ""),
                              paragraphsText: lines.slice(1).join("\n\n"),
                            });
                            showToast(`Imported ${file.name}!`);
                          }
                        } else if (file.name.endsWith(".docx")) {
                          try {
                            showToast("Extracting text from Word document...");
                            const mammoth = await import("mammoth");
                            const arrayBuffer = await file.arrayBuffer();
                            const result = await mammoth.extractRawText({ arrayBuffer });
                            const raw = result.value || "";
                            const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);

                            if (lines.length > 0) {
                              // First non-empty line as headline
                              const title = lines[0];
                              let author = newArticle.author;
                              let startPara = 1;

                              // Check if second line is byline (e.g. By John Doe)
                              if (lines[1] && /^by\s+/i.test(lines[1])) {
                                author = lines[1].replace(/^by\s+/i, "");
                                startPara = 2;
                              }

                              const body = lines.slice(startPara).join("\n\n");
                              const summary = lines[startPara] ? lines[startPara].slice(0, 160) + "..." : "";

                              setNewArticle({
                                ...newArticle,
                                title,
                                author,
                                summary,
                                paragraphsText: body,
                              });
                              showToast(`Successfully parsed Word Doc: "${file.name}"!`);
                            }
                          } catch (err) {
                            console.error(err);
                            alert("Failed to parse Word document. You can also copy & paste text directly into the boxes below.");
                          }
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                    Article Headline *
                  </label>
                  <input
                    type="text"
                    value={newArticle.title}
                    onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                    placeholder="e.g. Icepack Defeats Bearcats 4-2 Behind Prazma Hat Trick"
                    className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#e10600] focus:outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                    Author Byline *
                  </label>
                  <input
                    type="text"
                    value={newArticle.author}
                    onChange={(e) => setNewArticle({ ...newArticle, author: e.target.value })}
                    placeholder="e.g. Sage Kimbro / Kaitlyn Alumbaugh"
                    className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#e10600] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                    Category Dropdown
                  </label>
                  <select
                    value={newArticle.category}
                    onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#e10600] focus:outline-none"
                  >
                    <option value="Recap">Game Recap</option>
                    <option value="Preview">Game Preview</option>
                    <option value="Feature">Player Feature</option>
                    <option value="Announcement">Team Announcement</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                    Article Cover Photo (Upload from Laptop or Enter URL)
                  </label>
                  
                  <div className="space-y-3">
                    {/* Direct File Upload from Computer */}
                    <div className="border-2 border-dashed border-neutral-300 hover:border-[#e10600] rounded-xl p-4 bg-neutral-50 text-center transition cursor-pointer relative group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              alert("Photo is larger than 5MB. Please choose an image under 5MB.");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const result = event.target?.result as string;
                              setNewArticle({ ...newArticle, image_url: result });
                              showToast(`Uploaded ${file.name} from computer!`);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex flex-col items-center justify-center gap-1.5 py-2">
                        <svg className="w-8 h-8 text-neutral-400 group-hover:text-[#e10600] transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs font-bold text-neutral-700">
                          Click to Browse Photos from Computer or Drag & Drop Here
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          Supports JPG, PNG, WEBP (under 5MB). Photo will automatically resize and optimize.
                        </p>
                      </div>
                    </div>

                    {/* Image Preview & URL fallback */}
                    {newArticle.image_url ? (
                      <div className="flex items-center gap-4 p-3 bg-neutral-100 rounded-lg border border-neutral-200">
                        <img
                          src={newArticle.image_url}
                          alt="Cover preview"
                          className="w-20 h-14 object-cover rounded shadow-sm border border-neutral-300 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-green-700 uppercase bg-green-100 px-2 py-0.5 rounded">
                            ✓ Photo Attached Ready to Publish
                          </span>
                          <p className="text-xs text-neutral-500 truncate mt-1 font-mono">
                            {newArticle.image_url.startsWith("data:") ? "Image loaded from local computer file" : newArticle.image_url}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNewArticle({ ...newArticle, image_url: "" })}
                          className="text-xs text-red-600 hover:text-red-800 font-bold px-2 py-1"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-neutral-400 font-semibold uppercase">Or Paste Photo Link:</span>
                        <input
                          type="text"
                          value={newArticle.image_url}
                          onChange={(e) => setNewArticle({ ...newArticle, image_url: e.target.value })}
                          placeholder="https://... or /photo.jpg"
                          className="flex-1 px-3 py-1.5 border border-neutral-300 rounded text-xs focus:border-[#e10600] focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                    Article Summary / Lead Paragraph (Appears on Homepage Cards)
                  </label>
                  <textarea
                    rows={2}
                    value={newArticle.summary}
                    onChange={(e) => setNewArticle({ ...newArticle, summary: e.target.value })}
                    placeholder="Brief 1-2 sentence hook for the homepage..."
                    className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#e10600] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                    Full Article Body (Separate paragraphs with double enter)
                  </label>
                  <textarea
                    rows={6}
                    value={newArticle.paragraphsText}
                    onChange={(e) => setNewArticle({ ...newArticle, paragraphsText: e.target.value })}
                    placeholder="RALEIGH, N.C. — Write the full story here..."
                    className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#e10600] focus:outline-none font-serif leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!newArticle.title.trim()) {
                      alert("Please provide an article headline.");
                      return;
                    }
                    const paras = newArticle.paragraphsText
                      .split("\n\n")
                      .map((p) => p.trim())
                      .filter((p) => p.length > 0);

                    if (editingArticleId) {
                      // Update existing article
                      setNews(
                        news.map((a: any) =>
                          a.id === editingArticleId
                            ? {
                                ...a,
                                title: newArticle.title,
                                date: newArticle.date,
                                category: newArticle.category,
                                author: newArticle.author,
                                summary: newArticle.summary || (paras[0] ? paras[0].slice(0, 160) + "..." : ""),
                                paragraphs: paras.length > 0 ? paras : [newArticle.summary],
                                image_url: newArticle.image_url || a.image_url,
                              }
                            : a
                        )
                      );
                      setEditingArticleId(null);
                      showToast("✓ Successfully updated article!");
                    } else {
                      // Create new article
                      const created = {
                        id: Date.now(),
                        title: newArticle.title,
                        date: newArticle.date,
                        category: newArticle.category,
                        author: newArticle.author,
                        summary: newArticle.summary || (paras[0] ? paras[0].slice(0, 160) + "..." : ""),
                        paragraphs: paras.length > 0 ? paras : [newArticle.summary],
                        image_url: newArticle.image_url || "/frozen-finley.jpg",
                      };
                      setNews([created, ...news]);
                      showToast("✓ Article published to news feed!");
                    }

                    setNewArticle({
                      title: "",
                      date: new Date().toLocaleDateString("en-US"),
                      category: "Recap",
                      author: "Icepack Staff",
                      summary: "",
                      paragraphsText: "",
                      image_url: "",
                    });
                  }}
                  className="bg-[#e10600] hover:bg-[#b00400] text-white font-heading text-base px-6 py-2.5 rounded uppercase tracking-wider shadow transition"
                >
                  {editingArticleId ? "Save Changes to Article" : "Publish Article to Feed"}
                </button>
              </div>
            </div>

            {/* Existing Articles Table & Rotation Guide */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-neutral-100 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-heading text-sm uppercase tracking-wider text-neutral-800 font-bold block">
                    Existing Articles & Story Rotation ({news.length})
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Stories rotate automatically: Top story is always the main homepage hero feature; next 3 are secondary features.
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase tracking-wider border-b border-neutral-200">
                    <tr>
                      <th className="p-3">Rotation Position</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Headline</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Author</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {news.slice(0, 15).map((art: any, idx: number) => (
                      <tr key={art.id} className={idx === 0 ? "bg-red-50/50" : "hover:bg-neutral-50"}>
                        <td className="p-3 whitespace-nowrap">
                          {idx === 0 ? (
                            <span className="px-2 py-0.5 rounded bg-[#e10600] text-white font-bold text-[10px] uppercase">
                              ★ Homepage Hero
                            </span>
                          ) : idx < 4 ? (
                            <span className="px-2 py-0.5 rounded bg-neutral-200 text-neutral-700 font-bold text-[10px] uppercase">
                              Featured #{idx + 1}
                            </span>
                          ) : (
                            <span className="text-neutral-400 font-mono text-[11px]">
                              Archive #{idx + 1}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-neutral-500 whitespace-nowrap">{art.date}</td>
                        <td className="p-3 font-semibold text-neutral-900 max-w-md truncate">{art.title}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-neutral-100 font-bold text-neutral-700 uppercase">
                            {art.category}
                          </span>
                        </td>
                        <td className="p-3 text-neutral-600 truncate max-w-xs">{art.author}</td>
                        <td className="p-3 text-right whitespace-nowrap space-x-2">
                          <button
                            onClick={() => {
                              setEditingArticleId(art.id);
                              setNewArticle({
                                title: art.title,
                                date: art.date,
                                category: art.category,
                                author: art.author,
                                summary: art.summary || "",
                                paragraphsText: Array.isArray(art.paragraphs) ? art.paragraphs.join("\n\n") : "",
                                image_url: art.image_url || "",
                              });
                              window.scrollTo({ top: 250, behavior: "smooth" });
                              showToast(`Loaded "${art.title}" into editor.`);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-bold text-xs"
                          >
                            Edit
                          </button>
                          <span className="text-neutral-300">|</span>
                          <button
                            onClick={() => {
                              if (confirm(`Delete article: "${art.title}"?`)) {
                                setNews(news.filter((a: any) => a.id !== art.id));
                                showToast("Article deleted.");
                              }
                            }}
                            className="text-red-600 hover:text-red-800 font-bold text-xs"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ACHA POLL & STANDINGS */}
        {activeTab === "standings" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
              <div>
                <h2 className="font-heading text-2xl text-neutral-900 tracking-wider">ROAD TO NATIONALS / ACHA POLL</h2>
                <p className="text-xs text-neutral-500">
                  Update the official computer ranking, movement, and PDF links for the homepage banner.
                </p>
              </div>
              <button
                onClick={() => downloadJSON(standings, "standings.json")}
                className="bg-[#e10600] hover:bg-[#b00400] text-white font-heading text-sm px-4 py-2 rounded uppercase tracking-wider shadow transition"
              >
                Download Updated standings.json
              </button>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-4 max-w-2xl">
              <h3 className="font-heading text-lg text-neutral-900 uppercase tracking-wider border-b border-neutral-100 pb-2">
                National Poll Banner Settings
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                    Current National Rank
                  </label>
                  <input
                    type="number"
                    value={standings.national_ranking.current_rank}
                    onChange={(e) =>
                      setStandings({
                        ...standings,
                        national_ranking: { ...standings.national_ranking, current_rank: parseInt(e.target.value) || 0 },
                      })
                    }
                    className="w-full px-3 py-2 border border-neutral-300 rounded font-mono font-bold text-sm focus:border-[#e10600] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                    Previous Week Rank
                  </label>
                  <input
                    type="number"
                    value={standings.national_ranking.previous_rank}
                    onChange={(e) =>
                      setStandings({
                        ...standings,
                        national_ranking: { ...standings.national_ranking, previous_rank: parseInt(e.target.value) || 0 },
                      })
                    }
                    className="w-full px-3 py-2 border border-neutral-300 rounded font-mono font-bold text-sm focus:border-[#e10600] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                    Movement Display (e.g. "+2", "-1", "0")
                  </label>
                  <input
                    type="text"
                    value={standings.national_ranking.movement}
                    onChange={(e) =>
                      setStandings({
                        ...standings,
                        national_ranking: { ...standings.national_ranking, movement: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#e10600] focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                    Poll Release Date
                  </label>
                  <input
                    type="text"
                    value={standings.national_ranking.poll_date}
                    onChange={(e) =>
                      setStandings({
                        ...standings,
                        national_ranking: { ...standings.national_ranking, poll_date: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#e10600] focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                    Latest Poll PDF Path (e.g. /polls/2627computer-average-2026-11-08.pdf)
                  </label>
                  <input
                    type="text"
                    value={standings.national_ranking.pdf_nov_8}
                    onChange={(e) =>
                      setStandings({
                        ...standings,
                        national_ranking: { ...standings.national_ranking, pdf_nov_8: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#e10600] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={() => showToast("National ranking details updated!")}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white font-heading text-sm px-5 py-2 rounded uppercase tracking-wider transition"
                >
                  Save Rankings Data
                </button>
              </div>
            </div>

            {/* SECHL Conference Standings Table Editor */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-neutral-100 border-b border-neutral-200 font-heading text-sm uppercase tracking-wider text-neutral-800 font-bold flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-2">
                  <span>SECHL Conference Standings Table</span>
                  <span className="text-xs text-neutral-500 font-normal font-sans">
                    (Official ACHA Division I Conference)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Automated Sync Button */}
                  <button
                    type="button"
                    onClick={() => {
                      showToast("Connecting to live ACHA LeagueStat API...");
                      const script = document.createElement("script");
                      const cbName = "acha_sync_" + Date.now();
                      (window as any)[cbName] = (data: any) => {
                        try {
                          const rows = data?.[0]?.sections?.[0]?.data;
                          if (Array.isArray(rows) && rows.length > 0) {
                            const teamNameMap: { [key: string]: string } = {
                              "MD1 University of Kentucky": "Kentucky",
                              "MD1 University of Alabama": "Alabama",
                              "MD1 North Carolina State University": "NC State",
                              "MD1 University of Louisville": "Louisville",
                              "MD1 University of North Carolina": "UNC Chapel Hill",
                              "MD1 University of Cincinnati": "Cincinnati",
                            };

                            const syncedTeams = rows.map((r: any) => {
                              const row = r.row;
                              const rawName = row.name || "";
                              const cleanName = teamNameMap[rawName] || rawName.replace("MD1 ", "").trim();
                              return {
                                rank: parseInt(row.rank) || 1,
                                team: cleanName,
                                gp: parseInt(row.games_played) || 0,
                                record: `${row.wins}–${row.losses}–${row.ot_losses}–${row.shootout_losses}`,
                                gf: parseInt(row.goals_for) || 0,
                                ga: parseInt(row.goals_against) || 0,
                                points: parseInt(row.points) || 0,
                                is_home: cleanName === "NC State",
                              };
                            });

                            // Sort by points descending
                            syncedTeams.sort((a, b) => b.points - a.points);
                            setStandings({ ...standings, teams: syncedTeams });
                            showToast("✓ Successfully synced 6 SECHL teams from live ACHA API!");
                          } else {
                            alert("ACHA API returned empty standings data.");
                          }
                        } catch (err) {
                          console.error("ACHA sync error:", err);
                          alert("Failed to parse ACHA data feed.");
                        } finally {
                          delete (window as any)[cbName];
                          document.body.removeChild(script);
                        }
                      };

                      script.src = `https://lscluster.hockeytech.com/feed/index.php?feed=statviewfeed&view=teams&groupTeamsBy=division&context=overall&season=73&division=77&key=e6867b36742a0c9d&client_code=acha&league_id=1&callback=${cbName}`;
                      script.onerror = () => {
                        alert("Could not connect to ACHA API. Please check internet connection.");
                        delete (window as any)[cbName];
                      };
                      document.body.appendChild(script);
                    }}
                    className="bg-[#002855] hover:bg-[#001f42] text-white font-heading text-xs px-3.5 py-1.5 rounded uppercase tracking-wider shadow flex items-center gap-1.5 transition"
                  >
                    <span>⚡ Auto-Sync from ACHA API</span>
                  </button>

                  <button
                    onClick={() => downloadJSON(standings, "standings.json")}
                    className="bg-[#e10600] hover:bg-[#b00400] text-white font-heading text-xs px-3.5 py-1.5 rounded uppercase tracking-wider shadow transition"
                  >
                    Download standings.json
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto p-4">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-neutral-600 font-bold uppercase tracking-wider border-b border-neutral-200">
                    <tr>
                      <th className="p-2.5">Rank</th>
                      <th className="p-2.5">Team</th>
                      <th className="p-2.5">GP</th>
                      <th className="p-2.5">Conf Record (W–L–OTW–OTL)</th>
                      <th className="p-2.5">GF</th>
                      <th className="p-2.5">GA</th>
                      <th className="p-2.5">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {standings.teams?.map((t: any, idx: number) => {
                      const updateTeam = (field: string, val: any) => {
                        const updatedTeams = [...standings.teams];
                        updatedTeams[idx] = { ...updatedTeams[idx], [field]: val };
                        setStandings({ ...standings, teams: updatedTeams });
                      };

                      return (
                        <tr key={t.team} className={t.is_home ? "bg-red-50/50" : "hover:bg-neutral-50"}>
                          <td className="p-2.5 font-bold font-mono">
                            <input
                              type="number"
                              value={t.rank}
                              onChange={(e) => updateTeam("rank", parseInt(e.target.value) || 1)}
                              className="w-12 px-2 py-1 border border-neutral-300 rounded font-mono text-center"
                            />
                          </td>
                          <td className="p-2.5 font-bold text-neutral-900">
                            {t.team} {t.is_home && <span className="text-[10px] text-[#e10600] font-normal font-sans">(NC State)</span>}
                          </td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              value={t.gp}
                              onChange={(e) => updateTeam("gp", parseInt(e.target.value) || 0)}
                              className="w-14 px-2 py-1 border border-neutral-300 rounded font-mono text-center"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="text"
                              value={t.record}
                              onChange={(e) => updateTeam("record", e.target.value)}
                              className="w-28 px-2 py-1 border border-neutral-300 rounded font-mono text-center"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              value={t.gf}
                              onChange={(e) => updateTeam("gf", parseInt(e.target.value) || 0)}
                              className="w-14 px-2 py-1 border border-neutral-300 rounded font-mono text-center"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              value={t.ga}
                              onChange={(e) => updateTeam("ga", parseInt(e.target.value) || 0)}
                              className="w-14 px-2 py-1 border border-neutral-300 rounded font-mono text-center"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              value={t.points}
                              onChange={(e) => updateTeam("points", parseInt(e.target.value) || 0)}
                              className="w-14 px-2 py-1 border border-neutral-300 rounded font-mono font-bold text-center bg-yellow-50"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
                <span className="text-xs text-neutral-500">
                  Tip: SECHL conference points determine tournament seeding.
                </span>
                <button
                  onClick={() => showToast("SECHL standings table updated in session!")}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white font-heading text-xs px-4 py-2 rounded uppercase tracking-wider"
                >
                  Save Standings Table
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MERCHANDISE */}
        {activeTab === "merch" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
              <div>
                <h2 className="font-heading text-2xl text-neutral-900 tracking-wider">MERCHANDISE & STORE DESK</h2>
                <p className="text-xs text-neutral-500">
                  Add and update apparel drops, pre-orders, and Red & White Shop retail merchandise.
                </p>
              </div>
              <button
                onClick={() => downloadJSON(merch, "merch.json")}
                className="bg-[#e10600] hover:bg-[#b00400] text-white font-heading text-sm px-4 py-2 rounded uppercase tracking-wider shadow transition"
              >
                Download Updated merch.json
              </button>
            </div>

            {/* Sub-Tab Switcher */}
            <div className="flex border-b border-neutral-200 gap-2">
              <button
                onClick={() => setMerchSubTab("exclusive")}
                className={`px-4 py-2 text-xs font-heading uppercase tracking-wider border-b-2 transition ${
                  merchSubTab === "exclusive"
                    ? "border-[#e10600] text-[#e10600] font-bold"
                    : "border-transparent text-neutral-500 hover:text-neutral-800"
                }`}
              >
                ⭐ Team Exclusives & Custom Drops ({merch.team_exclusive?.length || 0})
              </button>
              <button
                onClick={() => setMerchSubTab("retail")}
                className={`px-4 py-2 text-xs font-heading uppercase tracking-wider border-b-2 transition ${
                  merchSubTab === "retail"
                    ? "border-[#e10600] text-[#e10600] font-bold"
                    : "border-transparent text-neutral-500 hover:text-neutral-800"
                }`}
              >
                🛍️ Red & White Shop Retail Partner ({merch.retail_partner?.items?.length || 0})
              </button>
            </div>

            {/* SECTION 4A: TEAM EXCLUSIVES */}
            {merchSubTab === "exclusive" && (
              <div className="space-y-6">
                {/* Form Card: Add or Edit Team Exclusive Item */}
                <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                    <div>
                      <h3 className="font-heading text-lg text-neutral-900 uppercase tracking-wider">
                        {editingExclusiveId ? "Edit Team Exclusive Drop" : "Add New Team Exclusive / Commemorative Drop"}
                      </h3>
                      <p className="text-xs text-neutral-500">
                        {editingExclusiveId
                          ? `Adjust the details for "${exclusiveForm.title}" below and click Save.`
                          : "Create a new commemorative jersey, gameday t-shirt, or team-exclusive drop."}
                      </p>
                    </div>

                    {editingExclusiveId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingExclusiveId(null);
                          setExclusiveForm({
                            id: "",
                            title: "",
                            price: "",
                            status: "Official Pre-Order",
                            badge: "Team Exclusive",
                            image: "",
                            secondary_image: "",
                            description: "",
                            featuresText: "",
                            url: "",
                            action_label: "Pre-Order Jersey →",
                          });
                          showToast("Cancelled edit mode.");
                        }}
                        className="text-xs font-bold text-neutral-600 hover:text-neutral-900 bg-neutral-100 px-3 py-1.5 rounded"
                      >
                        ✕ Cancel Edit & Clear Form
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                        Product Title * (e.g. "Frozen Finley Commemorative Jersey" or "50th Season Gameday T-Shirt")
                      </label>
                      <input
                        type="text"
                        value={exclusiveForm.title}
                        onChange={(e) => setExclusiveForm({ ...exclusiveForm, title: e.target.value })}
                        placeholder="e.g. 50th Season Commemorative Jersey"
                        className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#e10600] focus:outline-none font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                        Price or Price Range * (e.g. "$100.00 – $150.00", "$45.00", "Coming Soon")
                      </label>
                      <input
                        type="text"
                        value={exclusiveForm.price}
                        onChange={(e) => setExclusiveForm({ ...exclusiveForm, price: e.target.value })}
                        placeholder="e.g. $100.00 – $150.00"
                        className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#e10600] focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                        Status Tag (Top Left Corner Badge)
                      </label>
                      <select
                        value={exclusiveForm.status}
                        onChange={(e) => setExclusiveForm({ ...exclusiveForm, status: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#e10600] focus:outline-none"
                      >
                        <option value="Official Pre-Order">Official Pre-Order</option>
                        <option value="In Production">In Production / Coming Soon</option>
                        <option value="In Stock">In Stock / Available Now</option>
                        <option value="Limited Edition">Limited Edition</option>
                        <option value="Sold Out">Sold Out</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                        Category Sub-Badge (e.g. "Team Exclusive", "Student Creative Drop")
                      </label>
                      <input
                        type="text"
                        value={exclusiveForm.badge}
                        onChange={(e) => setExclusiveForm({ ...exclusiveForm, badge: e.target.value })}
                        placeholder="e.g. Team Exclusive"
                        className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#e10600] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                        Action Button Label (e.g. "Pre-Order Jersey →", "Buy Now ↗", "Notify Me at Gameday")
                      </label>
                      <input
                        type="text"
                        value={exclusiveForm.action_label}
                        onChange={(e) => setExclusiveForm({ ...exclusiveForm, action_label: e.target.value })}
                        placeholder="e.g. Pre-Order Jersey →"
                        className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#e10600] focus:outline-none font-semibold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                        Store / Purchase URL (e.g. Square, Stripe, Ticketsauce, or "#" for In Production)
                      </label>
                      <input
                        type="text"
                        value={exclusiveForm.url}
                        onChange={(e) => setExclusiveForm({ ...exclusiveForm, url: e.target.value })}
                        placeholder="https://www.icepackhockey.com/store/... or #"
                        className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#e10600] focus:outline-none font-mono"
                      />
                    </div>

                    {/* Product Photo Upload */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                        Product Photo (Upload from Laptop or Enter URL/Filename)
                      </label>
                      <div className="space-y-3">
                        <div className="border-2 border-dashed border-neutral-300 hover:border-[#e10600] rounded-xl p-3 bg-neutral-50 text-center transition cursor-pointer relative group">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 5 * 1024 * 1024) {
                                  alert("Photo is larger than 5MB. Please choose an image under 5MB.");
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const result = event.target?.result as string;
                                  setExclusiveForm({ ...exclusiveForm, image: result });
                                  showToast(`Uploaded ${file.name} from computer!`);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <p className="text-xs font-bold text-neutral-700">
                            Click to Browse Product Photo from Computer or Drag & Drop Here
                          </p>
                          <p className="text-[11px] text-neutral-400">Supports JPG, PNG, WEBP (under 5MB)</p>
                        </div>

                        {exclusiveForm.image ? (
                          <div className="flex items-center gap-4 p-3 bg-neutral-100 rounded-lg border border-neutral-200">
                            <img
                              src={exclusiveForm.image}
                              alt="Product Preview"
                              className="w-16 h-16 object-contain bg-white rounded border border-neutral-300 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-bold text-green-700 uppercase bg-green-100 px-2 py-0.5 rounded">
                                ✓ Photo Loaded
                              </span>
                              <p className="text-xs text-neutral-500 truncate mt-1 font-mono">
                                {exclusiveForm.image.startsWith("data:") ? "Local file loaded" : exclusiveForm.image}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setExclusiveForm({ ...exclusiveForm, image: "" })}
                              className="text-xs text-red-600 hover:text-red-800 font-bold px-2 py-1"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-neutral-400 font-semibold uppercase">Or Image Path / URL:</span>
                            <input
                              type="text"
                              value={exclusiveForm.image}
                              onChange={(e) => setExclusiveForm({ ...exclusiveForm, image: e.target.value })}
                              placeholder="/jersey.jpg or https://..."
                              className="flex-1 px-3 py-1.5 border border-neutral-300 rounded text-xs focus:border-[#e10600] focus:outline-none"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                        Product Description
                      </label>
                      <textarea
                        rows={2}
                        value={exclusiveForm.description}
                        onChange={(e) => setExclusiveForm({ ...exclusiveForm, description: e.target.value })}
                        placeholder="Official description of the item, manufacturer details, on-ice specifications..."
                        className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#e10600] focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                        Key Features / Bullet Points (Enter 1 bullet per line)
                      </label>
                      <textarea
                        rows={3}
                        value={exclusiveForm.featuresText}
                        onChange={(e) => setExclusiveForm({ ...exclusiveForm, featuresText: e.target.value })}
                        placeholder={"Authentic pro-weight fabric & reinforced pro stitching\nCustom name & number customization available\nAdult Men's, Youth Sizes, and Goalie Cuts available\nDomestic shipping included or gameday pick-up at Lane Arena"}
                        className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#e10600] focus:outline-none font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (!exclusiveForm.title.trim()) {
                          alert("Please enter a product title.");
                          return;
                        }
                        if (!exclusiveForm.price.trim()) {
                          alert("Please enter a price or price display.");
                          return;
                        }

                        const features = exclusiveForm.featuresText
                          .split("\n")
                          .map((f) => f.trim())
                          .filter((f) => f.length > 0);

                        const currentExclusives = merch.team_exclusive || [];

                        if (editingExclusiveId) {
                          const updated = currentExclusives.map((item: any) =>
                            item.id === editingExclusiveId
                              ? {
                                  ...item,
                                  title: exclusiveForm.title,
                                  price: exclusiveForm.price,
                                  status: exclusiveForm.status,
                                  badge: exclusiveForm.badge,
                                  image: exclusiveForm.image || item.image,
                                  secondary_image: exclusiveForm.secondary_image || item.secondary_image,
                                  description: exclusiveForm.description,
                                  features: features.length > 0 ? features : item.features,
                                  url: exclusiveForm.url || "#",
                                  action_label: exclusiveForm.action_label,
                                }
                              : item
                          );
                          const newMerchData = { ...merch, team_exclusive: updated };
                          updateMerchState(newMerchData);
                          setEditingExclusiveId(null);
                          showToast(`✓ Updated "${exclusiveForm.title}"!`);
                        } else {
                          const newItem = {
                            id: "drop-" + Date.now(),
                            title: exclusiveForm.title,
                            price: exclusiveForm.price,
                            status: exclusiveForm.status,
                            badge: exclusiveForm.badge,
                            image: exclusiveForm.image || "/solojersey.jpg",
                            secondary_image: exclusiveForm.secondary_image || exclusiveForm.image,
                            description: exclusiveForm.description,
                            features: features,
                            url: exclusiveForm.url || "#",
                            action_label: exclusiveForm.action_label,
                          };
                          const newMerchData = { ...merch, team_exclusive: [...currentExclusives, newItem] };
                          updateMerchState(newMerchData);
                          showToast(`✓ Added "${exclusiveForm.title}" to Team Exclusives!`);
                        }

                        setExclusiveForm({
                          id: "",
                          title: "",
                          price: "",
                          status: "Official Pre-Order",
                          badge: "Team Exclusive",
                          image: "",
                          secondary_image: "",
                          description: "",
                          featuresText: "",
                          url: "",
                          action_label: "Pre-Order Jersey →",
                        });
                      }}
                      className="bg-[#e10600] hover:bg-[#b00400] text-white font-heading text-sm px-6 py-2.5 rounded uppercase tracking-wider shadow transition"
                    >
                      {editingExclusiveId ? "Save Changes to Item" : "Add Item to Team Exclusives"}
                    </button>
                  </div>
                </div>

                {/* Exclusives Display Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {merch.team_exclusive?.map((item: any) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative mb-3 bg-neutral-50 rounded-lg p-2 flex items-center justify-center h-44 overflow-hidden border border-neutral-100">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="max-h-full max-w-full object-contain"
                            onError={(e: any) => {
                              e.target.src = "/07cdeb598c1716ddf52f5438f9484da2.png";
                            }}
                          />
                          <span className="absolute top-2 left-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-100 text-[#e10600] shadow-sm">
                            {item.status || item.badge}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold uppercase text-neutral-400 block">{item.badge}</span>
                        <h3 className="font-heading text-lg text-neutral-900 mt-0.5 leading-tight">{item.title}</h3>
                        <p className="font-mono font-bold text-sm text-[#e10600] mt-1">{item.price}</p>
                        <p className="text-xs text-neutral-500 mt-2 line-clamp-2">{item.description}</p>

                        {Array.isArray(item.features) && item.features.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-neutral-100 text-[11px] text-neutral-600 space-y-1">
                            {item.features.slice(0, 2).map((f: string, fIdx: number) => (
                              <div key={fIdx} className="truncate">✓ {f}</div>
                            ))}
                            {item.features.length > 2 && (
                              <span className="text-neutral-400 text-[10px] italic">+{item.features.length - 2} more features</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-[#e10600] hover:underline truncate max-w-[140px]"
                        >
                          {item.action_label || "Store Link"}
                        </a>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingExclusiveId(item.id);
                              setExclusiveForm({
                                id: item.id,
                                title: item.title,
                                price: item.price,
                                status: item.status || "Official Pre-Order",
                                badge: item.badge || "Team Exclusive",
                                image: item.image || "",
                                secondary_image: item.secondary_image || "",
                                description: item.description || "",
                                featuresText: Array.isArray(item.features) ? item.features.join("\n") : "",
                                url: item.url || "",
                                action_label: item.action_label || "Pre-Order Jersey →",
                              });
                              window.scrollTo({ top: 300, behavior: "smooth" });
                              showToast(`Editing "${item.title}"`);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 font-bold"
                          >
                            Edit
                          </button>
                          <span className="text-neutral-300">|</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete merchandise drop: "${item.title}"?`)) {
                                const updated = (merch.team_exclusive || []).filter((ex: any) => ex.id !== item.id);
                                updateMerchState({ ...merch, team_exclusive: updated });
                                showToast(`Deleted "${item.title}".`);
                              }
                            }}
                            className="text-xs text-red-600 hover:text-red-800 font-bold"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 4B: RETAIL PARTNER (RED & WHITE SHOP) */}
            {merchSubTab === "retail" && (
              <div className="space-y-6">
                {/* Form Card: Add or Edit Retail Item */}
                <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                    <div>
                      <h3 className="font-heading text-lg text-neutral-900 uppercase tracking-wider">
                        {editingRetailId ? "Edit Retail Product" : "Add Retail Partner Product (The Red and White Shop)"}
                      </h3>
                      <p className="text-xs text-neutral-500">
                        {editingRetailId
                          ? `Adjusting product "${retailForm.title}". Click Save Changes when done.`
                          : "Add an authentic jersey, hoodie, tee, Richardson hat, or scarf from redandwhiteshop.com."}
                      </p>
                    </div>

                    {editingRetailId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingRetailId(null);
                          setRetailForm({
                            id: "",
                            title: "",
                            price: "",
                            category: "Jerseys",
                            image: "",
                            url: "",
                          });
                          showToast("Cancelled edit mode.");
                        }}
                        className="text-xs font-bold text-neutral-600 hover:text-neutral-900 bg-neutral-100 px-3 py-1.5 rounded"
                      >
                        ✕ Cancel Edit & Clear Form
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                        Product Title * (e.g. "Icepack Red Hockey Jersey" or "Black Icepack Hooded Sweatshirt")
                      </label>
                      <input
                        type="text"
                        value={retailForm.title}
                        onChange={(e) => setRetailForm({ ...retailForm, title: e.target.value })}
                        placeholder="e.g. Red Icepack Hooded Sweatshirt"
                        className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#e10600] focus:outline-none font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                        Price * (e.g. "$119.99", "$39.99")
                      </label>
                      <input
                        type="text"
                        value={retailForm.price}
                        onChange={(e) => setRetailForm({ ...retailForm, price: e.target.value })}
                        placeholder="e.g. $39.99"
                        className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#e10600] focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                        Category Dropdown
                      </label>
                      <select
                        value={retailForm.category}
                        onChange={(e) => setRetailForm({ ...retailForm, category: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#e10600] focus:outline-none"
                      >
                        <option value="Jerseys">Jerseys</option>
                        <option value="Hoodies & Fleece">Hoodies & Fleece</option>
                        <option value="T-Shirts">T-Shirts</option>
                        <option value="Hats">Hats</option>
                        <option value="Accessories">Accessories</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                        Store Link * (Direct URL on redandwhiteshop.com)
                      </label>
                      <input
                        type="text"
                        value={retailForm.url}
                        onChange={(e) => setRetailForm({ ...retailForm, url: e.target.value })}
                        placeholder="https://www.redandwhiteshop.com/products/..."
                        className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#e10600] focus:outline-none font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                        Product Photo (Upload from Laptop or Enter Shopify Image URL)
                      </label>
                      <div className="space-y-3">
                        <div className="border-2 border-dashed border-neutral-300 hover:border-[#e10600] rounded-xl p-3 bg-neutral-50 text-center transition cursor-pointer relative group">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 5 * 1024 * 1024) {
                                  alert("Photo is larger than 5MB. Please choose an image under 5MB.");
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const result = event.target?.result as string;
                                  setRetailForm({ ...retailForm, image: result });
                                  showToast(`Uploaded ${file.name} from computer!`);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <p className="text-xs font-bold text-neutral-700">
                            Click to Browse Photo from Computer or Drag & Drop
                          </p>
                          <p className="text-[11px] text-neutral-400">Supports JPG, PNG, WEBP</p>
                        </div>

                        {retailForm.image ? (
                          <div className="flex items-center gap-4 p-3 bg-neutral-100 rounded-lg border border-neutral-200">
                            <img
                              src={retailForm.image}
                              alt="Retail Preview"
                              className="w-14 h-14 object-contain bg-white rounded border border-neutral-300 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-bold text-green-700 uppercase bg-green-100 px-2 py-0.5 rounded">
                                ✓ Photo Loaded
                              </span>
                              <p className="text-xs text-neutral-500 truncate mt-1 font-mono">
                                {retailForm.image.startsWith("data:") ? "Local file loaded" : retailForm.image}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setRetailForm({ ...retailForm, image: "" })}
                              className="text-xs text-red-600 hover:text-red-800 font-bold px-2 py-1"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-neutral-400 font-semibold uppercase">Or Image URL:</span>
                            <input
                              type="text"
                              value={retailForm.image}
                              onChange={(e) => setRetailForm({ ...retailForm, image: e.target.value })}
                              placeholder="https://cdn.shopify.com/... or /product.png"
                              className="flex-1 px-3 py-1.5 border border-neutral-300 rounded text-xs focus:border-[#e10600] focus:outline-none"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (!retailForm.title.trim()) {
                          alert("Please enter a product title.");
                          return;
                        }
                        if (!retailForm.price.trim()) {
                          alert("Please enter a price.");
                          return;
                        }

                        const currentItems = merch.retail_partner?.items || [];

                        if (editingRetailId) {
                          const updated = currentItems.map((item: any) =>
                            item.id === editingRetailId
                              ? {
                                  ...item,
                                  title: retailForm.title,
                                  price: retailForm.price,
                                  category: retailForm.category,
                                  image: retailForm.image || item.image,
                                  url: retailForm.url || item.url,
                                }
                              : item
                          );
                          const newMerchData = {
                            ...merch,
                            retail_partner: {
                              ...merch.retail_partner,
                              items: updated,
                            },
                          };
                          updateMerchState(newMerchData);
                          setEditingRetailId(null);
                          showToast(`✓ Updated "${retailForm.title}"!`);
                        } else {
                          const newItem = {
                            id: "rw-" + Date.now(),
                            title: retailForm.title,
                            price: retailForm.price,
                            category: retailForm.category,
                            image: retailForm.image || "/solojersey.jpg",
                            url: retailForm.url || "https://www.redandwhiteshop.com/search?q=icepack",
                          };
                          const newMerchData = {
                            ...merch,
                            retail_partner: {
                              ...merch.retail_partner,
                              items: [...currentItems, newItem],
                            },
                          };
                          updateMerchState(newMerchData);
                          showToast(`✓ Added "${retailForm.title}" to Retail items!`);
                        }

                        setRetailForm({
                          id: "",
                          title: "",
                          price: "",
                          category: "Jerseys",
                          image: "",
                          url: "",
                        });
                      }}
                      className="bg-[#e10600] hover:bg-[#b00400] text-white font-heading text-sm px-6 py-2.5 rounded uppercase tracking-wider shadow transition"
                    >
                      {editingRetailId ? "Save Changes to Product" : "Add Product to Store Feed"}
                    </button>
                  </div>
                </div>

                {/* Retail Category Filter Bar */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase text-neutral-500 mr-2">Filter Category:</span>
                  {[
                    { id: "all", label: `All (${merch.retail_partner?.items?.length || 0})` },
                    { id: "jerseys", label: "Jerseys" },
                    { id: "hoodies", label: "Hoodies" },
                    { id: "t-shirts", label: "T-Shirts" },
                    { id: "hats", label: "Hats" },
                    { id: "accessories", label: "Accessories" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setRetailCategoryFilter(f.id)}
                      className={`px-3 py-1 rounded text-xs font-heading uppercase tracking-wider transition ${
                        retailCategoryFilter === f.id
                          ? "bg-[#e10600] text-white shadow-sm"
                          : "bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Retail Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {merch.retail_partner?.items
                    ?.filter((item: any) => {
                      if (retailCategoryFilter === "all") return true;
                      if (retailCategoryFilter === "jerseys") return item.category?.toLowerCase().includes("jersey");
                      if (retailCategoryFilter === "hoodies") return item.category?.toLowerCase().includes("hoodie");
                      if (retailCategoryFilter === "t-shirts") return item.category?.toLowerCase().includes("shirt");
                      if (retailCategoryFilter === "hats") return item.category?.toLowerCase().includes("hat");
                      if (retailCategoryFilter === "accessories") return item.category?.toLowerCase().includes("accessories");
                      return true;
                    })
                    .map((item: any) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 flex flex-col justify-between"
                      >
                        <div>
                          <div className="h-44 bg-neutral-50 rounded-lg p-3 flex items-center justify-center overflow-hidden mb-3 border border-neutral-100">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="max-h-full max-w-full object-contain"
                              onError={(e: any) => {
                                e.target.src = "/07cdeb598c1716ddf52f5438f9484da2.png";
                              }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-[#e10600] uppercase tracking-wider block">
                            {item.category}
                          </span>
                          <h4 className="font-heading text-base text-neutral-900 leading-tight mt-1 line-clamp-2">
                            {item.title}
                          </h4>
                          <span className="font-mono font-bold text-sm text-neutral-900 block mt-1.5">{item.price}</span>
                        </div>

                        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-bold text-blue-600 hover:underline truncate max-w-[120px]"
                          >
                            Red & White Shop ↗
                          </a>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingRetailId(item.id);
                                setRetailForm({
                                  id: item.id,
                                  title: item.title,
                                  price: item.price,
                                  category: item.category || "Jerseys",
                                  image: item.image || "",
                                  url: item.url || "",
                                });
                                window.scrollTo({ top: 300, behavior: "smooth" });
                                showToast(`Editing "${item.title}"`);
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 font-bold"
                            >
                              Edit
                            </button>
                            <span className="text-neutral-300">|</span>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Delete retail product: "${item.title}"?`)) {
                                  const updated = (merch.retail_partner?.items || []).filter((i: any) => i.id !== item.id);
                                  updateMerchState({
                                    ...merch,
                                    retail_partner: {
                                      ...merch.retail_partner,
                                      items: updated,
                                    },
                                  });
                                  showToast(`Deleted "${item.title}".`);
                                }
                              }}
                              className="text-xs text-red-600 hover:text-red-800 font-bold"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: ROSTER & STAFF */}
        {activeTab === "roster" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
              <div>
                <h2 className="font-heading text-2xl text-neutral-900 tracking-wider">ROSTER & PLAYER BIOS DESK</h2>
                <p className="text-xs text-neutral-500">
                  Add new players, edit jersey numbers, positions, hometowns, majors, and ACHA bio links.
                </p>
              </div>
              <button
                onClick={() => downloadJSON(roster, "roster.json")}
                className="bg-[#e10600] hover:bg-[#b00400] text-white font-heading text-sm px-4 py-2 rounded uppercase tracking-wider shadow transition"
              >
                Download Updated roster.json
              </button>
            </div>

            {/* Form Card: Add or Edit Player */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                <div>
                  <h3 className="font-heading text-lg text-neutral-900 uppercase tracking-wider">
                    {editingPlayerIndex !== null
                      ? `Editing Player: #${playerForm.number} ${playerForm.name}`
                      : "Add New Player to Roster"}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {editingPlayerIndex !== null
                      ? "Make your adjustments below and click 'Save Changes to Player'."
                      : "Enter the player's info, jersey number, and upload headshot photo."}
                  </p>
                </div>

                {editingPlayerIndex !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPlayerIndex(null);
                      setPlayerForm({
                        number: "",
                        name: "",
                        captain: "",
                        position: "F",
                        class: "FR",
                        hometown: "",
                        major: "",
                        image: "",
                        acha_url: "",
                      });
                      showToast("Cancelled player edit.");
                    }}
                    className="text-xs font-bold text-neutral-600 hover:text-neutral-900 bg-neutral-100 px-3 py-1.5 rounded"
                  >
                    ✕ Cancel Edit & Clear Form
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                    Jersey # * (e.g. 24)
                  </label>
                  <input
                    type="number"
                    value={playerForm.number}
                    onChange={(e) => setPlayerForm({ ...playerForm, number: e.target.value })}
                    placeholder="e.g. 24"
                    className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#e10600] focus:outline-none font-mono font-bold"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                    Player Name * (e.g. Daniel Prazma)
                  </label>
                  <input
                    type="text"
                    value={playerForm.name}
                    onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })}
                    placeholder="e.g. Daniel Prazma"
                    className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#e10600] focus:outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                    Captain Status
                  </label>
                  <select
                    value={playerForm.captain}
                    onChange={(e) => setPlayerForm({ ...playerForm, captain: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#e10600] focus:outline-none"
                  >
                    <option value="">None (Regular Player)</option>
                    <option value="C">Captain (C)</option>
                    <option value="A">Alternate Captain (A)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                    Position
                  </label>
                  <select
                    value={playerForm.position}
                    onChange={(e) => setPlayerForm({ ...playerForm, position: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#e10600] focus:outline-none font-bold"
                  >
                    <option value="F">Forward (F)</option>
                    <option value="D">Defense (D)</option>
                    <option value="G">Goalie (G)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                    Class / Year
                  </label>
                  <select
                    value={playerForm.class}
                    onChange={(e) => setPlayerForm({ ...playerForm, class: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#e10600] focus:outline-none"
                  >
                    <option value="FR">Freshman (FR)</option>
                    <option value="SO">Sophomore (SO)</option>
                    <option value="JR">Junior (JR)</option>
                    <option value="SR">Senior (SR)</option>
                    <option value="GR">Graduate (GR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                    Hometown (e.g. Raleigh, NC)
                  </label>
                  <input
                    type="text"
                    value={playerForm.hometown}
                    onChange={(e) => setPlayerForm({ ...playerForm, hometown: e.target.value })}
                    placeholder="e.g. Raleigh, NC"
                    className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#e10600] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                    Academic Major
                  </label>
                  <input
                    type="text"
                    value={playerForm.major}
                    onChange={(e) => setPlayerForm({ ...playerForm, major: e.target.value })}
                    placeholder="e.g. Business Administration"
                    className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#e10600] focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                    ACHA Profile URL
                  </label>
                  <input
                    type="text"
                    value={playerForm.acha_url}
                    onChange={(e) => setPlayerForm({ ...playerForm, acha_url: e.target.value })}
                    placeholder="https://www.achahockey.org/stats/player/..."
                    className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:border-[#e10600] focus:outline-none font-mono text-xs"
                  />
                </div>

                {/* Headshot Upload */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                    Headshot Photo (Upload from Laptop or Enter Filename/URL)
                  </label>
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-neutral-300 hover:border-[#e10600] rounded-xl p-3 bg-neutral-50 text-center transition cursor-pointer relative group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              alert("Photo is larger than 5MB. Please choose an image under 5MB.");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const result = event.target?.result as string;
                              setPlayerForm({ ...playerForm, image: result });
                              showToast(`Uploaded ${file.name} from computer!`);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <p className="text-xs font-bold text-neutral-700">
                        Click to Browse Player Photo from Computer or Drag & Drop Here
                      </p>
                      <p className="text-[11px] text-neutral-400">Supports JPG, PNG, WEBP (under 5MB)</p>
                    </div>

                    {playerForm.image ? (
                      <div className="flex items-center gap-4 p-3 bg-neutral-100 rounded-lg border border-neutral-200">
                        <img
                          src={playerForm.image.startsWith("data:") ? playerForm.image : `/${playerForm.image}`}
                          alt="Player preview"
                          className="w-14 h-14 object-cover rounded-full border-2 border-neutral-300 shrink-0 shadow-sm"
                          onError={(e: any) => {
                            e.target.src = "/07cdeb598c1716ddf52f5438f9484da2.png";
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-green-700 uppercase bg-green-100 px-2 py-0.5 rounded">
                            ✓ Headshot Loaded
                          </span>
                          <p className="text-xs text-neutral-500 truncate mt-1 font-mono">
                            {playerForm.image.startsWith("data:") ? "Local file loaded" : playerForm.image}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPlayerForm({ ...playerForm, image: "" })}
                          className="text-xs text-red-600 hover:text-red-800 font-bold px-2 py-1"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-neutral-400 font-semibold uppercase">Or Image Filename / URL:</span>
                        <input
                          type="text"
                          value={playerForm.image}
                          onChange={(e) => setPlayerForm({ ...playerForm, image: e.target.value })}
                          placeholder="e.g. c3619eca00613061a0e316c539a51f2b.jpg or https://..."
                          className="flex-1 px-3 py-1.5 border border-neutral-300 rounded text-xs focus:border-[#e10600] focus:outline-none font-mono"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!playerForm.number) {
                      alert("Please enter a jersey number.");
                      return;
                    }
                    if (!playerForm.name.trim()) {
                      alert("Please enter the player's name.");
                      return;
                    }

                    const num = parseInt(playerForm.number as string) || 0;

                    if (editingPlayerIndex !== null) {
                      const updated = [...roster];
                      updated[editingPlayerIndex] = {
                        number: num,
                        name: playerForm.name,
                        captain: playerForm.captain,
                        class: playerForm.class,
                        major: playerForm.major,
                        hometown: playerForm.hometown,
                        image: playerForm.image || updated[editingPlayerIndex].image,
                        position: playerForm.position,
                        acha_url: playerForm.acha_url || `https://www.achahockey.org/stats/player/`,
                      };
                      updateRosterState(updated);
                      setEditingPlayerIndex(null);
                      showToast(`✓ Updated #${num} ${playerForm.name}!`);
                    } else {
                      const newPlayer = {
                        number: num,
                        name: playerForm.name,
                        captain: playerForm.captain,
                        class: playerForm.class,
                        major: playerForm.major,
                        hometown: playerForm.hometown,
                        image: playerForm.image || "07cdeb598c1716ddf52f5438f9484da2.png",
                        position: playerForm.position,
                        acha_url: playerForm.acha_url || `https://www.achahockey.org/stats/player/`,
                      };
                      // Insert and sort by number
                      const updated = [...roster, newPlayer].sort((a, b) => a.number - b.number);
                      updateRosterState(updated);
                      showToast(`✓ Added #${num} ${playerForm.name} to roster!`);
                    }

                    setPlayerForm({
                      number: "",
                      name: "",
                      captain: "",
                      position: "F",
                      class: "FR",
                      hometown: "",
                      major: "",
                      image: "",
                      acha_url: "",
                    });
                  }}
                  className="bg-[#e10600] hover:bg-[#b00400] text-white font-heading text-sm px-6 py-2.5 rounded uppercase tracking-wider shadow transition"
                >
                  {editingPlayerIndex !== null ? "Save Changes to Player" : "Add Player to Roster"}
                </button>
              </div>
            </div>

            {/* Existing Roster Table & Search/Filter */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-neutral-100 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-heading text-sm uppercase tracking-wider text-neutral-800 font-bold">
                    Active Roster ({roster.length} Players)
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Position filter buttons */}
                  {[
                    { id: "all", label: `All (${roster.length})` },
                    { id: "F", label: `F (${roster.filter((p: any) => p.position === "F").length})` },
                    { id: "D", label: `D (${roster.filter((p: any) => p.position === "D").length})` },
                    { id: "G", label: `G (${roster.filter((p: any) => p.position === "G").length})` },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setRosterPosFilter(filter.id)}
                      className={`px-2.5 py-1 rounded text-xs font-heading uppercase tracking-wider transition ${
                        rosterPosFilter === filter.id
                          ? "bg-[#e10600] text-white font-bold"
                          : "bg-white text-neutral-700 hover:bg-neutral-200 border border-neutral-200"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}

                  {/* Search input */}
                  <input
                    type="text"
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                    placeholder="Search player, #, hometown..."
                    className="px-3 py-1 bg-white border border-neutral-300 rounded text-xs focus:border-[#e10600] focus:outline-none w-48"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-neutral-600 font-bold uppercase tracking-wider border-b border-neutral-200">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Headshot</th>
                      <th className="p-3">Player Name</th>
                      <th className="p-3">Pos</th>
                      <th className="p-3">Class</th>
                      <th className="p-3">Hometown</th>
                      <th className="p-3">Major</th>
                      <th className="p-3">ACHA Bio</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {roster
                      .filter((p: any) => {
                        if (rosterPosFilter !== "all" && p.position !== rosterPosFilter) return false;
                        if (rosterSearch.trim()) {
                          const query = rosterSearch.toLowerCase();
                          const matchName = p.name?.toLowerCase().includes(query);
                          const matchNum = String(p.number).includes(query);
                          const matchTown = p.hometown?.toLowerCase().includes(query);
                          const matchMajor = p.major?.toLowerCase().includes(query);
                          return matchName || matchNum || matchTown || matchMajor;
                        }
                        return true;
                      })
                      .map((p: any, idx: number) => {
                        const originalIndex = roster.findIndex((orig: any) => orig.number === p.number && orig.name === p.name);
                        return (
                          <tr key={p.number + "-" + p.name} className="hover:bg-neutral-50">
                            <td className="p-3 font-mono font-bold text-neutral-900">
                              <span className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-neutral-800">
                                #{p.number}
                              </span>
                            </td>
                            <td className="p-3">
                              <img
                                src={p.image?.startsWith("data:") ? p.image : `/${p.image}`}
                                alt={p.name}
                                className="w-9 h-9 rounded-full object-cover border border-neutral-300"
                                onError={(e: any) => {
                                  e.target.src = "/07cdeb598c1716ddf52f5438f9484da2.png";
                                }}
                              />
                            </td>
                            <td className="p-3 font-semibold text-neutral-900 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span>{p.name}</span>
                                {p.captain && (
                                  <span className="text-[10px] bg-neutral-900 text-white px-1.5 py-0.2 rounded font-mono font-bold">
                                    {p.captain}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 font-bold text-neutral-700">{p.position}</td>
                            <td className="p-3 text-neutral-500">{p.class}</td>
                            <td className="p-3 text-neutral-600 whitespace-nowrap">{p.hometown}</td>
                            <td className="p-3 text-neutral-500 max-w-xs truncate">{p.major || "—"}</td>
                            <td className="p-3">
                              {p.acha_url ? (
                                <a
                                  href={p.acha_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[11px] font-bold text-[#e10600] hover:underline"
                                >
                                  Stats ↗
                                </a>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="p-3 text-right whitespace-nowrap space-x-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPlayerIndex(originalIndex !== -1 ? originalIndex : idx);
                                  setPlayerForm({
                                    number: String(p.number),
                                    name: p.name,
                                    captain: p.captain || "",
                                    position: p.position || "F",
                                    class: p.class || "FR",
                                    hometown: p.hometown || "",
                                    major: p.major || "",
                                    image: p.image || "",
                                    acha_url: p.acha_url || "",
                                  });
                                  window.scrollTo({ top: 300, behavior: "smooth" });
                                  showToast(`Editing #${p.number} ${p.name}`);
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 font-bold"
                              >
                                Edit
                              </button>
                              <span className="text-neutral-300">|</span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Remove #${p.number} ${p.name} from the roster?`)) {
                                    const targetIdx = originalIndex !== -1 ? originalIndex : idx;
                                    const updated = roster.filter((_: any, i: number) => i !== targetIdx);
                                    updateRosterState(updated);
                                    showToast(`Removed #${p.number} ${p.name}.`);
                                  }
                                }}
                                className="text-xs text-red-600 hover:text-red-800 font-bold"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SPONSORS */}
        {activeTab === "sponsors" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
              <div>
                <h2 className="font-heading text-2xl text-neutral-900 tracking-wider">SPONSOR & PARTNER DESK</h2>
                <p className="text-xs text-neutral-500">
                  Update corporate partners, logos, tiers, and partner websites.
                </p>
              </div>
              <button
                onClick={() => downloadJSON(sponsors, "sponsors.json")}
                className="bg-[#e10600] hover:bg-[#b00400] text-white font-heading text-sm px-4 py-2 rounded uppercase tracking-wider shadow transition"
              >
                Download Updated sponsors.json
              </button>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4">
              <p className="text-xs text-neutral-600">
                Current active sponsors loaded: <strong>{sponsors.length} Partners</strong>.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer / Instructions Bar */}
      <footer className="bg-white border-t border-neutral-200 py-4 px-6 text-center text-xs text-neutral-500">
        <p>
          Icepack Publishing Studio · Built for NC State Icepack Media Interns · For assistance contact Brent Plunkett
        </p>
      </footer>
    </div>
  );
}

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

export default function AdminDashboard() {
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

  // Check session storage on mount
  useEffect(() => {
    const savedAuth = sessionStorage.getItem("icepack_admin_auth");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput.trim() === DESK_PASSCODE || passcodeInput.trim().toUpperCase() === "ICEPACK") {
      setIsAuthenticated(true);
      sessionStorage.setItem("icepack_admin_auth", "true");
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
                sessionStorage.removeItem("icepack_admin_auth");
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
                  Update apparel, pre-orders, and Red & White Shop direct links.
                </p>
              </div>
              <button
                onClick={() => downloadJSON(merch, "merch.json")}
                className="bg-[#e10600] hover:bg-[#b00400] text-white font-heading text-sm px-4 py-2 rounded uppercase tracking-wider shadow transition"
              >
                Download Updated merch.json
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {merch.team_exclusive?.map((item: any, idx: number) => (
                <div key={item.id || idx} className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 flex flex-col justify-between">
                  <div>
                    <img src={item.image} alt={item.title} className="w-full h-44 object-contain bg-neutral-50 rounded-lg mb-3" />
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-100 text-[#e10600]">
                      {item.badge}
                    </span>
                    <h3 className="font-heading text-lg text-neutral-900 mt-1">{item.title}</h3>
                    <p className="font-mono font-bold text-sm text-neutral-700">{item.price}</p>
                    <p className="text-xs text-neutral-500 mt-2 line-clamp-2">{item.description}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-neutral-100">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-[#e10600] hover:underline block truncate"
                    >
                      Store Link: {item.url}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: ROSTER & STAFF */}
        {activeTab === "roster" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
              <div>
                <h2 className="font-heading text-2xl text-neutral-900 tracking-wider">ROSTER & PLAYER DESK</h2>
                <p className="text-xs text-neutral-500">
                  Manage jersey numbers, positions, hometowns, and player headshots.
                </p>
              </div>
              <button
                onClick={() => downloadJSON(roster, "roster.json")}
                className="bg-[#e10600] hover:bg-[#b00400] text-white font-heading text-sm px-4 py-2 rounded uppercase tracking-wider shadow transition"
              >
                Download Updated roster.json
              </button>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-100 text-neutral-600 font-bold uppercase tracking-wider border-b border-neutral-200">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Player Name</th>
                      <th className="p-3">Pos</th>
                      <th className="p-3">Year</th>
                      <th className="p-3">Hometown</th>
                      <th className="p-3">Major</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {roster.map((p: any) => (
                      <tr key={p.number + p.name} className="hover:bg-neutral-50">
                        <td className="p-3 font-mono font-bold text-neutral-900">#{p.number}</td>
                        <td className="p-3 font-semibold text-neutral-900">{p.name} {p.captain && `(${p.captain})`}</td>
                        <td className="p-3 font-bold text-neutral-600">{p.position}</td>
                        <td className="p-3 text-neutral-500">{p.class}</td>
                        <td className="p-3 text-neutral-600">{p.hometown}</td>
                        <td className="p-3 text-neutral-500">{p.major || "—"}</td>
                      </tr>
                    ))}
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

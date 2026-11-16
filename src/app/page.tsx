"use client";

import React, { useState, useEffect } from "react";
import scheduleData from "../data/schedule.json";
import rosterData from "../data/roster.json";
import staffData from "../data/staff.json";
import newsData from "../data/news.json";
import standingsData from "../data/standings.json";
import sponsorsData from "../data/sponsors.json";
import historySeasons from "../data/history_seasons.json";
import historyEras from "../data/history_eras.json";
import stephenRussellData from "../data/stephen_russell.json";
import mediaVideosData from "../data/media_videos.json";
import mediaPhotosData from "../data/media_photos.json";
import merchData from "../data/merch.json";
import givingLevelsData from "../data/giving_levels.json";
import liveGameLatest from "../data/live_game_latest.json";

export default function IcePackApp() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [scheduleFilter, setScheduleFilter] = useState<string>("all");
  const [scheduleView, setScheduleView] = useState<string>("current"); // "current" | "archive"
  const [scheduleMode, setScheduleMode] = useState<string>("table"); // "table" | "calendar"
  const [calMonthIdx, setCalMonthIdx] = useState<number>(2); // 0=Sep, 1=Oct, 2=Nov (default current), 3=Jan, 4=Feb, 5=Mar
  const [selectedArchiveSeason, setSelectedArchiveSeason] = useState<number>(0);
  const [rosterTab, setRosterTab] = useState<string>("players");
  const [calDropdownOpen, setCalDropdownOpen] = useState<boolean>(false);
  const [newsFilter, setNewsFilter] = useState<string>("all");
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [newsPage, setNewsPage] = useState<number>(1);
  const [merchFilter, setMerchFilter] = useState<string>("all");
  const [mediaDropdownOpen, setMediaDropdownOpen] = useState<boolean>(false);
  const [teamDropdownOpen, setTeamDropdownOpen] = useState<boolean>(false);
  const [photoFilter, setPhotoFilter] = useState<string>("all");
  const [gameCenterOpen, setGameCenterOpen] = useState<boolean>(false);
  const [gameCenterTab, setGameCenterTab] = useState<string>("scoring"); // "scoring" | "penalties" | "alerts"
  const [alertSubmitted, setAlertSubmitted] = useState<boolean>(false);
  const [alertPhone, setAlertPhone] = useState<string>("");
  const [selectedLeadingEdgeIdx, setSelectedLeadingEdgeIdx] = useState<number>(0);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [contactName, setContactName] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [contactMsg, setContactMsg] = useState<string>("");

  // In-browser real-time live gameday state
  const [liveGame, setLiveGame] = useState<any>(liveGameLatest);

  // Real-time direct ACHA Clock & Live Box Score Hook
  useEffect(() => {
    let isMounted = true;

    // Only activate real-time polling during an active in-progress game!
    const isLiveActive = scheduleData.some((g: any) => g.is_live === true);
    if (!isLiveActive) {
      return () => {
        isMounted = false;
      };
    }

    // 1. Fetch detailed boxscore (goals/penalties) from local live.json
    const fetchDetailedBoxScore = async () => {
      try {
        const res = await fetch(`/live.json?t=${Date.now()}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && data.game_id) {
            setLiveGame((prev: any) => ({
              ...prev,
              ...data,
              // keep any newer live clock if already set
              clock: prev?.clock || data.clock,
              status: prev?.status && prev.status.includes("·") ? prev.status : data.status,
            }));
          }
        }
      } catch (err) {}
    };

    // 2. Direct JSONP connection straight to live ACHA LeagueStat scoreboard clock (0 latency)
    const pollDirectAchaClock = () => {
      try {
        const cbName = "acha_clock_" + Date.now();
        const script = document.createElement("script");
        script.src = `https://lscluster.hockeytech.com/feed/index.php?feed=gc&key=e6867b36742a0c9d&client_code=acha&game_id=33025&lang=en&tab=clock&callback=${cbName}`;

        (window as any)[cbName] = (data: any) => {
          try {
            if (!isMounted) return;
            const clock = data?.GC?.Clock;
            if (clock) {
              const rawClock = clock.game_clock || "";
              let cleanClock = "";
              if (rawClock) {
                const parts = rawClock.split(":");
                if (parts.length === 3) cleanClock = `${parseInt(parts[1])}:${parts[2]}`;
                else if (parts.length === 2) cleanClock = `${parseInt(parts[0])}:${parts[1]}`;
              }

              const pName = clock.period_name || "1st";
              const isFinal = String(clock.final) === "1";
              let statusLabel = "";

              if (isFinal) {
                statusLabel = "Final";
              } else if (rawClock === "00:00:00" || cleanClock === "0:00") {
                statusLabel = `${pName} Intermission`;
              } else if (cleanClock) {
                statusLabel = `${pName} Period · ${cleanClock}`;
              } else {
                statusLabel = `${pName} Period · In Progress`;
              }

              const homeScore = parseInt(clock.home_goal_count) || 0;
              const visitorScore = parseInt(clock.visiting_goal_count) || 0;

              setLiveGame((prev: any) => ({
                ...prev,
                status: statusLabel,
                clock: cleanClock,
                period: pName,
                home: {
                  ...prev.home,
                  score: homeScore,
                },
                visitor: {
                  ...prev.visitor,
                  score: visitorScore,
                },
              }));
            }
          } catch (e) {
            console.error("ACHA clock direct parse error:", e);
          } finally {
            delete (window as any)[cbName];
            if (script.parentNode) script.parentNode.removeChild(script);
          }
        };

        script.onerror = () => {
          delete (window as any)[cbName];
          if (script.parentNode) script.parentNode.removeChild(script);
        };

        document.body.appendChild(script);
      } catch (err) {}
    };

    // Initial run
    fetchDetailedBoxScore();
    pollDirectAchaClock();

    // Boxscore polls every 20s; Direct ACHA Scoreboard clock polls every 10s!
    const clockTimer = setInterval(pollDirectAchaClock, 10000);
    const boxscoreTimer = setInterval(fetchDetailedBoxScore, 20000);

    return () => {
      isMounted = false;
      clearInterval(clockTimer);
      clearInterval(boxscoreTimer);
    };
  }, []);

  const seasonMonths = [
    { label: "September 2026", year: 2026, month: 8 },
    { label: "October 2026", year: 2026, month: 9 },
    { label: "November 2026", year: 2026, month: 10 },
    { label: "January 2027", year: 2027, month: 0 },
    { label: "February 2027", year: 2027, month: 1 },
    { label: "March 2027", year: 2027, month: 2 },
  ];

  // Filtered games
  const filteredGames = scheduleData.filter((g) => {
    if (scheduleFilter === "home") return g.ha === "H";
    if (scheduleFilter === "away") return g.ha === "A" || g.ha === "N";
    return true;
  });

  // Filtered news
  const filteredNews = newsData.filter((art) => {
    if (newsFilter === "all") return true;
    return art.category.toLowerCase() === newsFilter.toLowerCase();
  });

  const newsPerPage = 9;
  const totalNewsPages = Math.ceil(filteredNews.length / newsPerPage);
  const paginatedNews = filteredNews.slice((newsPage - 1) * newsPerPage, newsPage * newsPerPage);

  // Dynamic NC State standings reference for top scoreboard strip & highlights
  const ncStateTeam = standingsData.teams.find((t) => t.team === "NC State" || t.is_home) || {
    rank: 3,
    points: 21,
    record: "9–6–3–0",
  };
  const ncStateCleanRecord = ncStateTeam.record.split("–").slice(0, 3).join("–");
  const ncStateRankOrdinal =
    ncStateTeam.rank === 1
      ? "1st"
      : ncStateTeam.rank === 2
      ? "2nd"
      : ncStateTeam.rank === 3
      ? "3rd"
      : `${ncStateTeam.rank}th`;

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#222222]">
      {/* MAIN HEADER (Brand Red: #e10600) */}
      <header className="bg-[#e10600] text-white px-3 sm:px-8 py-2.5 sm:py-3.5 border-b-4 border-[#b00400] shadow-md sticky top-0 z-40 transition-all">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-3">
          {/* Logo & Team Identity */}
          <button
            onClick={() => {
              setActiveTab("home");
              setMobileMenuOpen(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2 sm:gap-3 text-left group"
          >
            <img
              src="/07cdeb598c1716ddf52f5438f9484da2.png"
              alt="NC State IcePack Logo"
              className="w-10 h-10 sm:w-14 sm:h-14 object-contain drop-shadow shrink-0"
            />
            <div className="flex flex-col">
              <span className="font-heading text-2xl sm:text-4xl leading-none tracking-wider text-white">
                ICEPACK HOCKEY
              </span>
              <span className="text-[9px] sm:text-[11px] font-bold tracking-[0.12em] sm:tracking-[0.16em] uppercase text-white/90">
                NC STATE · ACHA DIVISION I
              </span>
            </div>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded bg-black/25 hover:bg-black/40 active:bg-black/50 text-white border border-white/25 transition shadow-sm"
          >
            <span className="font-heading text-xs tracking-wider uppercase font-semibold">
              {mobileMenuOpen ? "CLOSE" : "MENU"}
            </span>
            <svg
              className="w-5 h-5 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 sm:gap-2 text-[14px] sm:text-[15px] font-bold uppercase tracking-wider font-opensans">
            {[
              { id: "schedule", label: "Schedule" },
              { id: "standings", label: "Standings" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`px-3 py-2 rounded transition font-opensans ${
                  activeTab === tab.id
                    ? "bg-[#222222] text-white shadow-inner"
                    : "text-white hover:bg-white/15"
                }`}
              >
                {tab.label}
              </button>
            ))}

            {/* Team Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setTeamDropdownOpen(true)}
              onMouseLeave={() => setTeamDropdownOpen(false)}
            >
              <button
                onClick={() => {
                  setActiveTab("team");
                  setTeamDropdownOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`px-3 py-2 rounded transition font-opensans flex items-center gap-1.5 ${
                  activeTab === "team"
                    ? "bg-[#222222] text-white shadow-inner"
                    : "text-white hover:bg-white/15"
                }`}
              >
                <span>Team</span>
                <span className="text-[10px]">▾</span>
              </button>

              {teamDropdownOpen && (
                <div className="absolute left-0 mt-0.5 w-48 bg-[#222222] border-2 border-[#b00400] rounded-lg shadow-xl py-1 z-50 text-left overflow-hidden">
                  <button
                    onClick={() => {
                      setActiveTab("team");
                      setRosterTab("players");
                      setTeamDropdownOpen(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#e10600] text-white transition ${
                      activeTab === "team" && rosterTab === "players" ? "bg-[#e10600]" : ""
                    }`}
                  >
                    Roster & Players
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("team");
                      setRosterTab("coaches");
                      setTeamDropdownOpen(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#e10600] text-white transition ${
                      activeTab === "team" && rosterTab === "coaches" ? "bg-[#e10600]" : ""
                    }`}
                  >
                    Coaches & Staff
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("team");
                      setRosterTab("facilities");
                      setTeamDropdownOpen(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#e10600] text-white transition ${
                      activeTab === "team" && rosterTab === "facilities" ? "bg-[#e10600]" : ""
                    }`}
                  >
                    Facilities & Arena
                  </button>
                </div>
              )}
            </div>

            {/* Media Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setMediaDropdownOpen(true)}
              onMouseLeave={() => setMediaDropdownOpen(false)}
            >
              <button
                onClick={() => {
                  setActiveTab("media");
                  setMediaDropdownOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`px-3 py-2 rounded transition font-opensans flex items-center gap-1.5 ${
                  activeTab === "media" || activeTab === "news" || activeTab === "videos" || activeTab === "photos"
                    ? "bg-[#222222] text-white shadow-inner"
                    : "text-white hover:bg-white/15"
                }`}
              >
                <span>Media</span>
                <span className="text-[10px]">▾</span>
              </button>

              {mediaDropdownOpen && (
                <div className="absolute left-0 mt-0.5 w-48 bg-[#222222] border-2 border-[#b00400] rounded-lg shadow-xl py-1 z-50 text-left overflow-hidden">
                  <button
                    onClick={() => {
                      setActiveTab("news");
                      setSelectedArticle(null);
                      setMediaDropdownOpen(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#e10600] text-white transition ${
                      activeTab === "news" ? "bg-[#e10600]" : ""
                    }`}
                  >
                    News & Recaps
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("videos");
                      setMediaDropdownOpen(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#e10600] text-white transition ${
                      activeTab === "videos" ? "bg-[#e10600]" : ""
                    }`}
                  >
                    Videos & PackTV
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("photos");
                      setMediaDropdownOpen(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#e10600] text-white transition ${
                      activeTab === "photos" ? "bg-[#e10600]" : ""
                    }`}
                  >
                    Photo Gallery
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setActiveTab("merch");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`px-3 py-2 rounded transition font-opensans ${
                activeTab === "merch"
                  ? "bg-[#222222] text-white shadow-inner"
                  : "text-white hover:bg-white/15"
              }`}
            >
              Merch
            </button>

            {/* About Us Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setAboutDropdownOpen(true)}
              onMouseLeave={() => setAboutDropdownOpen(false)}
            >
              <button
                onClick={() => setAboutDropdownOpen(!aboutDropdownOpen)}
                className={`px-3 py-2 rounded transition font-opensans flex items-center gap-1.5 ${
                  activeTab === "history" || activeTab === "governance" || activeTab === "about" || activeTab === "stephen-russell"
                    ? "bg-[#222222] text-white shadow-inner"
                    : "text-white hover:bg-white/15"
                }`}
              >
                <span>About Us</span>
                <span className="text-[10px]">▾</span>
              </button>

              {aboutDropdownOpen && (
                <div className="absolute left-0 mt-0.5 w-48 bg-[#222222] border-2 border-[#b00400] rounded-lg shadow-xl py-1 z-50 text-left overflow-hidden">
                  <button
                    onClick={() => {
                      setActiveTab("history");
                      setAboutDropdownOpen(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#e10600] text-white transition ${
                      activeTab === "history" || activeTab === "about" ? "bg-[#e10600]" : ""
                    }`}
                  >
                    History
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("governance");
                      setAboutDropdownOpen(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#e10600] text-white transition ${
                      activeTab === "governance" ? "bg-[#e10600]" : ""
                    }`}
                  >
                    Governance
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("stephen-russell");
                      setAboutDropdownOpen(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#e10600] text-white transition ${
                      activeTab === "stephen-russell" ? "bg-[#e10600]" : ""
                    }`}
                  >
                    Stephen Russell
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setActiveTab("support");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`px-3 py-2 rounded transition font-opensans ${
                activeTab === "support"
                  ? "bg-[#222222] text-white shadow-inner"
                  : "text-white hover:bg-white/15"
              }`}
            >
              Annual Fund
            </button>

            {/* Football Raffle Button (Temporary Event) */}
            <button
              onClick={() => {
                setActiveTab("raffle");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`px-3 py-1.5 rounded-full font-bold uppercase text-xs transition font-opensans flex items-center gap-1.5 shadow-sm shrink-0 ${
                activeTab === "raffle"
                  ? "bg-[#222222] text-white ring-2 ring-white"
                  : "bg-amber-400 hover:bg-amber-300 text-stone-900 font-extrabold"
              }`}
              title="UNC vs. NC State Football Ticket Raffle"
            >
              <span>🏈</span>
              <span>Football Raffle</span>
              <span className="text-[9px] bg-red-600 text-white font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                ~10 Days
              </span>
            </button>
          </nav>
        </div>

        {/* Mobile Dropdown Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden max-w-[1280px] mx-auto mt-2.5 pt-2.5 border-t border-white/20 flex flex-col gap-1 font-opensans max-h-[calc(100vh-80px)] overflow-y-auto pb-4">
            {/* Home */}
            <button
              onClick={() => {
                setActiveTab("home");
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded font-bold uppercase tracking-wider text-xs transition flex items-center justify-between ${
                activeTab === "home"
                  ? "bg-[#222222] text-white shadow-inner"
                  : "text-white hover:bg-white/15"
              }`}
            >
              <span>Home</span>
              <span className="text-xs text-white/50">›</span>
            </button>

            {/* Core Headings */}
            {[
              { id: "schedule", label: "Schedule & Tickets" },
              { id: "standings", label: "Standings & Rankings" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded font-bold uppercase tracking-wider text-xs transition flex items-center justify-between ${
                  activeTab === tab.id
                    ? "bg-[#222222] text-white shadow-inner"
                    : "text-white hover:bg-white/15"
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-xs text-white/50">›</span>
              </button>
            ))}

            {/* Team Subsection on Mobile */}
            <div className="bg-black/20 rounded p-2 my-0.5">
              <div className="text-[10px] font-bold tracking-widest uppercase text-white/70 px-2 py-0.5">
                Team & Facilities
              </div>
              <div className="grid grid-cols-2 gap-1 mt-1">
                <button
                  onClick={() => {
                    setActiveTab("team");
                    setRosterTab("players");
                    setMobileMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`text-center py-2 px-1 rounded text-xs font-bold uppercase tracking-wider transition ${
                    activeTab === "team" && rosterTab === "players" ? "bg-[#222222] text-white" : "text-white hover:bg-white/15"
                  }`}
                >
                  Roster
                </button>
                <button
                  onClick={() => {
                    setActiveTab("team");
                    setRosterTab("coaches");
                    setMobileMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`text-center py-2 px-1 rounded text-xs font-bold uppercase tracking-wider transition ${
                    activeTab === "team" && rosterTab === "coaches" ? "bg-[#222222] text-white" : "text-white hover:bg-white/15"
                  }`}
                >
                  Coaches
                </button>
                <button
                  onClick={() => {
                    setActiveTab("team");
                    setRosterTab("facilities");
                    setMobileMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`col-span-2 text-center py-2 px-1 rounded text-xs font-bold uppercase tracking-wider transition ${
                    activeTab === "team" && rosterTab === "facilities" ? "bg-[#222222] text-white" : "text-white hover:bg-white/15"
                  }`}
                >
                  🏟️ Facilities & Lane Arena
                </button>
              </div>
            </div>

            {/* Media Subsection */}
            <div className="bg-black/20 rounded p-2 my-0.5">
              <div className="text-[10px] font-bold tracking-widest uppercase text-white/70 px-2 py-0.5">
                Media
              </div>
              <div className="grid grid-cols-2 gap-1 mt-1">
                <button
                  onClick={() => {
                    setActiveTab("media");
                    setMobileMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`text-center py-2 px-1 rounded text-xs font-bold uppercase tracking-wider transition ${
                    activeTab === "media" ? "bg-[#222222] text-white" : "text-white hover:bg-white/15"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => {
                    setActiveTab("news");
                    setSelectedArticle(null);
                    setMobileMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`text-center py-2 px-1 rounded text-xs font-bold uppercase tracking-wider transition ${
                    activeTab === "news" ? "bg-[#222222] text-white" : "text-white hover:bg-white/15"
                  }`}
                >
                  News
                </button>
                <button
                  onClick={() => {
                    setActiveTab("videos");
                    setMobileMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`text-center py-2 px-1 rounded text-xs font-bold uppercase tracking-wider transition ${
                    activeTab === "videos" ? "bg-[#222222] text-white" : "text-white hover:bg-white/15"
                  }`}
                >
                  Videos
                </button>
                <button
                  onClick={() => {
                    setActiveTab("photos");
                    setMobileMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`text-center py-2 px-1 rounded text-xs font-bold uppercase tracking-wider transition ${
                    activeTab === "photos" ? "bg-[#222222] text-white" : "text-white hover:bg-white/15"
                  }`}
                >
                  Photos
                </button>
              </div>
            </div>

            {/* Merch */}
            <button
              onClick={() => {
                setActiveTab("merch");
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded font-bold uppercase tracking-wider text-xs transition flex items-center justify-between ${
                activeTab === "merch"
                  ? "bg-[#222222] text-white shadow-inner"
                  : "text-white hover:bg-white/15"
              }`}
            >
              <span>Merchandise</span>
              <span className="text-xs text-white/50">›</span>
            </button>

            {/* About Us Subsection */}
            <div className="bg-black/20 rounded p-2 my-0.5">
              <div className="text-[10px] font-bold tracking-widest uppercase text-white/70 px-2 py-0.5">
                About Us
              </div>
              <div className="flex flex-col gap-1 mt-1">
                <button
                  onClick={() => {
                    setActiveTab("history");
                    setMobileMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`text-left px-3 py-2 rounded text-xs font-bold uppercase tracking-wider transition flex items-center justify-between ${
                    activeTab === "history" || activeTab === "about"
                      ? "bg-[#222222] text-white"
                      : "text-white hover:bg-white/15"
                  }`}
                >
                  <span>History (50 Seasons)</span>
                  <span className="text-xs text-white/50">›</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("governance");
                    setMobileMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`text-left px-3 py-2 rounded text-xs font-bold uppercase tracking-wider transition flex items-center justify-between ${
                    activeTab === "governance"
                      ? "bg-[#222222] text-white"
                      : "text-white hover:bg-white/15"
                  }`}
                >
                  <span>Governance & Non-Profit (990s)</span>
                  <span className="text-xs text-white/50">›</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("stephen-russell");
                    setMobileMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`text-left px-3 py-2 rounded text-xs font-bold uppercase tracking-wider transition flex items-center justify-between ${
                    activeTab === "stephen-russell"
                      ? "bg-[#222222] text-white"
                      : "text-white hover:bg-white/15"
                  }`}
                >
                  <span>Stephen Russell Memorial</span>
                  <span className="text-xs text-white/50">›</span>
                </button>
              </div>
            </div>

            {/* Annual Fund (formerly Support) */}
            <button
              onClick={() => {
                setActiveTab("support");
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded font-bold uppercase tracking-wider text-xs transition flex items-center justify-between ${
                activeTab === "support"
                  ? "bg-[#222222] text-white shadow-inner"
                  : "text-white hover:bg-white/15"
              }`}
            >
              <span>Annual Fund</span>
              <span className="text-xs text-white/50">›</span>
            </button>

            {/* Football Raffle (Mobile) */}
            <button
              onClick={() => {
                setActiveTab("raffle");
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded font-bold uppercase tracking-wider text-xs transition flex items-center justify-between shadow-sm mt-1.5 ${
                activeTab === "raffle"
                  ? "bg-[#222222] text-white ring-2 ring-amber-400"
                  : "bg-amber-400 hover:bg-amber-300 text-stone-900 font-extrabold"
              }`}
            >
              <span className="flex items-center gap-2">
                <span>🏈</span>
                <span>UNC / NCSU Football Raffle</span>
              </span>
              <span className="text-[10px] bg-red-600 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-tight">
                ~10 Days Left
              </span>
            </button>
          </div>
        )}
      </header>

      {/* 3. SCOREBOARD STRIP */}
      <section className="bg-[#222222] text-white px-4 sm:px-8 border-b border-[#333333]">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#444444] py-3 text-sm">
          {/* Last Result */}
          <div className="py-2 md:py-0 md:pr-4 flex flex-col justify-center">
            <span className="text-[10px] font-bold tracking-widest uppercase text-white/70">
              LAST RESULT · FRI NOV 13
            </span>
            <div className="flex items-center justify-between mt-1 gap-2">
              <div className="flex items-center gap-2">
                <img
                  src="/teams/cincinnati.png"
                  alt="Cincinnati Bearcats"
                  className="w-5 h-5 object-contain bg-white rounded-full p-0.5"
                />
                <span className="font-heading text-xl text-white">
                  VS{" "}
                  <a
                    href="https://www.bearcathockey.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#e10600] transition underline underline-offset-2 decoration-white/40 hover:decoration-[#e10600]"
                    title="Visit Cincinnati Bearcats Hockey Club Website"
                  >
                    CINCINNATI
                  </a>
                </span>
                <span className="font-bold text-base text-red-400 font-mono ml-1">L 5-4 (OT)</span>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  onClick={() => setGameCenterOpen(!gameCenterOpen)}
                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase transition flex items-center justify-center gap-1 cursor-pointer leading-tight ${
                    gameCenterOpen
                      ? "bg-[#e10600] text-white shadow"
                      : "bg-white/10 hover:bg-[#e10600] text-white border border-white/20 hover:border-[#e10600]"
                  }`}
                  title="View Friday GameCenter Box Score"
                >
                  <span>{gameCenterOpen ? "Box Score ▲" : "Box Score ▾"}</span>
                </button>
                <button
                  onClick={() => {
                    const article = newsData.find((a) => a.id === 56);
                    if (article) setSelectedArticle(article);
                    setActiveTab("news");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-[10px] px-2 py-0.5 rounded font-bold uppercase transition bg-[#e10600] hover:bg-[#c40500] text-white shadow cursor-pointer flex items-center justify-center gap-0.5 leading-tight"
                  title="Read Cincinnati Series Recap"
                >
                  <span>Recap →</span>
                </button>
              </div>
            </div>
            <span className="text-xs text-white/60">SECHL Matchup · Overtime (1 Pt Earned)</span>
          </div>

          {/* Next Game */}
          <div className="py-2 md:py-0 md:px-4 flex flex-col justify-center">
            <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400">
              NEXT GAME · FRI NOV 20 · 8:00 PM
            </span>
            <div className="flex items-center justify-between mt-1 gap-2">
              <div className="flex items-center gap-2">
                <img
                  src="/teams/george-mason.png"
                  alt="George Mason Patriots"
                  className="w-5 h-5 object-contain bg-white rounded-full p-0.5"
                  onError={(e: any) => { e.target.style.display = 'none'; }}
                />
                <span className="font-heading text-xl text-white">
                  AT GEORGE MASON
                </span>
              </div>
              <a
                href="https://gmuhockey.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-white/10 hover:bg-[#e10600] text-white px-2 py-0.5 rounded font-bold uppercase transition border border-white/20 hover:border-[#e10600]"
              >
                Matchup ↗
              </a>
            </div>
            <span className="text-xs text-white/60 truncate">Prince William Ice Center · Dale City, VA</span>
          </div>

          {/* Overall Record */}
          <div className="py-2 md:py-0 md:px-4 flex flex-col justify-center">
            <span className="text-[10px] font-bold tracking-widest uppercase text-white/70">
              2026–27 OVERALL RECORD
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-heading text-2xl text-white">{ncStateCleanRecord}</span>
              <span className="text-xs text-[#e10600] font-bold">
                {ncStateRankOrdinal} in SECHL ({ncStateTeam.points} pts)
              </span>
            </div>
            <span className="text-xs text-white/60">ACHA Division I</span>
          </div>

          {/* Quick Schedule Link */}
          <div className="py-2 md:py-0 md:pl-4 flex items-center justify-between md:justify-end">
            <button
              onClick={() => {
                setActiveTab("schedule");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="font-heading text-lg text-white hover:text-[#e10600] flex items-center gap-2 transition"
            >
              FULL SCHEDULE & TICKETS →
            </button>
          </div>
        </div>

        {/* Real-Time Live GameCenter & Box Score Drawer (Clean White Background) */}
        {gameCenterOpen && (
          <div className="bg-white border-t border-stone-200 border-b-4 border-[#e10600] text-[#222222] shadow-2xl py-6 px-4 sm:px-8 animate-fadeIn">
            <div className="max-w-[1280px] mx-auto space-y-6">
              {/* Header: Teams, Scores, Clock */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-stone-200">
                {/* Away Team */}
                <div className="flex items-center gap-4 text-center md:text-left">
                  <img
                    src={liveGame.visitor.logo}
                    alt={liveGame.visitor.name}
                    className="w-14 h-14 object-contain bg-stone-50 rounded-full p-1 border border-stone-200 shadow-sm shrink-0"
                  />
                  <div>
                    <span className="text-xs uppercase tracking-wider text-stone-500 font-heading block">VISITOR</span>
                    <h3 className="font-heading text-2xl sm:text-3xl text-[#222222] leading-none">
                      {liveGame.visitor.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-stone-600 font-mono">
                      <span>P1: {(liveGame.visitor.period_goals as any)?.["1"] ?? 0}</span>
                      <span>·</span>
                      <span>P2: {(liveGame.visitor.period_goals as any)?.["2"] ?? 0}</span>
                      <span>·</span>
                      <span>P3: {(liveGame.visitor.period_goals as any)?.["3"] ?? 0}</span>
                    </div>
                  </div>
                </div>

                {/* Big Score & Game Status */}
                <div className="text-center px-8 py-3 bg-stone-50 border border-stone-200 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-center gap-4">
                    <span className="font-heading text-5xl sm:text-6xl text-stone-800">
                      {liveGame.visitor.score}
                    </span>
                    <span className="font-heading text-3xl text-stone-300">–</span>
                    <span className="font-heading text-5xl sm:text-6xl text-[#e10600]">
                      {liveGame.home.score}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                    <span className="font-heading text-xs tracking-widest text-emerald-700 uppercase font-bold">
                      {liveGame.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-500 block font-questrial mt-0.5">
                    {liveGame.venue}
                  </span>
                </div>

                {/* Home Team */}
                <div className="flex items-center gap-4 text-center md:text-right flex-row-reverse">
                  <img
                    src={liveGame.home.logo}
                    alt={liveGame.home.name}
                    className="w-14 h-14 object-contain bg-stone-50 rounded-full p-1 border border-stone-200 shadow-sm shrink-0"
                  />
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#e10600] font-heading block">HOME</span>
                    <h3 className="font-heading text-2xl sm:text-3xl text-[#222222] leading-none">
                      {liveGame.home.name}
                    </h3>
                    <div className="flex items-center justify-end gap-2 mt-1 text-xs text-stone-600 font-mono">
                      <span>P1: {(liveGame.home.period_goals as any)?.["1"] ?? 0}</span>
                      <span>·</span>
                      <span>P2: {(liveGame.home.period_goals as any)?.["2"] ?? 0}</span>
                      <span>·</span>
                      <span>P3: {(liveGame.home.period_goals as any)?.["3"] ?? 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-tabs: Scoring / Penalties / Alerts */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setGameCenterTab("scoring")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                      gameCenterTab === "scoring"
                        ? "bg-[#e10600] text-white shadow"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                    }`}
                  >
                    🚨 Scoring Summary ({liveGame.goals.length})
                  </button>
                  <button
                    onClick={() => setGameCenterTab("penalties")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                      gameCenterTab === "penalties"
                        ? "bg-[#e10600] text-white shadow"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                    }`}
                  >
                    ⏱️ Penalties ({liveGame.penalties.length})
                  </button>
                  <button
                    onClick={() => setGameCenterTab("alerts")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                      gameCenterTab === "alerts"
                        ? "bg-[#e10600] text-white shadow"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                    }`}
                  >
                    🔔 Gameday Alerts
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const article = newsData.find((a) => a.id === 56);
                      if (article) setSelectedArticle(article);
                      setActiveTab("news");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="text-xs bg-[#e10600] hover:bg-[#c40500] text-white font-bold uppercase transition px-3 py-1.5 rounded shadow-sm cursor-pointer flex items-center gap-1"
                    title="Read Full Series Recap Article"
                  >
                    <span>Read Series Recap →</span>
                  </button>
                  {scheduleData.some((g: any) => g.is_live === true) ? (
                    <span className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block"></span>
                      <span>Live Auto-Sync (15s)</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-stone-600 font-bold uppercase tracking-wider flex items-center gap-1.5 bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-full">
                      <span>✓ Official Final Box Score</span>
                    </span>
                  )}
                  <button
                    onClick={() => setGameCenterOpen(false)}
                    className="text-xs text-stone-600 hover:text-black font-bold uppercase transition px-3 py-1.5 rounded bg-stone-100 hover:bg-stone-200 border border-stone-200 cursor-pointer"
                  >
                    ✕ Close Box Score
                  </button>
                </div>
              </div>

              {/* Tab 1: Scoring Summary */}
              {gameCenterTab === "scoring" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {liveGame.goals.map((goal: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 shadow-sm ${
                          goal.team_is_home
                            ? "bg-red-50/60 border-red-200"
                            : "bg-stone-50 border-stone-200"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-white text-stone-800 border border-stone-200 shadow-xs shrink-0">
                            P{goal.period} · {goal.time}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`font-bold text-xs ${goal.team_is_home ? "text-[#e10600]" : "text-stone-800"}`}>
                                {goal.team_name}
                              </span>
                              {goal.special && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-mono">
                                  {goal.special}
                                </span>
                              )}
                            </div>
                            <span className="font-heading text-base text-[#222222] block truncate">
                              {goal.scorer}
                            </span>
                            {(goal.assist1 || goal.assist2) && (
                              <span className="text-[11px] text-stone-500 font-questrial block truncate">
                                Assists: {[goal.assist1, goal.assist2].filter(Boolean).join(", ")}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-2xl shrink-0">🚨</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Penalties Log */}
              {gameCenterTab === "penalties" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {liveGame.penalties.map((pen: any, idx: number) => {
                      const isHome = pen.team_is_home ?? (pen.team_name?.toLowerCase().includes("state") || pen.team_name?.toLowerCase().includes("icepack"));
                      const teamLogo = isHome ? "/07cdeb598c1716ddf52f5438f9484da2.png" : "/teams/cincinnati.png";
                      const teamLabel = isHome ? "NC State" : (pen.team_name || "Cincinnati");

                      return (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 shadow-sm ${
                            isHome
                              ? "bg-red-50/60 border-red-200"
                              : "bg-stone-50 border-stone-200"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-white text-stone-800 border border-stone-200 shadow-xs shrink-0">
                              P{pen.period} · {pen.time}
                            </span>
                            <img
                              src={teamLogo}
                              alt={teamLabel}
                              className="w-6 h-6 object-contain bg-white rounded-full p-0.5 border border-stone-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className={`font-bold text-xs uppercase tracking-wide ${isHome ? "text-[#e10600]" : "text-stone-800"}`}>
                                  {teamLabel}
                                </span>
                                <span className="text-[11px] text-stone-500 font-questrial">
                                  · {pen.infraction}
                                </span>
                              </div>
                              <span className="font-heading text-base text-[#222222] block truncate">
                                {pen.player}
                              </span>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-1 rounded text-xs shrink-0">
                            {pen.minutes} Min
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 3: Live Fan Alerts Signup (Phone or Email for HubSpot) */}
              {gameCenterTab === "alerts" && (
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto text-center space-y-4 shadow-sm">
                  <span className="text-3xl block">📲</span>
                  <h4 className="font-heading text-2xl sm:text-3xl text-[#222222]">
                    NEVER MISS A GOAL · GAMEDAY SCORE ALERTS
                  </h4>
                  <p className="font-questrial text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                    Get real-time goal alerts, period score updates, and final scores delivered straight to your phone or inbox. <strong>No app required.</strong>
                  </p>

                  {alertSubmitted ? (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-400 rounded-xl text-emerald-900 text-xs font-bold shadow-xs">
                      ✓ You are subscribed to the Icepack Gameday Alert List! You will receive score updates for tonight&apos;s matchup.
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (alertPhone.trim()) {
                          setAlertSubmitted(true);
                        }
                      }}
                      className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
                    >
                      <input
                        type="text"
                        value={alertPhone}
                        onChange={(e) => setAlertPhone(e.target.value)}
                        placeholder="Enter mobile number or email"
                        className="px-4 py-2.5 rounded-lg bg-white border border-stone-300 text-stone-900 placeholder-stone-400 text-xs flex-1 focus:outline-none focus:border-[#e10600] shadow-xs"
                        required
                      />
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-[#e10600] hover:bg-[#c40500] text-white font-heading text-sm uppercase tracking-wider rounded-lg transition shrink-0 cursor-pointer shadow-sm"
                      >
                        Subscribe Alerts
                      </button>
                    </form>
                  )}
                  <span className="text-[10px] text-stone-400 block font-questrial">
                    Icepack Communications Network · Automated score alerts · Unsubscribe anytime.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* 4. MAIN CONTENT ROUTER */}
      <main className="flex-1">
        {/* ===================== HOME VIEW ===================== */}
        {activeTab === "home" && (
          <div className="flex flex-col">
            {/* High-Impact Dual Showcase: Two Ways to Support the Icepack */}
            <section className="px-4 sm:px-8 pt-8 max-w-[1280px] mx-auto w-full">
              {/* Header Label */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#e10600]">
                    SUPPORT THE PACK · 501(c)(3) NONPROFIT · EIN 46-4129861
                  </span>
                  <h2 className="font-heading text-3xl sm:text-4xl text-[#222222] leading-none mt-1">
                    TWO WAYS TO SUPPORT THE ICEPACK
                  </h2>
                </div>
                <span className="text-xs text-stone-500 font-questrial">
                  Self funded from day one · 100% community-driven
                </span>
              </div>

              {/* 2-Card Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                {/* Card 1: Football Ticket Raffle (Gold/Amber Accent) */}
                <div className="bg-gradient-to-br from-stone-900 via-[#1c1917] to-stone-900 border-2 border-amber-400 rounded-2xl p-6 text-white shadow-xl flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                  <div className="z-10">
                    <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🏈</span>
                        <span className="text-[11px] font-bold tracking-widest uppercase text-amber-400">
                          LIMITED-TIME RAFFLE
                        </span>
                      </div>
                      <span className="bg-red-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                        ⏳ Ends in ~10 Days
                      </span>
                    </div>

                    <div>
                      <h3 className="font-heading text-2xl sm:text-3xl text-white leading-tight">
                        WIN 2 TICKETS: NC STATE VS. UNC FOOTBALL
                      </h3>
                      <p className="font-questrial text-xs sm:text-sm text-stone-300 mt-1 leading-relaxed">
                        Enter to win <strong>2 Lower Bowl seats (Sec 315)</strong> at Kenan Stadium on Saturday, Nov 28 plus a <strong>Rams Head Deck parking pass</strong>. Drawing Fri Nov 27 @ 8 PM.
                      </p>
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-white/10 flex flex-wrap items-center gap-3 z-10">
                    <button
                      onClick={() => {
                        setActiveTab("raffle");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="flex-1 sm:flex-initial px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-900 font-heading text-sm tracking-wider uppercase rounded-xl transition font-bold shadow text-center cursor-pointer"
                    >
                      ENTER RAFFLE NOW →
                    </button>
                    <a
                      href="https://store.icepackhockey.com/store/p87/UNC%2FNCSU_Football_Ticket_Raffle.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-heading text-sm tracking-wider uppercase rounded-xl transition border border-white/20 text-center"
                    >
                      Checkout ($8) ↗
                    </a>
                  </div>
                </div>

                {/* Card 2: 50th Year Anniversary Annual Fund (Red/Wolfpack Accent) */}
                <div className="bg-gradient-to-br from-[#1a1a1a] via-[#221010] to-[#1a1a1a] border-2 border-[#e10600] rounded-2xl p-6 text-white shadow-xl flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#e10600]/15 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                  <div className="z-10">
                    <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🐺</span>
                        <span className="text-[11px] font-bold tracking-widest uppercase text-red-400">
                          ANNUAL FUND
                        </span>
                      </div>
                      <span className="bg-white/15 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        501(c)(3) Tax-Deductible
                      </span>
                    </div>

                    <div>
                      <h3 className="font-heading text-2xl sm:text-3xl text-white leading-tight">
                        50TH ANNIVERSARY ANNUAL FUND
                      </h3>
                      <p className="font-questrial text-xs sm:text-sm text-stone-300 mt-1 leading-relaxed">
                        <strong>Self funded from day one.</strong> Direct tax-deductible gifts fuel player travel, ice time, and equipment. Giving tiers from <strong>$25 to $1,976</strong> include in-arena ticket credits!
                      </p>
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-white/10 flex flex-wrap items-center gap-3 z-10">
                    <button
                      onClick={() => {
                        setActiveTab("support");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="flex-1 sm:flex-initial px-5 py-2.5 bg-[#e10600] hover:bg-[#c40500] text-white font-heading text-sm tracking-wider uppercase rounded-xl transition font-bold shadow text-center cursor-pointer"
                    >
                      SUPPORT THE ANNUAL FUND →
                    </button>
                    <a
                      href="https://givebutter.com/icepack50"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-heading text-sm tracking-wider uppercase rounded-xl transition border border-white/20 text-center"
                    >
                      Donate Online ↗
                    </a>
                  </div>
                </div>
              </div>
            </section>
            {/* Featured Story Hero */}
            <section className="px-4 sm:px-8 py-10 max-w-[1280px] mx-auto w-full">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#f8f9fa] border border-[#e5e5e5] rounded-lg overflow-hidden shadow-sm">
                <div className="lg:col-span-7 h-[360px] sm:h-[460px] overflow-hidden bg-gray-100">
                  <img
                    src={newsData[0].image_url || "/f24c1491d6dab19fe6b3b4e7ec20b6cc.jpg"}
                    alt="NC State IcePack in Action"
                    className="w-full h-full object-cover hover:scale-105 transition duration-700"
                    onError={(e: any) => {
                      e.target.src = "/f24c1491d6dab19fe6b3b4e7ec20b6cc.jpg";
                    }}
                  />
                </div>
                <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col gap-4">
                  <span className="text-xs font-bold tracking-widest uppercase text-[#e10600]">
                    {newsData[0].category.toUpperCase()} · {newsData[0].date}
                  </span>
                  <h1 className="font-heading text-3xl sm:text-5xl text-[#222222] leading-[0.95]">
                    {newsData[0].title.toUpperCase()}
                  </h1>
                  <p className="font-questrial text-base text-[#444444] leading-relaxed">
                    {newsData[0].summary}
                  </p>
                  <div className="flex items-center gap-4 pt-2">
                    <button
                      onClick={() => {
                        setSelectedArticle(newsData[0]);
                        setActiveTab("news");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="px-6 py-3 bg-[#e10600] hover:bg-[#c40500] text-white font-heading text-lg rounded shadow transition"
                    >
                      READ FULL STORY
                    </button>
                    <span className="text-xs text-[#626262] font-medium">{newsData[0].author}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Secondary News Cards (Real 2026-27 reporting from Sage Kimbro & interns) */}
            <section className="px-4 sm:px-8 pb-12 max-w-[1280px] mx-auto w-full">
              <div className="flex items-center justify-between border-b-2 border-[#e10600] pb-2 mb-6">
                <div>
                  <h2 className="font-heading text-3xl text-[#222222]">LATEST TEAM STORIES & RECAPS</h2>
                  <span className="text-xs text-[#626262]">Written and photographed by the IcePack student media staff</span>
                </div>
                <button
                  onClick={() => {
                    setActiveTab("news");
                    setSelectedArticle(null);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-xs font-bold text-[#e10600] hover:underline uppercase tracking-wider"
                >
                  View All Stories & Articles →
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {newsData.slice(1, 4).map((story) => (
                  <div
                    key={story.id}
                    onClick={() => {
                      setSelectedArticle(story);
                      setActiveTab("news");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="group cursor-pointer flex flex-col bg-white border border-[#e5e5e5] rounded-lg overflow-hidden hover:shadow-md transition"
                  >
                    <div className="h-48 overflow-hidden bg-gray-100">
                      <img
                        src={story.image_url || "/ef1291f3d2f58d44ad9f2230c36f233a.jpg"}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={(e: any) => {
                          e.target.src = "/ef1291f3d2f58d44ad9f2230c36f233a.jpg";
                        }}
                      />
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-[#e10600] uppercase tracking-wider">
                          {story.category} · {story.date}
                        </span>
                        <h3 className="font-heading text-2xl text-[#222222] mt-1 leading-snug group-hover:text-[#e10600] transition">
                          {story.title}
                        </h3>
                        <p className="font-questrial text-sm text-[#555555] mt-2 line-clamp-2 leading-relaxed">
                          {story.summary}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                        <span className="text-[#777777] truncate">{story.author}</span>
                        <span className="font-bold text-[#e10600]">Read →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* COMPACT NEXT GAME & STAY CONNECTED (SIDE-BY-SIDE HALF PAGE) */}
            <section className="px-4 sm:px-8 py-8 max-w-[1280px] mx-auto w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {/* 1. Next Game Card (Half Page) */}
                <div className="bg-[#e10600] text-white rounded-xl p-6 sm:p-7 shadow-md flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 border-b border-white/20 pb-2 mb-4">
                      <span className="text-[11px] font-bold tracking-widest uppercase text-white/90">
                        NEXT GAME · ROAD MATCHUP
                      </span>
                      <span className="text-[10px] font-bold uppercase bg-white/20 px-2 py-0.5 rounded">
                        ACHA D1
                      </span>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 mb-4">
                      {/* Compact Date Badge */}
                      <div className="bg-white text-[#e10600] rounded-lg p-3 w-20 h-20 flex flex-col items-center justify-center text-center shadow flex-shrink-0">
                        <span className="font-heading text-base tracking-wider leading-none">NOV</span>
                        <span className="font-heading text-4xl leading-none font-bold my-0.5">20</span>
                        <span className="text-[9px] font-bold text-[#222222] tracking-wider uppercase leading-none">FRI · 8 PM</span>
                      </div>

                      {/* Opponent Logo & Matchup Details */}
                      <div className="flex items-center gap-3">
                        <img
                          src="/teams/george-mason.png"
                          alt="George Mason Patriots"
                          className="w-12 h-12 sm:w-14 sm:h-14 object-contain bg-white rounded-full p-1 shadow-sm shrink-0"
                          onError={(e: any) => { e.target.style.display = 'none'; }}
                        />
                        <div>
                          <h3 className="font-heading text-2xl sm:text-3xl text-white leading-tight">
                            ICEPACK AT{" "}
                            <a
                              href="https://gmuhockey.com/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-red-100 transition underline underline-offset-4 decoration-white/40 hover:decoration-white"
                              title="Visit George Mason Hockey Club Website"
                            >
                              GEORGE MASON
                            </a>
                          </h3>
                          <p className="font-questrial text-xs text-white/90 mt-1">
                            Prince William Ice Center · Dale City, VA
                          </p>
                          <span className="text-[11px] text-white/80 font-questrial block mt-0.5">
                            Friday Night Road Matchup · ACHA Division I
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/20">
                    <button
                      onClick={() => {
                        setActiveTab("schedule");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="py-2.5 px-4 bg-white text-[#e10600] hover:bg-[#222222] hover:text-white font-heading text-base tracking-wider uppercase text-center rounded shadow transition cursor-pointer"
                    >
                      FULL SCHEDULE →
                    </button>
                    <button
                      onClick={() => {
                        setGameCenterOpen(true);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="py-2.5 px-4 border border-white text-white hover:bg-white/10 font-heading text-base tracking-wider uppercase text-center rounded transition cursor-pointer"
                    >
                      LAST BOX SCORE (OT) ▾
                    </button>
                  </div>
                  <p className="text-[10px] text-white/75 font-questrial italic text-center mt-2">
                    Pack earns 1 point in overtime vs Cincinnati, moving to {ncStateTeam.points} points ({ncStateRankOrdinal} in SECHL).
                  </p>
                </div>

                {/* 2. Stay Connected: Newsletter & Social Media Logos (Half Page) */}
                <div className="bg-[#222222] text-white rounded-xl p-6 sm:p-7 shadow-md flex flex-col justify-between border border-[#333333]">
                  <div>
                    <div className="flex items-center justify-between gap-2 border-b border-[#333333] pb-2 mb-4">
                      <span className="text-[11px] font-bold tracking-widest uppercase text-[#e10600]">
                        JOIN THE PACK NATION
                      </span>
                      <span className="text-[10px] font-questrial text-white/60">
                        Official Updates
                      </span>
                    </div>

                    <h3 className="font-heading text-2xl sm:text-3xl text-white leading-tight">
                      STAY CONNECTED WITH THE PACK
                    </h3>
                    <p className="font-questrial text-xs text-white/70 mt-1 leading-relaxed">
                      Sign up for gameday drops, ticket presales, and follow official team channels:
                    </p>

                    {/* Inline Compact Newsletter */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        alert("Thank you for subscribing to Icepack updates!");
                      }}
                      className="flex gap-2 mt-4"
                    >
                      <input
                        type="email"
                        required
                        placeholder="Enter your email address..."
                        className="px-3.5 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/40 text-xs focus:outline-none focus:border-[#e10600] flex-1 font-questrial transition"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#e10600] hover:bg-[#b00400] text-white font-heading text-sm tracking-wider uppercase rounded transition shadow-sm whitespace-nowrap"
                      >
                        JOIN
                      </button>
                    </form>
                  </div>

                  {/* Clean Social Media Logos Strip */}
                  <div className="pt-4 border-t border-[#333333] mt-4 flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[11px] font-heading uppercase tracking-wider text-white/80">
                      Follow The Team:
                    </span>
                    <div className="flex items-center gap-2">
                      {/* Instagram */}
                      <a
                        href="https://www.instagram.com/ncstatehockey/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram @ncstatehockey"
                        className="w-9 h-9 rounded-lg bg-[#2a2a2a] hover:bg-[#e10600] text-white flex items-center justify-center transition border border-[#444444] hover:border-[#e10600]"
                        title="Instagram: @ncstatehockey"
                      >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </a>

                      {/* X / Twitter */}
                      <a
                        href="https://x.com/NCStateHockey"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="X @NCStateHockey"
                        className="w-9 h-9 rounded-lg bg-[#2a2a2a] hover:bg-[#e10600] text-white flex items-center justify-center transition border border-[#444444] hover:border-[#e10600]"
                        title="X / Twitter: @NCStateHockey"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </a>

                      {/* YouTube */}
                      <a
                        href="https://www.youtube.com/@WolfpackSportsTelevision"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="YouTube Wolfpack Sports Television"
                        className="w-9 h-9 rounded-lg bg-[#2a2a2a] hover:bg-[#e10600] text-white flex items-center justify-center transition border border-[#444444] hover:border-[#e10600]"
                        title="YouTube: @WolfpackSportsTelevision"
                      >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      </a>

                      {/* Facebook */}
                      <a
                        href="https://www.facebook.com/NcStateIceHockey"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Facebook NC State Ice Hockey"
                        className="w-9 h-9 rounded-lg bg-[#2a2a2a] hover:bg-[#e10600] text-white flex items-center justify-center transition border border-[#444444] hover:border-[#e10600]"
                        title="Facebook: NC State Ice Hockey"
                      >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </a>

                      {/* LinkedIn */}
                      <a
                        href="https://www.linkedin.com/company/icepack-hockey"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn Icepack Hockey"
                        className="w-9 h-9 rounded-lg bg-[#2a2a2a] hover:bg-[#e10600] text-white flex items-center justify-center transition border border-[#444444] hover:border-[#e10600]"
                        title="LinkedIn: Icepack Hockey"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ===================== SCHEDULE VIEW ===================== */}
        {activeTab === "schedule" && (
          <div className="px-4 sm:px-8 py-10 max-w-[1280px] mx-auto w-full">
            <div className="border-b-2 border-[#e10600] pb-4 mb-8 flex flex-wrap justify-between items-end gap-4">
              <div>
                <span className="text-xs font-bold tracking-widest uppercase text-[#e10600]">
                  ACHA DIVISION I · 50TH SEASON
                </span>
                <h1 className="font-heading text-3xl sm:text-5xl text-[#222222] leading-none mt-1">SCHEDULE & TICKETS</h1>
                <p className="font-questrial text-sm text-[#555555] mt-2">
                  All times Eastern. Home games at Lane Arena @ Wake Competition Center unless noted.
                </p>
              </div>

              {/* View Toggle: Current 2026-27 vs Season Archives */}
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
                  <button
                    onClick={() => setScheduleView("current")}
                    className={`px-4 py-2 rounded font-heading text-base uppercase transition ${
                      scheduleView === "current"
                        ? "bg-[#e10600] text-white shadow-sm"
                        : "text-[#444444] hover:bg-gray-200"
                    }`}
                  >
                    2026–27 Season
                  </button>
                  <button
                    onClick={() => setScheduleView("archive")}
                    className={`px-4 py-2 rounded font-heading text-base uppercase transition ${
                      scheduleView === "archive"
                        ? "bg-[#e10600] text-white shadow-sm"
                        : "text-[#444444] hover:bg-gray-200"
                    }`}
                  >
                    Season Archives (2019–2026)
                  </button>
                </div>

                {/* Calendar Subscription Dropdown */}
                {scheduleView === "current" && (
                  <div className="relative">
                    <button
                      onClick={() => setCalDropdownOpen(!calDropdownOpen)}
                      className="px-4 py-2 bg-[#222222] hover:bg-[#333333] text-white rounded font-heading text-base tracking-wider uppercase flex items-center gap-2 transition"
                    >
                      📅 SUBSCRIBE ▼
                    </button>
                    {calDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white border border-[#e5e5e5] rounded shadow-xl py-2 z-50">
                        <a
                          href="https://calendar.google.com/calendar/render?cid=webcal://www.icepackhockey.com/cal/icepack-2026-27-season.ics"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block px-4 py-2 text-xs font-semibold hover:bg-gray-100 text-[#222222]"
                        >
                          Google Calendar
                        </a>
                        <a
                          href="webcal://www.icepackhockey.com/cal/icepack-2026-27-season.ics"
                          className="block px-4 py-2 text-xs font-semibold hover:bg-gray-100 text-[#222222]"
                        >
                          Apple Calendar (iCal)
                        </a>
                        <a
                          href="https://outlook.live.com/calendar/0/addfromweb?url=https://www.icepackhockey.com/cal/icepack-2026-27-season.ics"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block px-4 py-2 text-xs font-semibold hover:bg-gray-100 text-[#222222]"
                        >
                          Outlook.com
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* CURRENT SEASON VIEW */}
            {scheduleView === "current" && (
              <div>
                {/* 3 COMPACT TICKET CARDS (Swipeable carousel on mobile, 3-column grid on desktop) */}
                <div className="flex sm:grid sm:grid-cols-3 gap-3 sm:gap-4 overflow-x-auto sm:overflow-visible pb-3 sm:pb-0 mb-6 sm:mb-8 snap-x">
                  <div className="min-w-[260px] sm:min-w-0 snap-center border border-[#e5e5e5] rounded-lg p-4 bg-white shadow-sm flex flex-col justify-between items-center text-center">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#626262]">SPRING 2027</span>
                      <h3 className="font-heading text-xl text-[#222222] mt-0.5">SPRING SEMESTER PASS</h3>
                    </div>
                    <div className="my-1.5">
                      <span className="font-heading text-2xl sm:text-3xl text-[#e10600] block">$40</span>
                      <span className="text-[10px] text-neutral-500 font-questrial italic block mt-0.5">
                        * Governor&apos;s Cup ticket is not included
                      </span>
                    </div>
                    <a
                      href="https://icepackhockey.ticketsauce.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-[#222222] hover:bg-[#111111] text-white font-heading text-sm sm:text-base text-center rounded transition"
                    >
                      SPRING PASS TICKETS ↗
                    </a>
                  </div>

                  <div className="min-w-[260px] sm:min-w-0 snap-center border border-[#e5e5e5] rounded-lg p-4 bg-white shadow-sm flex flex-col justify-between items-center text-center">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#626262]">NCSU STUDENTS</span>
                      <h3 className="font-heading text-xl text-[#222222] mt-0.5">STUDENT SPRING PASS</h3>
                    </div>
                    <div className="my-1.5">
                      <span className="font-heading text-2xl sm:text-3xl text-[#e10600] block">$15</span>
                      <span className="text-[10px] text-neutral-500 font-questrial italic block mt-0.5">
                        * Governor&apos;s Cup ticket is not included
                      </span>
                    </div>
                    <a
                      href="https://icepackhockey.ticketsauce.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-[#222222] hover:bg-[#111111] text-white font-heading text-sm sm:text-base text-center rounded transition"
                    >
                      BUY STUDENT PASS ↗
                    </a>
                  </div>

                  <div className="min-w-[260px] sm:min-w-0 snap-center border-2 border-[#e10600] rounded-lg p-4 bg-white shadow-sm flex flex-col justify-between items-center text-center">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#e10600]">INDIVIDUAL GAMES</span>
                      <h3 className="font-heading text-xl text-[#222222] mt-0.5">SINGLE GAME TICKETS</h3>
                    </div>
                    <span className="font-heading text-xl sm:text-2xl text-[#e10600] my-2">$6 STUDENTS / $15 ADULTS</span>
                    <a
                      href="https://icepackhockey.ticketsauce.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-[#e10600] hover:bg-[#c40500] text-white font-heading text-sm sm:text-base text-center rounded transition shadow-sm"
                    >
                      BUY ON TICKETSAUCE ↗
                    </a>
                  </div>
                </div>

                {/* Filter Pills & View Mode */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { id: "all", label: `All Games (${scheduleData.length})` },
                      { id: "home", label: "Home Only" },
                      { id: "away", label: "Away & Neutral" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setScheduleFilter(f.id)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
                          scheduleFilter === f.id
                            ? "bg-[#e10600] text-white"
                            : "bg-gray-100 text-[#444444] hover:bg-gray-200"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}

                    <span className="text-gray-300 mx-1 hidden sm:inline">|</span>

                    {/* Table View vs Calendar View Toggles */}
                    <button
                      onClick={() => setScheduleMode("table")}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 ${
                        scheduleMode === "table"
                          ? "bg-[#222222] text-white shadow-sm"
                          : "bg-gray-100 text-[#444444] hover:bg-gray-200"
                      }`}
                    >
                      📋 Table View
                    </button>
                    <button
                      onClick={() => setScheduleMode("calendar")}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 ${
                        scheduleMode === "calendar"
                          ? "bg-[#e10600] text-white shadow-sm"
                          : "bg-gray-100 text-[#444444] hover:bg-gray-200"
                      }`}
                    >
                      📅 Calendar View
                    </button>
                  </div>
                </div>

                {/* Schedule Table / Card View */}
                {scheduleMode === "table" && (
                  <div>
                    {/* Mobile Matchup Cards (< md) */}
                    <div className="md:hidden flex flex-col gap-3">
                      {filteredGames.map((game) => {
                        const isNextGame = game.id === 19; // Fri Nov 20 at George Mason
                        const isHome = game.ha === "H";
                        return (
                          <div
                            key={game.id}
                            className={`bg-white rounded-xl border p-4 shadow-sm transition flex flex-col gap-3 ${
                              isNextGame
                                ? "border-[#e10600] ring-2 ring-[#e10600]/20 bg-red-50/20"
                                : "border-[#e5e5e5]"
                            }`}
                          >
                            {/* Top Header: Date, Time & Status Badges */}
                            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                              <div className="flex items-center gap-2">
                                <span className={`font-bold text-sm tracking-wide ${isNextGame ? "text-[#e10600]" : "text-[#222222]"}`}>
                                  {game.date}
                                </span>
                                <span className="text-gray-300">·</span>
                                <span className="text-xs text-[#626262] font-semibold">{game.time}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {isNextGame && (
                                  <span className="bg-[#e10600] text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                                    NEXT GAME
                                  </span>
                                )}
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                    isHome
                                      ? "bg-[#e10600]/10 text-[#e10600] border border-[#e10600]/30"
                                      : "bg-gray-100 text-[#555555]"
                                  }`}
                                >
                                  {isHome ? "HOME" : game.ha === "N" ? "NEUTRAL" : "AWAY"}
                                </span>
                              </div>
                            </div>

                            {/* Matchup & Opponent */}
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {(game as any).opponent_logo && (
                                    <img
                                      src={(game as any).opponent_logo}
                                      alt={`${game.opponent} logo`}
                                      className="w-7 h-7 object-contain rounded shrink-0 bg-gray-50 p-0.5 border border-gray-100"
                                      onError={(e: any) => { e.target.style.display = 'none'; }}
                                    />
                                  )}
                                  <h3 className="font-heading text-2xl text-[#222222] tracking-wide leading-tight truncate">
                                    {game.ha === "A" ? "AT " : "VS "}
                                    {(game as any).opponent_url ? (
                                      <a
                                        href={(game as any).opponent_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-[#e10600] transition underline underline-offset-2 decoration-gray-300 hover:decoration-[#e10600]"
                                        title={`Visit ${game.opponent} Hockey Club Website`}
                                      >
                                        {game.opponent.toUpperCase()}
                                        <span className="text-xs text-gray-400 ml-1">↗</span>
                                      </a>
                                    ) : (
                                      game.opponent.toUpperCase()
                                    )}
                                  </h3>
                                </div>
                                {game.broadcast && (
                                  <span className="shrink-0 inline-flex items-center gap-1 bg-[#111111] text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wider">
                                    <span className="text-[#e10600]">▶</span> {game.broadcast}
                                  </span>
                                )}
                              </div>

                              {/* Location & Maps Link */}
                              <div className="mt-1">
                                <a
                                  href={game.map_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-[#555555] hover:text-[#e10600] inline-flex items-center gap-1.5 transition"
                                >
                                  <span className="text-[#e10600]">📍</span>
                                  <span className="underline underline-offset-2">{game.location}</span>
                                  <span className="text-[10px] text-gray-400">↗</span>
                                </a>
                              </div>

                              {/* Special Game Note */}
                              {game.note && (
                                <div className="mt-1.5 text-xs text-[#e10600] font-semibold flex items-center gap-1">
                                  <span>★</span>
                                  <span>{game.note}</span>
                                </div>
                              )}
                            </div>

                            {/* Action Row / Game Result */}
                            <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between gap-3">
                              {(game as any).is_live || (game.result && game.result.toLowerCase().includes("live")) ? (
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-red-600 animate-ping inline-block"></span>
                                    <span className="px-2.5 py-1 rounded text-xs font-bold tracking-wide bg-red-600 text-white animate-pulse">
                                      🔴 {game.result || "LIVE 0–1"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        setGameCenterOpen(true);
                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                      }}
                                      className="px-2.5 py-1 bg-[#e10600] text-white hover:bg-[#b00400] rounded text-xs font-bold transition shadow-xs cursor-pointer"
                                    >
                                      Live Box Score ▾
                                    </button>
                                    {(game as any).boxscore_url && (
                                      <a
                                        href={(game as any).boxscore_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-xs font-bold transition border border-stone-200"
                                      >
                                        ACHA ↗
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ) : game.result ? (
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                      RESULT:
                                    </span>
                                    <span
                                      className={`px-2.5 py-1 rounded text-xs font-bold tracking-wide ${
                                        game.result.startsWith("W")
                                          ? "bg-emerald-100 text-emerald-800"
                                          : game.result.startsWith("L")
                                          ? "bg-red-100 text-red-800"
                                          : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {game.result}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {(game as any).boxscore_url && (
                                      <a
                                        href={(game as any).boxscore_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-2.5 py-1 bg-stone-100 hover:bg-[#e10600] hover:text-white rounded text-xs font-bold text-stone-700 transition border border-stone-200"
                                      >
                                        Box Score ↗
                                      </a>
                                    )}
                                    {(game as any).recap_article_id && (
                                      <button
                                        onClick={() => {
                                          const article = newsData.find(
                                            (a) => a.id === (game as any).recap_article_id
                                          );
                                          if (article) {
                                            setSelectedArticle(article);
                                          } else {
                                            setSelectedArticle(null);
                                          }
                                          setActiveTab("news");
                                          window.scrollTo({ top: 0, behavior: "smooth" });
                                        }}
                                        className="px-2.5 py-1 bg-gray-100 hover:bg-[#e10600] hover:text-white rounded text-xs font-bold uppercase tracking-wider text-[#222222] transition border border-gray-200"
                                      >
                                        Recap →
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ) : isHome ? (
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-xs text-[#626262] font-medium">Ticketsauce Gate</span>
                                  <a
                                    href={game.ticket_url || "https://icepackhockey.ticketsauce.com/"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-[#e10600] hover:bg-[#c40500] text-white text-xs font-heading tracking-wider uppercase rounded shadow-sm transition"
                                  >
                                    BUY TICKETS ↗
                                  </a>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between w-full text-xs text-gray-500">
                                  <span>Away Game</span>
                                  <span className="font-semibold text-gray-600">Scheduled</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Desktop Table View (>= md) */}
                    <div className="hidden md:block bg-white border border-[#e5e5e5] rounded-lg overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-[#222222] text-white text-xs font-heading tracking-wider">
                            <tr>
                              <th className="py-3 px-4">DATE</th>
                              <th className="py-3 px-4">TIME</th>
                              <th className="py-3 px-4">OPPONENT</th>
                              <th className="py-3 px-4 hidden md:table-cell">LOCATION</th>
                              <th className="py-3 px-4">RESULT / STATUS</th>
                              <th className="py-3 px-4 text-right">ACTION</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#e5e5e5] font-questrial">
                            {filteredGames.map((game) => {
                              const isNextGame = game.id === 19; // Fri Nov 20 at George Mason
                              return (
                                <tr
                                  key={game.id}
                                  className={`transition ${
                                    isNextGame
                                      ? "bg-[#fff5f5] border-l-4 border-[#e10600] shadow-sm font-semibold"
                                      : "hover:bg-gray-50"
                                  }`}
                                >
                                  {/* Date */}
                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    <span className={`font-bold text-sm ${isNextGame ? "text-[#e10600]" : "text-[#222222]"}`}>
                                      {game.date}
                                    </span>
                                  </td>

                                  {/* Time */}
                                  <td className="py-3.5 px-4 text-[#555555] whitespace-nowrap text-sm">
                                    {game.time}
                                  </td>

                                  {/* Opponent & Broadcast Badge */}
                                  <td className="py-3.5 px-4 font-medium text-[#222222]">
                                    <div className="flex flex-col gap-1">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <div className="flex items-center gap-2">
                                          {(game as any).opponent_logo && (
                                            <img
                                              src={(game as any).opponent_logo}
                                              alt={`${game.opponent} logo`}
                                              className="w-6 h-6 object-contain rounded shrink-0 bg-gray-50 p-0.5 border border-gray-100"
                                              onError={(e: any) => { e.target.style.display = 'none'; }}
                                            />
                                          )}
                                          <span className="font-bold text-base font-heading tracking-wide">
                                            {game.ha === "A" ? "at " : "vs "}
                                            {(game as any).opponent_url ? (
                                              <a
                                                href={(game as any).opponent_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:text-[#e10600] transition underline underline-offset-2 decoration-gray-300 hover:decoration-[#e10600]"
                                                title={`Visit ${game.opponent} Hockey Club Website`}
                                              >
                                                {game.opponent}
                                                <span className="text-xs text-gray-400 ml-1 font-sans">↗</span>
                                              </a>
                                            ) : (
                                              game.opponent
                                            )}
                                          </span>
                                        </div>
                                        {isNextGame && (
                                          <span className="bg-[#e10600] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                            NEXT HOME GAME
                                          </span>
                                        )}
                                        {game.broadcast && (
                                          <span className="inline-flex items-center gap-1 bg-[#111111] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded tracking-wider">
                                            <span className="text-[#e10600]">▶</span> {game.broadcast}
                                          </span>
                                        )}
                                      </div>
                                      {game.note && (
                                        <span className="text-[11px] text-[#e10600] font-semibold">
                                          {game.note}
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* Location (Compact & Clean) */}
                                  <td className="py-3.5 px-3 text-xs hidden md:table-cell max-w-[210px] truncate">
                                    <a
                                      href={game.map_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[#444444] hover:text-[#e10600] inline-flex items-center gap-1 group transition truncate"
                                      title="Get Directions in Google / Apple Maps"
                                    >
                                      <span className="text-[#e10600] text-sm shrink-0">📍</span>
                                      <span className="group-hover:underline truncate">{game.location}</span>
                                    </a>
                                  </td>

                                  {/* Result or Status */}
                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    {(game as any).is_live || (game.result && game.result.toLowerCase().includes("live")) ? (
                                      <span className="px-2.5 py-1 rounded text-xs font-bold bg-red-600 text-white animate-pulse flex items-center gap-1.5 w-fit">
                                        <span className="w-2 h-2 rounded-full bg-white animate-ping inline-block"></span>
                                        <span>🔴 {game.result || "LIVE 0–1"}</span>
                                      </span>
                                    ) : game.result ? (
                                      <span
                                        className={`px-2.5 py-1 rounded text-xs font-bold ${
                                          game.result.startsWith("W")
                                            ? "bg-emerald-100 text-emerald-800"
                                            : game.result.startsWith("L")
                                            ? "bg-red-100 text-red-800"
                                            : "bg-gray-100 text-gray-800"
                                        }`}
                                      >
                                        {game.result}
                                      </span>
                                    ) : (
                                      <span className="text-xs text-[#777777] font-semibold">Scheduled</span>
                                    )}
                                  </td>

                                  {/* Action: Box Score & Tickets / Recap */}
                                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                    {(game as any).is_live || (game.result && game.result.toLowerCase().includes("live")) ? (
                                      <div className="flex items-center justify-end gap-2">
                                        <button
                                          onClick={() => {
                                            setGameCenterOpen(true);
                                            window.scrollTo({ top: 0, behavior: "smooth" });
                                          }}
                                          className="px-2.5 py-1 bg-[#e10600] hover:bg-[#b00400] text-white rounded text-xs font-bold transition shadow-xs cursor-pointer animate-pulse"
                                        >
                                          Live Box Score ▾
                                        </button>
                                        {(game as any).boxscore_url && (
                                          <a
                                            href={(game as any).boxscore_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-xs font-bold transition border border-stone-200 inline-block shadow-xs"
                                            title="View Official ACHA Game Box Score"
                                          >
                                            ACHA Feed ↗
                                          </a>
                                        )}
                                      </div>
                                    ) : game.result ? (
                                      <div className="flex items-center justify-end gap-2">
                                        {(game as any).boxscore_url && (
                                          <a
                                            href={(game as any).boxscore_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-2.5 py-1 bg-stone-100 hover:bg-[#e10600] hover:text-white rounded text-xs font-bold text-stone-700 transition border border-stone-200 inline-block shadow-xs"
                                            title="View Official ACHA Game Box Score"
                                          >
                                            Box Score ↗
                                          </a>
                                        )}
                                        {(game as any).recap_article_id && (
                                          <button
                                            onClick={() => {
                                              const article = newsData.find(
                                                (a) => a.id === (game as any).recap_article_id
                                              );
                                              if (article) {
                                                setSelectedArticle(article);
                                              } else {
                                                setSelectedArticle(null);
                                              }
                                              setActiveTab("news");
                                              window.scrollTo({ top: 0, behavior: "smooth" });
                                            }}
                                            className="text-xs font-bold text-[#e10600] hover:underline"
                                          >
                                            Recap →
                                          </button>
                                        )}
                                      </div>
                                    ) : game.ha === "H" ? (
                                      <a
                                        href={game.ticket_url || "https://icepackhockey.ticketsauce.com/"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3.5 py-1.5 bg-[#e10600] hover:bg-[#c40500] text-white text-xs font-heading rounded tracking-wider transition shadow-sm inline-block"
                                      >
                                        TICKETS
                                      </a>
                                    ) : (
                                      <span className="text-xs text-gray-400 font-mono">Away</span>
                                    )}
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

              {/* Schedule Calendar View */}
              {scheduleMode === "calendar" && (
                <div className="bg-white border border-[#e5e5e5] rounded-lg p-4 sm:p-6 shadow-sm">
                  {/* Month Selector Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#e5e5e5] mb-6">
                    <div className="flex items-center gap-3">
                      <button
                        disabled={calMonthIdx === 0}
                        onClick={() => setCalMonthIdx(calMonthIdx - 1)}
                        className="px-3 py-1.5 border border-[#e5e5e5] rounded text-xs font-bold uppercase hover:bg-gray-100 disabled:opacity-30 transition font-heading"
                      >
                        ← Prev
                      </button>
                      <span className="font-heading text-3xl text-[#222222] min-w-[200px] text-center tracking-wide">
                        {seasonMonths[calMonthIdx].label}
                      </span>
                      <button
                        disabled={calMonthIdx === seasonMonths.length - 1}
                        onClick={() => setCalMonthIdx(calMonthIdx + 1)}
                        className="px-3 py-1.5 border border-[#e5e5e5] rounded text-xs font-bold uppercase hover:bg-gray-100 disabled:opacity-30 transition font-heading"
                      >
                        Next →
                      </button>
                    </div>

                    {/* Month Quick Select Pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {seasonMonths.map((m, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCalMonthIdx(idx)}
                          className={`px-3 py-1 rounded text-xs font-bold uppercase transition ${
                            calMonthIdx === idx
                              ? "bg-[#e10600] text-white shadow-sm"
                              : "bg-gray-100 text-[#555555] hover:bg-gray-200"
                          }`}
                        >
                          {m.label.split(" ")[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 7-Day Calendar Grid (Scrollable on mobile) */}
                  <div className="overflow-x-auto">
                    <div className="min-w-[650px] grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden text-xs">
                    {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
                      <div key={d} className="bg-[#222222] text-white font-heading text-sm text-center py-2.5 tracking-wider">
                        {d}
                      </div>
                    ))}

                    {/* Render Month Cells */}
                    {(() => {
                      const cur = seasonMonths[calMonthIdx];
                      const daysInMonth = new Date(cur.year, cur.month + 1, 0).getDate();
                      const startDay = new Date(cur.year, cur.month, 1).getDay(); // 0 = Sun
                      const cells = [];

                      // Padding blanks before month start
                      for (let i = 0; i < startDay; i++) {
                        cells.push(
                          <div key={`blank-${i}`} className="bg-gray-50/70 min-h-[120px] p-2 text-gray-300"></div>
                        );
                      }

                      // Days of the month
                      for (let day = 1; day <= daysInMonth; day++) {
                        const dayStr = `${cur.year}-${String(cur.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                        const dayGames = filteredGames.filter((g) => g.isoDate === dayStr);

                        cells.push(
                          <div
                            key={`day-${day}`}
                            className={`bg-white min-h-[120px] p-2 flex flex-col justify-between transition border-t border-gray-100 ${
                              dayGames.length > 0 ? "hover:bg-red-50/20" : ""
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <span
                                className={`text-xs font-bold ${
                                  dayGames.length > 0 ? "text-[#e10600] font-heading text-lg" : "text-gray-400"
                                }`}
                              >
                                {day}
                              </span>
                              {dayGames.length > 0 && dayGames[0].ha === "H" && (
                                <span className="text-[9px] font-bold bg-[#e10600] text-white px-1.5 py-0.5 rounded uppercase tracking-wider">
                                  HOME
                                </span>
                              )}
                            </div>

                            {/* Game Cards in Day Cell */}
                            <div className="flex-1 flex flex-col gap-1.5 mt-1 justify-center">
                              {dayGames.map((g) => {
                                const isNext = g.id === 17;
                                return (
                                  <div
                                    key={g.id}
                                    className={`p-2 rounded text-[11px] leading-tight border flex flex-col gap-1 ${
                                      g.ha === "H"
                                        ? "bg-red-50/80 border-red-200 text-[#222222]"
                                        : "bg-gray-50 border-gray-200 text-[#333333]"
                                    } ${isNext ? "ring-2 ring-[#e10600] shadow-sm" : ""}`}
                                  >
                                    <div className="font-heading text-xs tracking-wide truncate flex items-center gap-1">
                                      {(g as any).opponent_logo && (
                                        <img
                                          src={(g as any).opponent_logo}
                                          alt=""
                                          className="w-3.5 h-3.5 object-contain rounded shrink-0 bg-white/50"
                                          onError={(e: any) => { e.target.style.display = 'none'; }}
                                        />
                                      )}
                                      <span className="truncate">
                                        {g.ha === "H" ? "vs " : "at "}
                                        {(g as any).opponent_url ? (
                                          <a
                                            href={(g as any).opponent_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:underline hover:text-[#e10600]"
                                            title={`Visit ${g.opponent} Website`}
                                          >
                                            {g.opponent}
                                          </a>
                                        ) : (
                                          g.opponent
                                        )}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-gray-500 flex items-center justify-between">
                                      <span>{g.time}</span>
                                      {g.broadcast && (
                                        <span className="font-bold text-[#e10600] text-[9px]">▶ {g.broadcast}</span>
                                      )}
                                    </div>

                                    {/* Location link */}
                                    <a
                                      href={g.map_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[10px] text-[#444444] hover:text-[#e10600] truncate flex items-center gap-0.5 underline"
                                      title={g.location}
                                    >
                                      📍 {g.location.split("@")[0].trim()} ↗
                                    </a>

                                    {/* Result or Ticket Button */}
                                    {g.result ? (
                                      <button
                                        onClick={() => {
                                          if ((g as any).recap_article_id) {
                                            const article = newsData.find(
                                              (a) => a.id === (g as any).recap_article_id
                                            );
                                            if (article) {
                                              setSelectedArticle(article);
                                            }
                                          } else {
                                            setSelectedArticle(null);
                                          }
                                          setActiveTab("news");
                                          window.scrollTo({ top: 0, behavior: "smooth" });
                                        }}
                                        className={`mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded text-center transition hover:opacity-90 ${
                                          g.result.startsWith("W")
                                            ? "bg-emerald-600 text-white"
                                            : g.result.startsWith("L")
                                            ? "bg-red-600 text-white"
                                            : "bg-gray-600 text-white"
                                        }`}
                                        title={(g as any).recap_article_id ? "View Game Recap" : g.result}
                                      >
                                        {g.result} {(g as any).recap_article_id ? "· Recap →" : ""}
                                      </button>
                                    ) : g.ha === "H" ? (
                                      <a
                                        href={g.ticket_url || "https://icepackhockey.ticketsauce.com/"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-0.5 bg-[#e10600] hover:bg-[#c40500] text-white text-[10px] font-heading text-center py-1 rounded tracking-wider transition shadow-sm"
                                      >
                                        TICKETS ↗
                                      </a>
                                    ) : null}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }

                      return cells;
                    })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

            {/* HISTORICAL SEASON ARCHIVES VIEW */}
            {scheduleView === "archive" && (
              <div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {historySeasons.map((season, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedArchiveSeason(idx)}
                      className={`px-4 py-2 rounded font-heading text-base tracking-wider uppercase transition ${
                        selectedArchiveSeason === idx
                          ? "bg-[#e10600] text-white"
                          : "bg-gray-100 text-[#444444] hover:bg-gray-200"
                      }`}
                    >
                      {season.season_title.split("(")[0].trim()}
                    </button>
                  ))}
                </div>

                <div className="bg-white border border-[#e5e5e5] rounded-lg overflow-hidden shadow-sm">
                  <div className="bg-[#222222] text-white px-6 py-4 flex justify-between items-center">
                    <h3 className="font-heading text-2xl text-white">
                      {historySeasons[selectedArchiveSeason].season_title}
                    </h3>
                    <span className="text-xs text-white/70">
                      {historySeasons[selectedArchiveSeason].games_count} Total Games
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-100 text-[#444444] text-xs font-bold uppercase tracking-wider border-b border-[#e5e5e5]">
                        <tr>
                          {historySeasons[selectedArchiveSeason].games[0]?.map((col: string, i: number) => (
                            <th key={i} className="py-2.5 px-4">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e5e5e5] font-questrial">
                        {historySeasons[selectedArchiveSeason].games.slice(1).map((row: string[], rIdx: number) => (
                          <tr key={rIdx} className="hover:bg-gray-50 transition">
                            {row.map((val: string, cIdx: number) => (
                              <td key={cIdx} className="py-3 px-4">{val}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== STANDINGS VIEW ===================== */}
        {activeTab === "standings" && (
          <div className="px-4 sm:px-8 py-10 max-w-[1280px] mx-auto w-full">
            {/* Header & Meta */}
            <div className="border-b-2 border-[#e10600] pb-4 mb-8 flex flex-wrap justify-between items-end gap-4">
              <div>
                <span className="text-xs font-bold tracking-widest uppercase text-[#e10600]">
                  WHERE THE PACK STANDS · ACHA DIVISION I
                </span>
                <h1 className="font-heading text-3xl sm:text-5xl text-[#222222] leading-none mt-1">STANDINGS & RANKINGS</h1>
                <p className="font-questrial text-sm text-[#555555] mt-2">
                  SECHL Conference standings, national computer poll rankings, and the road to ACHA Nationals.
                </p>
              </div>
              <span className="text-xs text-[#777777] font-semibold bg-gray-100 px-3 py-1.5 rounded">
                Official ACHA certified · Refreshed regularly
              </span>
            </div>

            {/* ABOVE-THE-FOLD: THE ROAD TO NATIONALS & TOP 24 PURSUIT */}
            {(() => {
              const ncStateStandings = standingsData.teams.find((t) => t.team === "NC State" || t.is_home) || {
                rank: 2,
                points: 21,
                record: "9–6–3–0",
                gp: 18,
              };
              const currentNatRank = standingsData.national_ranking.current_rank;
              const spotsToGo = Math.max(0, currentNatRank - 24);

              return (
                <section className="bg-[#222222] text-white rounded-lg p-6 sm:p-8 shadow-md mb-10">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* Left: Pursuit Context & Cutoff Rules */}
                    <div className="lg:col-span-7 flex flex-col gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-[#e10600] text-white text-[11px] font-bold px-2.5 py-1 rounded tracking-wider uppercase">
                          THE GOAL EVERY SEASON
                        </span>
                        <span className="text-xs text-white/70 font-semibold uppercase tracking-wider">
                          100% COMPUTER RANKING QUALIFICATION · NO AUTO-BIDS
                        </span>
                      </div>
                      <h2 className="font-heading text-4xl sm:text-5xl text-white leading-tight">
                        ROAD TO NATIONALS: TOP 24 PURSUIT
                      </h2>
                      <p className="font-questrial text-sm text-white/85 leading-relaxed">
                        There are <strong>no automatic bids</strong> for NC State or any team in the SECHL this season.
                        To earn an invitation to the ACHA Men's Division I National Tournament in St. Louis, MO, the
                        Pack must finish ranked in the <strong>Top 24</strong> of the final ACHA National Computer Ranking Poll.
                      </p>

                      {/* Stat Highlights Bar (Dynamically Bound to Standings) */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        <div className="bg-[#1a1a1a] border border-[#3a3a3a] p-3 rounded text-center">
                          <span className="text-[10px] font-bold text-[#e10600] uppercase block">CURRENT RANK</span>
                          <span className="font-heading text-3xl text-white">#{currentNatRank}</span>
                          <span className="text-[10px] text-emerald-400 font-bold block">
                            {standingsData.national_ranking.movement}
                          </span>
                        </div>
                        <div className="bg-[#1a1a1a] border border-[#3a3a3a] p-3 rounded text-center">
                          <span className="text-[10px] font-bold text-white/60 uppercase block">TARGET CUTOFF</span>
                          <span className="font-heading text-3xl text-white">TOP 24</span>
                          <span className="text-[10px] text-white/50 block">{spotsToGo} Spots to Go</span>
                        </div>
                        <div className="bg-[#1a1a1a] border border-[#3a3a3a] p-3 rounded text-center">
                          <span className="text-[10px] font-bold text-white/60 uppercase block">OVERALL</span>
                          <span className="font-heading text-3xl text-white">
                            {ncStateStandings.record.split("–").slice(0, 3).join("–")}
                          </span>
                          <span className="text-[10px] text-white/50 block">{ncStateStandings.gp} Games Played</span>
                        </div>
                        <div className="bg-[#1a1a1a] border border-[#3a3a3a] p-3 rounded text-center">
                          <span className="text-[10px] font-bold text-white/60 uppercase block">SECHL MARK</span>
                          <span className="font-heading text-3xl text-white">#{ncStateStandings.rank}</span>
                          <span className="text-[10px] text-[#e10600] font-bold block">{ncStateStandings.points} Points</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 pt-1 text-xs text-white/60 font-questrial">
                        <span className="font-bold text-white/80">HERITAGE:</span>
                        <span>2019 D2 Nationals Qualified</span>
                        <span>·</span>
                        <span>2021 D2 National Quarterfinalist</span>
                      </div>
                    </div>

                    {/* Right: National Poll Movement & Direct PDF Links */}
                    <div className="lg:col-span-5 bg-[#1a1a1a] border border-[#444444] rounded-lg p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center border-b border-[#333333] pb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#e10600]">
                            ACHA COMPUTER RANKING POLL
                          </span>
                          <span className="text-[11px] text-white/60">Updated {standingsData.national_ranking.poll_date}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 my-4">
                          <div className="border-r border-[#333333] pr-2">
                            <span className="text-[11px] text-white/60 uppercase block">LATEST POLL</span>
                            <div className="flex items-baseline gap-2">
                              <span className="font-heading text-5xl text-white">#{currentNatRank}</span>
                              <span className="text-xs text-emerald-400 font-bold">{standingsData.national_ranking.movement}</span>
                            </div>
                            <span className="text-[11px] text-white/50 block">{standingsData.national_ranking.computer_average} Computer Avg</span>
                          </div>
                          <div className="pl-2">
                            <span className="text-[11px] text-white/60 uppercase block">PREVIOUS RANK</span>
                            <div className="flex items-baseline gap-2">
                              <span className="font-heading text-5xl text-white/60">#{standingsData.national_ranking.previous_rank}</span>
                            </div>
                            <span className="text-[11px] text-white/50 block">Target: Top 24 Cutoff</span>
                          </div>
                        </div>
                      </div>

                      {/* Official PDF Download Links */}
                      <div className="flex flex-col gap-2 pt-2">
                        <a
                          href={standingsData.national_ranking.pdf_nov_8}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 bg-[#e10600] hover:bg-[#c40500] text-white font-heading text-sm text-center rounded transition shadow flex items-center justify-center gap-2"
                        >
                          📄 VIEW OFFICIAL ACHA POLL (PDF) ↗
                        </a>
                        {standingsData.national_ranking.pdf_nov_1 && (
                          <a
                            href={standingsData.national_ranking.pdf_nov_1}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 bg-[#2a2a2a] hover:bg-[#333333] text-white font-heading text-xs text-center rounded transition border border-[#555555] flex items-center justify-center gap-2"
                          >
                            📄 ARCHIVED PRIOR POLL (PDF) ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              );
            })()}

            {/* Main Standings Table + Ranked Teams Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Conference Table */}
              <div className="lg:col-span-8 bg-white border border-[#e5e5e5] rounded-lg overflow-hidden shadow-sm">
                <div className="bg-[#222222] text-white px-5 py-3.5 flex justify-between items-center">
                  <span className="font-heading text-xl">SECHL CONFERENCE STANDINGS</span>
                  <a
                    href="https://www.achahockey.org/stats/standings?standingstype=division&season=73&conference=8&division=-1&context=overall&specialteams=false&sortkey=points&league=1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#e10600] hover:underline font-bold"
                  >
                    Official ACHA Source ↗
                  </a>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100 text-[#444444] text-xs font-bold uppercase tracking-wider border-b border-[#e5e5e5]">
                      <tr>
                        <th className="py-2.5 px-4">#</th>
                        <th className="py-2.5 px-4">TEAM</th>
                        <th className="py-2.5 px-3 text-center">GP</th>
                        <th className="py-2.5 px-4 text-center">RECORD</th>
                        <th className="py-2.5 px-3 text-center">GF</th>
                        <th className="py-2.5 px-3 text-center">GA</th>
                        <th className="py-2.5 px-4 text-center font-bold text-[#e10600]">PTS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5e5e5] font-questrial">
                      {standingsData.teams.map((team, idx) => (
                        <tr
                          key={idx}
                          className={`transition ${
                            team.team === "NC State" ? "bg-red-50/60 font-bold border-l-4 border-[#e10600]" : "hover:bg-gray-50"
                          }`}
                        >
                          <td className="py-3.5 px-4 font-bold">{team.rank}</td>
                          <td className="py-3.5 px-4 flex items-center gap-2">
                            {team.team === "NC State" && <span className="w-2.5 h-2.5 rounded-full bg-[#e10600]" />}
                            <span className={team.team === "NC State" ? "text-[#e10600] font-heading text-lg" : "font-medium"}>
                              {team.team}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-center text-[#555555]">{team.gp}</td>
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">{team.record}</td>
                          <td className="py-3.5 px-3 text-center text-[#555555]">{team.gf}</td>
                          <td className="py-3.5 px-3 text-center text-[#555555]">{team.ga}</td>
                          <td className="py-3.5 px-4 text-center font-bold text-base text-[#e10600]">{team.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-3.5 bg-gray-50 border-t border-[#e5e5e5] text-xs text-[#626262] flex justify-between items-center">
                  <span>Standard ACHA 2 points per win, 1 point per overtime/shootout loss.</span>
                  <span className="font-semibold text-[#e10600]">Top 4 teams advance to SECHL Playoffs</span>
                </div>
              </div>

              {/* Sidebar: Against Ranked Opponents */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="border border-[#e5e5e5] rounded-lg p-6 bg-white shadow-sm">
                  <h3 className="font-heading text-xl text-[#222222] border-b-2 border-[#e10600] pb-2 mb-4">
                    AGAINST RANKED TEAMS
                  </h3>
                  <div className="space-y-3 font-questrial">
                    {standingsData.ranked_games.map((g, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-none">
                        <div className="flex items-center gap-2">
                          <span className="font-heading text-2xl text-[#e10600]">{g.rank}</span>
                          <div>
                            <span className="font-bold text-sm block">{g.opponent}</span>
                            <span className="text-[11px] text-[#777777] block">{g.dates}</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#555555] bg-gray-100 px-2 py-0.5 rounded">{g.result}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-3.5 bg-red-50/70 border border-red-200 rounded text-xs text-[#222222]">
                    <span className="font-bold uppercase tracking-wide text-[#e10600] block mb-0.5">NEXT RANKED TEST</span>
                    <span>#7 Liberty at the 704 Outdoor Faceoff · Jan 9, Truist Field, Charlotte</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TEAM / ROSTER VIEW ===================== */}
        {activeTab === "team" && (
          <div className="px-4 sm:px-8 py-10 max-w-[1280px] mx-auto w-full">
            <div className="border-b-2 border-[#e10600] pb-4 mb-8 flex flex-wrap justify-between items-end gap-4">
              <div>
                <span className="text-xs font-bold tracking-widest uppercase text-[#e10600]">
                  ACHA DIVISION I · 2026–27
                </span>
                <h1 className="font-heading text-3xl sm:text-5xl text-[#222222] leading-none mt-1">ROSTER & STAFF</h1>
              </div>

              {/* Roster Navigation Tabs */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "players", label: "Players" },
                  { id: "coaches", label: "Coaching Staff" },
                  { id: "media", label: "Off-Ice Staff & Media" },
                  { id: "board", label: "Advisory Board" },
                  { id: "facilities", label: "Facilities & Arena" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setRosterTab(t.id)}
                    className={`px-4 py-2 rounded font-heading text-base tracking-wider uppercase transition ${
                      rosterTab === t.id
                        ? "bg-[#e10600] text-white"
                        : "bg-gray-100 text-[#444444] hover:bg-gray-200"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Players Grid */}
            {rosterTab === "players" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {rosterData.map((player) => (
                  <div
                    key={player.number}
                    className="bg-white border border-[#e5e5e5] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition group"
                  >
                    <div className="h-64 bg-gray-100 overflow-hidden relative">
                      <img
                        src={`/${player.image}`}
                        alt={player.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={(e: any) => {
                          e.target.src = "/07cdeb598c1716ddf52f5438f9484da2.png";
                        }}
                      />
                      <div className="absolute top-2 left-2 bg-[#e10600] text-white font-heading text-xl px-2.5 py-0.5 rounded shadow">
                        #{player.number}
                      </div>
                      {player.captain && (
                        <div className="absolute top-2 right-2 bg-[#222222] text-white font-heading text-lg px-2 py-0.5 rounded shadow">
                          {player.captain}
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-[#e10600] uppercase tracking-wider">
                          {player.class} · {player.position}
                        </span>
                        <h3 className="font-heading text-2xl text-[#222222] leading-tight mt-0.5">
                          {player.name}
                        </h3>
                        <p className="font-questrial text-xs text-[#555555] mt-1 truncate">{player.major}</p>
                        <p className="font-questrial text-xs text-[#888888]">{player.hometown}</p>
                      </div>
                      <a
                        href={player.acha_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-[#e10600] hover:underline uppercase tracking-wider mt-3"
                      >
                        ACHA Player Bio →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Coaching Staff View */}
            {rosterTab === "coaches" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {staffData.coaches.map((c, idx) => (
                  <div key={idx} className="bg-white border border-[#e5e5e5] rounded-lg p-6 shadow-sm flex flex-col sm:flex-row gap-6">
                    <div className="w-32 h-36 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={c.image ? `/${c.image}` : "/07cdeb598c1716ddf52f5438f9484da2.png"}
                        alt={c.name}
                        className="w-full h-full object-cover"
                        onError={(e: any) => {
                          e.target.src = "/07cdeb598c1716ddf52f5438f9484da2.png";
                        }}
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <span className="text-xs font-bold text-[#e10600] uppercase tracking-wider">{c.role}</span>
                      <h3 className="font-heading text-2xl text-[#222222] leading-tight mt-0.5">{c.name}</h3>
                      <p className="font-questrial text-xs text-[#555555] mt-2 leading-relaxed">{c.bio}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Off-Ice Staff & Media View */}
            {rosterTab === "media" && (
              <div className="space-y-10">
                {staffData.hockey_ops && staffData.hockey_ops.length > 0 && (
                  <div>
                    <div className="mb-4">
                      <h2 className="font-heading text-2xl text-[#222222]">HOCKEY OPERATIONS</h2>
                      <p className="font-questrial text-xs text-[#555555]">
                        Equipment management, scouting, analytics, and team operations.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {staffData.hockey_ops.map((m, idx) => (
                        <div key={idx} className="bg-white border border-[#e5e5e5] rounded-lg p-4 shadow-sm flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border border-[#e5e5e5]">
                            <img
                              src={m.image ? `/${m.image}` : "/07cdeb598c1716ddf52f5438f9484da2.png"}
                              alt={m.name}
                              className="w-full h-full object-cover"
                              onError={(e: any) => {
                                e.target.src = "/07cdeb598c1716ddf52f5438f9484da2.png";
                              }}
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-[#e10600] uppercase tracking-wider">{m.role}</span>
                            <h4 className="font-heading text-xl text-[#222222] leading-tight">{m.name}</h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="mb-4">
                    <h2 className="font-heading text-2xl text-[#222222]">STUDENT FRONT OFFICE & MEDIA STAFF</h2>
                    <p className="font-questrial text-xs text-[#555555]">
                      The dedicated student journalists, videographers, photographers, and marketing interns who power IcePack game coverage.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {staffData.media_staff.map((m, idx) => (
                      <div key={idx} className="bg-white border border-[#e5e5e5] rounded-lg p-4 shadow-sm flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border border-[#e5e5e5]">
                          <img
                            src={m.image ? `/${m.image}` : "/07cdeb598c1716ddf52f5438f9484da2.png"}
                            alt={m.name}
                            className="w-full h-full object-cover"
                            onError={(e: any) => {
                              e.target.src = "/07cdeb598c1716ddf52f5438f9484da2.png";
                            }}
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-[#e10600] uppercase tracking-wider">{m.role}</span>
                          <h4 className="font-heading text-xl text-[#222222] leading-tight">{m.name}</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Advisory Board View */}
            {rosterTab === "board" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {staffData.board.map((b, idx) => (
                  <div key={idx} className="bg-white border border-[#e5e5e5] rounded-lg p-6 shadow-sm flex flex-col gap-2">
                    <span className="text-xs font-bold text-[#e10600] uppercase tracking-wider">{b.role}</span>
                    <h3 className="font-heading text-3xl text-[#222222]">{b.name}</h3>
                    <p className="font-questrial text-sm text-[#555555] leading-relaxed mt-2">{b.bio}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Facilities & Lane Arena View */}
            {rosterTab === "facilities" && (
              <div className="space-y-10">
                {/* HERO BANNER WITH THE ORIGINAL FACILITY HERO IMAGE */}
                <div className="relative rounded-2xl overflow-hidden shadow-xl border border-stone-200">
                  <div className="h-80 sm:h-96 md:h-[420px] relative bg-neutral-900">
                    <img
                      src="/lane-arena-hero.jpg"
                      alt="Lane Arena at Wake Competition Center"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/25 flex flex-col justify-end p-6 sm:p-10">
                      <span className="bg-[#e10600] text-white font-heading text-xs sm:text-sm uppercase tracking-widest px-3 py-1 rounded shadow self-start mb-2">
                        OFFICIAL HOME OF NC STATE ICEPACK HOCKEY
                      </span>
                      <h2 className="font-heading text-4xl sm:text-6xl text-white tracking-wide leading-none">
                        WELCOME TO LANE ARENA
                      </h2>
                      <p className="font-questrial text-sm sm:text-lg text-white/90 mt-2 flex items-center gap-2">
                        <span>📍</span>
                        <span>111 Competition Center Dr, Morrisville, NC 27560</span>
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <a
                          href="https://www.google.com/maps/search/?api=1&query=Lane%20Arena%20%20Wake%20Competition%20Center%2C%20Morrisville%2C%20NC"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#e10600] hover:bg-[#c40500] text-white font-heading text-sm px-5 py-2.5 rounded uppercase tracking-wider shadow transition inline-flex items-center gap-2"
                        >
                          <span>Get Directions (Google Maps)</span>
                          <span>→</span>
                        </a>
                        <a
                          href="https://icepackhockey.ticketsauce.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-heading text-sm px-5 py-2.5 rounded uppercase tracking-wider border border-white/30 transition"
                        >
                          Buy Gameday Tickets
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 1: HOME OF CHAMPIONS & DISTANCES */}
                <div className="bg-white border border-[#e5e5e5] rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
                  <div>
                    <span className="text-xs font-bold text-[#e10600] uppercase tracking-widest font-heading">
                      PREMIER TWIN-SHEET FACILITY
                    </span>
                    <h3 className="font-heading text-3xl sm:text-4xl text-[#222222] mt-1">
                      HOME OF CHAMPIONS
                    </h3>
                    <p className="font-questrial text-sm sm:text-base text-[#444444] mt-2 leading-relaxed max-w-4xl">
                      The Lane Arena at Wake Competition Center is a premier twin-sheet skating rink, and the official practice facility of the 2006 Stanley Cup Champion Carolina Hurricanes. Featuring state-of-the-art ice refrigeration, dedicated collegiate team rooms, and an electric gameday atmosphere, Lane Arena has served as the fortress of the Icepack since its opening.
                    </p>
                  </div>

                  {/* Location Distances Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl text-center">
                      <span className="font-heading text-3xl text-[#e10600] block">~3 MILES</span>
                      <span className="font-heading text-sm text-[#222222] uppercase tracking-wider block mt-1">
                        From RDU Airport
                      </span>
                      <span className="text-[11px] text-[#666666] font-questrial block mt-0.5">
                        Raleigh-Durham International
                      </span>
                    </div>

                    <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl text-center">
                      <span className="font-heading text-3xl text-[#e10600] block">10.5 MILES</span>
                      <span className="font-heading text-sm text-[#222222] uppercase tracking-wider block mt-1">
                        From NC State Campus
                      </span>
                      <span className="text-[11px] text-[#666666] font-questrial block mt-0.5">
                        Central Campus & Talley Student Union
                      </span>
                    </div>

                    <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl text-center">
                      <span className="font-heading text-3xl text-[#e10600] block">13.5 MILES</span>
                      <span className="font-heading text-sm text-[#222222] uppercase tracking-wider block mt-1">
                        From Downtown Raleigh
                      </span>
                      <span className="text-[11px] text-[#666666] font-questrial block mt-0.5">
                        State Capitol & Lenovo Center
                      </span>
                    </div>
                  </div>

                  {/* Facility Photo Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-stone-100">
                    <div className="rounded-xl overflow-hidden border border-stone-200 shadow-sm aspect-[4/3] bg-stone-100">
                      <img
                        src="/facility-rink.jpg"
                        alt="Lane Arena Rink"
                        className="w-full h-full object-cover hover:scale-105 transition duration-500"
                      />
                    </div>
                    <div className="rounded-xl overflow-hidden border border-stone-200 shadow-sm aspect-[4/3] bg-stone-100">
                      <img
                        src="/facility-locker.jpg"
                        alt="Icepack Locker Room Facility"
                        className="w-full h-full object-cover hover:scale-105 transition duration-500"
                      />
                    </div>
                    <div className="rounded-xl overflow-hidden border border-stone-200 shadow-sm aspect-[4/3] bg-stone-100">
                      <img
                        src="/facility-practice.jpg"
                        alt="Icepack Team Practice at Lane Arena"
                        className="w-full h-full object-cover hover:scale-105 transition duration-500"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: TICKETS & STREAMING POLICIES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tickets Box */}
                  <div className="bg-white border border-[#e5e5e5] rounded-xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#e10600] uppercase tracking-widest font-heading">
                        GAMEDAY ADMISSION
                      </span>
                      <h4 className="font-heading text-2xl text-[#222222] mt-1">
                        TICKETS & SEATING CAPACITY
                      </h4>
                      <p className="font-questrial text-sm text-[#555555] mt-2 leading-relaxed">
                        We highly encourage visiting fans, alumni, and families to purchase tickets prior to arrival — Lane Arena capacity is strictly capped, and games regularly sell out in advance of puck drop.
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-stone-100">
                      <a
                        href="https://icepackhockey.ticketsauce.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#e10600] hover:bg-[#c40500] text-white font-heading text-sm px-5 py-2.5 rounded uppercase tracking-wider shadow transition inline-block text-center w-full"
                      >
                        Purchase Single Game Tickets →
                      </a>
                    </div>
                  </div>

                  {/* Streaming Box */}
                  <div className="bg-white border border-[#e5e5e5] rounded-xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#e10600] uppercase tracking-widest font-heading">
                        BROADCAST POLICIES
                      </span>
                      <h4 className="font-heading text-2xl text-[#222222] mt-1">
                        ESPN+ & PACKTV STREAMING
                      </h4>
                      <p className="font-questrial text-sm text-[#555555] mt-2 leading-relaxed">
                        All home games are streamed live on ESPN+. Personal visitor livestreams from the stands are strictly prohibited. Full-game YouTube broadcasts and replay highlights are made available five days following each contest on the official PackTV channel.
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-stone-100">
                      <button
                        onClick={() => {
                          setActiveTab("videos");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="bg-[#222222] hover:bg-black text-white font-heading text-sm px-5 py-2.5 rounded uppercase tracking-wider shadow transition inline-block text-center w-full"
                      >
                        Watch Replays on PackTV →
                      </button>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: NEARBY PRO SHOPS & SERVICES */}
                <div className="bg-white border border-[#e5e5e5] rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
                  <div>
                    <span className="text-xs font-bold text-[#e10600] uppercase tracking-widest font-heading">
                      LOCAL HOCKEY SERVICES
                    </span>
                    <h3 className="font-heading text-3xl sm:text-4xl text-[#222222] mt-1">
                      NEARBY PRO SHOPS & SKATE SERVICES
                    </h3>
                    <p className="font-questrial text-sm text-[#666666] mt-1 max-w-3xl">
                      Visiting teams and players requiring skate sharpening, steel profiling, emergency repairs, or protective gear can access these verified local pro shops:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* PSB PRO SERVICES */}
                    <div className="border border-stone-200 rounded-xl p-5 bg-stone-50 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-100 text-[#e10600]">
                          NHL Steel & Repair Specialists
                        </span>
                        <h4 className="font-heading text-xl text-[#222222] mt-2">
                          PSB PRO SERVICES
                        </h4>
                        <p className="text-xs text-[#555555] font-mono mt-1">
                          10269 Chapel Hill Rd, Unit 100<br />
                          Morrisville, NC 27560
                        </p>
                        <p className="text-xs font-bold text-[#222222] mt-1">
                          📞 +1 (919) 443-8049
                        </p>
                        <p className="font-questrial text-xs text-[#666666] mt-3 leading-relaxed">
                          Located less than two miles from Lane Arena and renowned in the NHL community for precision steel and repair work. PSB regularly handles NHL steel in preparation for professional seasons.
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-stone-200">
                        <a
                          href="https://www.psbproservices.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-[#e10600] hover:underline"
                        >
                          Visit psbproservices.com →
                        </a>
                      </div>
                    </div>

                    {/* PURE HOCKEY */}
                    <div className="border border-stone-200 rounded-xl p-5 bg-stone-50 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                          Full Equipment Retail
                        </span>
                        <h4 className="font-heading text-xl text-[#222222] mt-2">
                          PURE HOCKEY - MORRISVILLE
                        </h4>
                        <p className="text-xs text-[#555555] font-mono mt-1">
                          2108 Village Market Place<br />
                          Morrisville, NC 27560
                        </p>
                        <p className="text-xs font-bold text-[#222222] mt-1">
                          📞 +1 (919) 481-4475
                        </p>
                        <p className="font-questrial text-xs text-[#666666] mt-3 leading-relaxed">
                          A premier nationwide retailer of hockey equipment located roughly three miles away from Wake Competition Center, carrying full gear lines, protective padding, and sticks.
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-stone-200">
                        <a
                          href="https://www.purehockey.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-[#e10600] hover:underline"
                        >
                          Visit purehockey.com →
                        </a>
                      </div>
                    </div>

                    {/* PRIMO X HOCKEY */}
                    <div className="border border-stone-200 rounded-xl p-5 bg-stone-50 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-stone-200 text-stone-800">
                          Tape, Laces & Accessories
                        </span>
                        <h4 className="font-heading text-xl text-[#222222] mt-2">
                          PRIMO X HOCKEY
                        </h4>
                        <p className="text-xs text-[#555555] font-mono mt-1">
                          1401 Diggs Drive, Suite E<br />
                          Raleigh, NC 27603
                        </p>
                        <p className="text-xs font-bold text-[#222222] mt-1">
                          📞 +1 (919) 322-9893
                        </p>
                        <p className="font-questrial text-xs text-[#666666] mt-3 leading-relaxed">
                          Locally-based supplier of high-performance hockey tape, laces, apparel, and team accessories located roughly 14 miles from Lane Arena.
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-stone-200">
                        <a
                          href="https://www.primoxhockey.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-[#e10600] hover:underline"
                        >
                          Visit primoxhockey.com →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== MEDIA HUB LANDING PAGE ===================== */}
        {activeTab === "media" && (
          <div className="px-4 sm:px-8 py-10 max-w-[1280px] mx-auto w-full space-y-12">
            {/* Header Banner */}
            <div className="border-b-4 border-[#e10600] pb-6">
              <span className="text-xs font-bold tracking-widest uppercase text-[#e10600]">
                ICEPACK COMMUNICATIONS · MULTIMEDIA NETWORK
              </span>
              <h1 className="font-heading text-4xl sm:text-6xl text-[#222222] leading-none mt-1">
                THE ICEPACK MEDIA HUB
              </h1>
              <p className="font-questrial text-sm sm:text-base text-[#444444] mt-3 max-w-3xl leading-relaxed">
                The central home for NC State Icepack hockey coverage. Follow the Pack through in-depth game recaps, PackTV live broadcasts, high-speed highlight reels, and on-ice photography captured by our student journalists and multimedia team.
              </p>

              {/* Quick Jump Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                <button
                  onClick={() => {
                    setActiveTab("news");
                    setSelectedArticle(null);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="bg-stone-50 hover:bg-stone-100 border border-stone-200 p-3.5 rounded-xl text-left transition flex items-center justify-between group"
                >
                  <div>
                    <span className="text-[10px] font-bold text-[#e10600] uppercase tracking-wider block font-heading">
                      CHANNEL 01
                    </span>
                    <span className="font-heading text-lg text-[#222222] group-hover:text-[#e10600] transition">
                      News & Game Recaps
                    </span>
                    <span className="text-xs text-[#666666] block mt-0.5">
                      {newsData.length}+ Articles & Stories
                    </span>
                  </div>
                  <span className="text-stone-400 group-hover:text-[#e10600] text-lg font-bold">→</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("videos");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="bg-stone-50 hover:bg-stone-100 border border-stone-200 p-3.5 rounded-xl text-left transition flex items-center justify-between group"
                >
                  <div>
                    <span className="text-[10px] font-bold text-[#e10600] uppercase tracking-wider block font-heading">
                      CHANNEL 02
                    </span>
                    <span className="font-heading text-lg text-[#222222] group-hover:text-[#e10600] transition">
                      Videos & PackTV
                    </span>
                    <span className="text-xs text-[#666666] block mt-0.5">
                      Broadcasts & Goal Highlights
                    </span>
                  </div>
                  <span className="text-stone-400 group-hover:text-[#e10600] text-lg font-bold">→</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("photos");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="bg-stone-50 hover:bg-stone-100 border border-stone-200 p-3.5 rounded-xl text-left transition flex items-center justify-between group"
                >
                  <div>
                    <span className="text-[10px] font-bold text-[#e10600] uppercase tracking-wider block font-heading">
                      CHANNEL 03
                    </span>
                    <span className="font-heading text-lg text-[#222222] group-hover:text-[#e10600] transition">
                      Photo Gallery
                    </span>
                    <span className="text-xs text-[#666666] block mt-0.5">
                      On-Ice Action & Trophy Honors
                    </span>
                  </div>
                  <span className="text-stone-400 group-hover:text-[#e10600] text-lg font-bold">→</span>
                </button>
              </div>
            </div>

            {/* PREVIEW SECTION 1: THE NEWSROOM */}
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-2 border-stone-200 pb-3 gap-2">
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-[#e10600] font-heading">
                    SECTION PREVIEW
                  </span>
                  <h2 className="font-heading text-2xl sm:text-4xl text-[#222222]">
                    THE NEWSROOM & GAME RECAPS
                  </h2>
                  <p className="font-questrial text-xs sm:text-sm text-[#666666] mt-0.5">
                    Gameday recaps, weekly series previews, player spotlights, and team announcements.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab("news");
                    setSelectedArticle(null);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="bg-[#e10600] hover:bg-[#c40500] text-white font-heading text-xs sm:text-sm px-4 py-2 rounded uppercase tracking-wider shadow transition self-start sm:self-auto shrink-0"
                >
                  Explore All News ({newsData.length}+) →
                </button>
              </div>

              {/* News Preview Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Featured Headline Story */}
                <div
                  onClick={() => {
                    setSelectedArticle(newsData[0]);
                    setActiveTab("news");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="lg:col-span-2 bg-white border border-[#e5e5e5] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer flex flex-col group"
                >
                  <div className="relative h-64 sm:h-80 overflow-hidden bg-stone-100">
                    <img
                      src={newsData[0].image_url || "/f24c1491d6dab19fe6b3b4e7ec20b6cc.jpg"}
                      alt={newsData[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-[#e10600] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow">
                      {newsData[0].category} · {newsData[0].date}
                    </span>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-heading text-2xl sm:text-3xl text-[#222222] group-hover:text-[#e10600] transition leading-tight">
                        {newsData[0].title.toUpperCase()}
                      </h3>
                      <p className="font-questrial text-xs sm:text-sm text-[#555555] mt-2 line-clamp-3 leading-relaxed">
                        {newsData[0].summary}
                      </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-[#888888]">
                      <span>By {newsData[0].author?.split(",")[0]}</span>
                      <span className="font-bold text-[#e10600]">Read Full Story →</span>
                    </div>
                  </div>
                </div>

                {/* Secondary Stories Stack */}
                <div className="flex flex-col gap-6">
                  {newsData.slice(1, 3).map((art) => (
                    <div
                      key={art.id}
                      onClick={() => {
                        setSelectedArticle(art);
                        setActiveTab("news");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="bg-white border border-[#e5e5e5] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer flex flex-col group flex-1"
                    >
                      <div className="h-36 overflow-hidden bg-stone-100 relative">
                        <img
                          src={art.image_url}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <span className="absolute top-2 left-2 bg-[#222222]/85 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                          {art.category}
                        </span>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-stone-400 font-mono">{art.date}</span>
                          <h4 className="font-heading text-base text-[#222222] group-hover:text-[#e10600] transition leading-snug line-clamp-2 mt-0.5">
                            {art.title.toUpperCase()}
                          </h4>
                        </div>
                        <span className="text-xs font-bold text-[#e10600] mt-2 block">
                          Read Story →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* PREVIEW SECTION 2: VIDEOS & PACKTV */}
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-2 border-stone-200 pb-3 gap-2">
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-[#e10600] font-heading">
                    SECTION PREVIEW
                  </span>
                  <h2 className="font-heading text-2xl sm:text-4xl text-[#222222]">
                    PACKTV & VIDEO HIGHLIGHTS
                  </h2>
                  <p className="font-questrial text-xs sm:text-sm text-[#666666] mt-0.5">
                    Broadcast replays, gameday hype reels, goal highlights, and player mic&apos;d up series.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab("videos");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="bg-[#222222] hover:bg-black text-white font-heading text-xs sm:text-sm px-4 py-2 rounded uppercase tracking-wider shadow transition self-start sm:self-auto shrink-0"
                >
                  Watch All Videos on PackTV →
                </button>
              </div>

              {/* Videos Preview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mediaVideosData.recentHighlights.slice(0, 3).map((vid: any) => (
                  <div
                    key={vid.id}
                    className="bg-white border border-[#e5e5e5] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group"
                  >
                    <div className="relative aspect-video bg-black overflow-hidden">
                      <img
                        src={`https://img.youtube.com/vi/${vid.id}/hqdefault.jpg`}
                        alt={vid.title}
                        className="w-full h-full object-cover opacity-85 group-hover:opacity-95 group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-[#e10600]/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#e10600] transition">
                          <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                        PackTV Game in 5
                      </span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-[#e10600] uppercase tracking-wider">
                          {vid.category} · {vid.date}
                        </span>
                        <h4 className="font-heading text-lg text-[#222222] mt-1 leading-snug">
                          {vid.title}
                        </h4>
                        <p className="font-questrial text-xs text-[#666666] mt-1 line-clamp-2 leading-relaxed">
                          {vid.description}
                        </p>
                      </div>
                      <a
                        href={vid.youtubeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-[#e10600] hover:underline mt-3 block"
                      >
                        Watch on YouTube →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* PREVIEW SECTION 3: PHOTO GALLERY */}
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-2 border-stone-200 pb-3 gap-2">
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-[#e10600] font-heading">
                    SECTION PREVIEW
                  </span>
                  <h2 className="font-heading text-2xl sm:text-4xl text-[#222222]">
                    ON-ICE ARCHIVAL PHOTOGRAPHY
                  </h2>
                  <p className="font-questrial text-xs sm:text-sm text-[#666666] mt-0.5">
                    High-resolution game action, rivalry goal celebrations, trophy ceremonies, and Frozen Finley outdoor archives.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab("photos");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="bg-[#e10600] hover:bg-[#c40500] text-white font-heading text-xs sm:text-sm px-4 py-2 rounded uppercase tracking-wider shadow transition self-start sm:self-auto shrink-0"
                >
                  Open Full Photo Gallery →
                </button>
              </div>

              {/* Photo Showcase Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  {
                    title: "Governor's Cup Victory Celebration",
                    image: "/photo-govcup.jpg",
                    category: "Championships",
                    photographer: "Lilly McCabe",
                  },
                  {
                    title: "Frozen Finley Outdoor Showcase",
                    image: "/frozen-finley.jpg",
                    category: "Historic Event",
                    photographer: "Kaydee Gawlik",
                  },
                  {
                    title: "Rivalry Clash vs. UNC at Lenovo Center",
                    image: "/photo-unc.jpg",
                    category: "Rivalry Action",
                    photographer: "Julia Ortiz",
                  },
                ].map((p, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setActiveTab("photos");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="bg-white border border-[#e5e5e5] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer group"
                  >
                    <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <span className="absolute top-2.5 left-2.5 bg-[#222222]/85 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                        {p.category}
                      </span>
                    </div>
                    <div className="p-3.5">
                      <h4 className="font-heading text-base text-[#222222] group-hover:text-[#e10600] transition leading-snug">
                        {p.title}
                      </h4>
                      <div className="flex items-center justify-between text-[10px] text-[#888888] font-questrial mt-2 pt-2 border-t border-stone-100">
                        <span>📸 {p.photographer}</span>
                        <span className="font-bold text-[#e10600]">View In Gallery →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* PREVIEW SECTION 4: PRESS CREDENTIALS & MEDIA KIT */}
            <section className="bg-[#1a1a1a] text-white rounded-2xl p-6 sm:p-8 border border-neutral-800 shadow-lg">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#e10600] font-heading">
                    PRESS & BROADCAST ACCESS
                  </span>
                  <h3 className="font-heading text-2xl sm:text-3xl text-white">
                    COVERING THE PACK: PRESS CREDENTIALS & MEDIA KIT
                  </h3>
                  <p className="font-questrial text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    Accredited student journalists, visiting collegiate sports media, campus broadcasters, and freelance sports photographers can request single-game press credentials, photo passes, and post-game interview access at Lane Arena @ Wake Competition Center.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                  <a
                    href="mailto:Admin@icepackhockey.com?subject=Icepack%20Press%20Credentials%20Request"
                    className="bg-[#e10600] hover:bg-[#b00400] text-white font-heading text-sm px-5 py-2.5 rounded uppercase tracking-wider transition text-center shadow"
                  >
                    Request Credentials →
                  </a>
                  <a
                    href="mailto:Admin@icepackhockey.com?subject=Icepack%20Brand%20Assets%20Request"
                    className="bg-white/10 hover:bg-white/20 text-white font-heading text-sm px-5 py-2.5 rounded uppercase tracking-wider transition text-center border border-white/20"
                  >
                    Media Kit Assets
                  </a>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ===================== NEWS VIEW (ALL 55 ARTICLES) ===================== */}
        {activeTab === "news" && (
          <div className="px-4 sm:px-8 py-10 max-w-[1280px] mx-auto w-full">
            <div className="border-b-2 border-[#e10600] pb-4 mb-8">
              <span className="text-xs font-bold tracking-widest uppercase text-[#e10600]">
                STORIES · RECAPS · RELEASES
              </span>
              <h1 className="font-heading text-3xl sm:text-5xl text-[#222222] leading-none mt-1">ICEPACK NEWSROOM</h1>
              <p className="font-questrial text-sm text-[#555555] mt-2">
                Full archive of all game recaps, previews, and feature stories written by team journalists.
              </p>
            </div>

            {selectedArticle ? (
              <div className="max-w-3xl mx-auto bg-white border border-[#e5e5e5] rounded-lg p-6 sm:p-10 shadow-sm">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="text-xs font-bold text-[#e10600] hover:underline uppercase tracking-wider mb-4"
                >
                  ← Back to All Articles ({newsData.length})
                </button>
                {selectedArticle.image_url && (
                  <div className="h-80 overflow-hidden rounded-lg mb-6 bg-gray-100">
                    <img src={selectedArticle.image_url} alt={selectedArticle.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <span className="text-xs font-bold text-[#e10600] uppercase tracking-wider">
                  {selectedArticle.category} · {selectedArticle.date}
                </span>
                <h2 className="font-heading text-4xl sm:text-5xl text-[#222222] mt-2 leading-tight">
                  {selectedArticle.title}
                </h2>
                <div className="text-xs text-[#777777] font-semibold mt-2 pb-6 border-b border-[#e5e5e5]">
                  {selectedArticle.author}
                </div>
                <div className="mt-6 font-questrial text-base text-[#333333] leading-relaxed space-y-5">
                  {selectedArticle.paragraphs && selectedArticle.paragraphs.length > 0 ? (
                    selectedArticle.paragraphs.map((para: string, idx: number) => (
                      <p key={idx} className="leading-relaxed">
                        {para}
                      </p>
                    ))
                  ) : (
                    <p className="leading-relaxed">{selectedArticle.summary}</p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                {/* Category Filter Pills */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {["all", "Recap", "Preview", "Awards", "Tournament", "Program News"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setNewsFilter(cat);
                        setNewsPage(1);
                      }}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
                        newsFilter === cat
                          ? "bg-[#e10600] text-white"
                          : "bg-gray-100 text-[#444444] hover:bg-gray-200"
                      }`}
                    >
                      {cat === "all" ? `All Stories (${newsData.length})` : cat}
                    </button>
                  ))}
                </div>

                {/* News Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {paginatedNews.map((article) => (
                    <div
                      key={article.id}
                      onClick={() => {
                        setSelectedArticle(article);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="bg-white border border-[#e5e5e5] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="h-48 overflow-hidden bg-gray-100">
                          <img
                            src={article.image_url || "/f24c1491d6dab19fe6b3b4e7ec20b6cc.jpg"}
                            alt={article.title}
                            className="w-full h-full object-cover hover:scale-105 transition duration-500"
                            onError={(e: any) => {
                              e.target.src = "/f24c1491d6dab19fe6b3b4e7ec20b6cc.jpg";
                            }}
                          />
                        </div>
                        <div className="p-5">
                          <span className="text-[11px] font-bold text-[#e10600] uppercase tracking-wider">
                            {article.category} · {article.date}
                          </span>
                          <h3 className="font-heading text-2xl text-[#222222] mt-1 leading-snug hover:text-[#e10600] transition">
                            {article.title}
                          </h3>
                          <p className="font-questrial text-sm text-[#555555] mt-2 line-clamp-3 leading-relaxed">
                            {article.summary}
                          </p>
                        </div>
                      </div>
                      <div className="px-5 pb-5 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-[#626262]">
                        <span className="truncate">{article.author}</span>
                        <span className="font-bold text-[#e10600] flex-shrink-0">Read Full →</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalNewsPages > 1 && (
                  <div className="mt-12 flex justify-center items-center gap-2">
                    <button
                      disabled={newsPage === 1}
                      onClick={() => setNewsPage(newsPage - 1)}
                      className="px-4 py-2 border border-[#e5e5e5] rounded text-xs font-bold uppercase disabled:opacity-30"
                    >
                      Previous
                    </button>
                    <span className="text-xs font-bold text-[#555555] px-4">
                      Page {newsPage} of {totalNewsPages}
                    </span>
                    <button
                      disabled={newsPage === totalNewsPages}
                      onClick={() => setNewsPage(newsPage + 1)}
                      className="px-4 py-2 border border-[#e5e5e5] rounded text-xs font-bold uppercase disabled:opacity-30"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===================== VIDEOS VIEW ===================== */}
        {activeTab === "videos" && (
          <div className="px-4 sm:px-8 py-10 max-w-[1280px] mx-auto w-full">
            {/* Header */}
            <div className="border-b-2 border-[#e10600] pb-4 mb-8">
              <span className="text-xs font-bold tracking-widest uppercase text-[#e10600]">
                ICEPACK MEDIA PRODUCTIONS · 2026–27 SEASON
              </span>
              <h1 className="font-heading text-3xl sm:text-5xl text-[#222222] leading-none mt-1">
                VIDEOS & HIGHLIGHTS
              </h1>
              <p className="font-questrial text-sm text-[#555555] mt-2 max-w-2xl leading-relaxed">
                Watch recent Game in 5 minute recaps, the full &ldquo;Leading Edge&rdquo; team docuseries, and official PackTV broadcast archives.
              </p>
            </div>

            {/* Section 1: Recent Game in 5 Highlights */}
            <div className="mb-14">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#e5e5e5] pb-3 mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#e10600] block">
                    RECENT GAME HIGHLIGHTS
                  </span>
                  <h2 className="font-heading text-3xl text-[#222222] mt-0.5">
                    RECENT GAME IN 5 HIGHLIGHTS
                  </h2>
                </div>
                <span className="text-xs font-questrial text-[#777777]">
                  Official 5-Minute Game Recaps
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mediaVideosData.recentHighlights.map((v: any) => (
                  <div
                    key={v.id}
                    className="bg-white border border-[#e5e5e5] rounded-lg overflow-hidden shadow-sm hover:shadow transition flex flex-col"
                  >
                    <div className="w-full aspect-video bg-black">
                      <iframe
                        width="100%"
                        height="100%"
                        src={v.embedUrl}
                        title={v.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-red-50 text-[#e10600] px-2 py-0.5 rounded border border-red-200">
                            {v.category}
                          </span>
                          <span className="text-[11px] font-questrial text-[#888888]">
                            {v.date}
                          </span>
                        </div>
                        <h3 className="font-heading text-xl text-[#222222] mt-1 leading-tight">
                          {v.title}
                        </h3>
                        <p className="font-questrial text-xs text-[#555555] mt-1.5 leading-relaxed">
                          {v.description}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                        <a
                          href={v.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#e10600] font-bold hover:underline inline-flex items-center gap-1"
                        >
                          Watch on YouTube ↗
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Featured Video - "Leading Edge" Docuseries (All 9 Episodes) */}
            <div className="mb-14">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#e5e5e5] pb-3 mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#e10600] block">
                    COMPLETE 9-EPISODE DOCUSERIES
                  </span>
                  <h2 className="font-heading text-3xl text-[#222222] mt-0.5">
                    FEATURED SERIES: &ldquo;LEADING EDGE&rdquo;
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-questrial text-[#777777]">
                    Spearheaded by Kyle Lewis & IcePack Media
                  </span>
                  <span className="bg-red-50 text-[#e10600] border border-red-200 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider">
                    All 9 Episodes
                  </span>
                </div>
              </div>

              {/* Theater Mode Layout */}
              <div className="bg-[#1a1a1a] text-white border border-[#333333] rounded-lg overflow-hidden shadow-lg">
                <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#333333]">
                  {/* Left: Main Stage Video Player (7 Cols) */}
                  <div className="lg:col-span-7 p-5 sm:p-6 flex flex-col justify-between">
                    <div>
                      {(() => {
                        const currentEp =
                          mediaVideosData.featuredSeries.episodes[selectedLeadingEdgeIdx] ||
                          mediaVideosData.featuredSeries.episodes[0];
                        return (
                          <>
                            <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl border border-[#333333]">
                              <iframe
                                key={currentEp.id}
                                width="100%"
                                height="100%"
                                src={`${currentEp.embedUrl}?autoplay=0&rel=0`}
                                title={currentEp.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                              />
                            </div>

                            <div className="mt-4">
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold uppercase tracking-widest text-[#e10600] bg-red-950/60 border border-red-800/60 px-2.5 py-0.5 rounded">
                                    {currentEp.ep}
                                  </span>
                                  <span className="text-xs font-questrial text-white/70">
                                    {currentEp.stage}
                                  </span>
                                </div>
                                <a
                                  href={currentEp.youtubeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-bold text-[#e10600] hover:underline flex items-center gap-1"
                                >
                                  Open in YouTube ↗
                                </a>
                              </div>

                              <h3 className="font-heading text-2xl sm:text-3xl text-white mt-1 leading-tight">
                                {currentEp.title}
                              </h3>

                              <p className="font-questrial text-xs sm:text-sm text-white/80 mt-2 leading-relaxed">
                                {currentEp.description}
                              </p>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {/* Prev / Next controls */}
                    <div className="mt-6 pt-4 border-t border-[#333333] flex items-center justify-between">
                      <button
                        disabled={selectedLeadingEdgeIdx === mediaVideosData.featuredSeries.episodes.length - 1}
                        onClick={() => setSelectedLeadingEdgeIdx(selectedLeadingEdgeIdx + 1)}
                        className="px-3 py-1.5 bg-[#262626] hover:bg-[#333333] disabled:opacity-30 disabled:hover:bg-[#262626] text-white text-xs font-bold uppercase tracking-wider rounded transition"
                      >
                        ← Older Episode
                      </button>
                      <span className="text-[11px] font-mono text-white/50">
                        {selectedLeadingEdgeIdx + 1} of {mediaVideosData.featuredSeries.episodes.length}
                      </span>
                      <button
                        disabled={selectedLeadingEdgeIdx === 0}
                        onClick={() => setSelectedLeadingEdgeIdx(selectedLeadingEdgeIdx - 1)}
                        className="px-3 py-1.5 bg-[#262626] hover:bg-[#333333] disabled:opacity-30 disabled:hover:bg-[#262626] text-white text-xs font-bold uppercase tracking-wider rounded transition"
                      >
                        Newer Episode →
                      </button>
                    </div>
                  </div>

                  {/* Right: Episode Playlist Selector (5 Cols) */}
                  <div className="lg:col-span-5 bg-[#141414] p-4 sm:p-5 flex flex-col">
                    <div className="pb-3 border-b border-[#2a2a2a] mb-3 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#e10600] block">
                          SERIES PLAYLIST
                        </span>
                        <h4 className="font-heading text-lg text-white">
                          SELECT AN EPISODE
                        </h4>
                      </div>
                      <span className="text-[10px] font-questrial text-white/50">
                        Click to play
                      </span>
                    </div>

                    <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                      {mediaVideosData.featuredSeries.episodes.map((ep: any, idx: number) => {
                        const isSelected = selectedLeadingEdgeIdx === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedLeadingEdgeIdx(idx)}
                            className={`w-full p-2.5 rounded text-left transition flex items-center gap-3 border ${
                              isSelected
                                ? "bg-[#e10600]/20 border-[#e10600] shadow-sm"
                                : "bg-[#1f1f1f] border-transparent hover:bg-[#282828] text-white/80"
                            }`}
                          >
                            <div className="relative w-24 h-14 bg-black rounded overflow-hidden flex-shrink-0">
                              <img
                                src={`https://img.youtube.com/vi/${ep.id}/mqdefault.jpg`}
                                alt={ep.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <span
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                    isSelected ? "bg-[#e10600] text-white" : "bg-black/60 text-white"
                                  }`}
                                >
                                  ▶
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold uppercase text-[#e10600]">
                                  {ep.ep}
                                </span>
                                {isSelected && (
                                  <span className="text-[9px] bg-[#e10600] text-white px-1.5 py-0.5 rounded font-bold uppercase">
                                    Now Playing
                                  </span>
                                )}
                              </div>
                              <span className="font-heading text-sm text-white block truncate">
                                {ep.title}
                              </span>
                              <span className="text-[10px] font-questrial text-white/50 block truncate">
                                {ep.stage}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Broadcast Channels & Coverage */}
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-[#e10600] block mb-3">
                ADDITIONAL BROADCASTS & MEDIA CHANNELS
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {mediaVideosData.featuredChannels.map((c: any, idx: number) => (
                  <div key={idx} className="bg-white border border-[#e5e5e5] rounded-lg overflow-hidden shadow-sm flex flex-col sm:flex-row">
                    <img
                      src={c.image}
                      alt={c.title}
                      className="w-full sm:w-48 h-40 sm:h-auto object-cover bg-gray-100"
                    />
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#e10600] block mb-1">
                          {c.platform}
                        </span>
                        <h4 className="font-heading text-2xl text-[#222222]">
                          {c.title}
                        </h4>
                        <p className="font-questrial text-xs text-[#555555] mt-1.5 leading-relaxed">
                          {c.description}
                        </p>
                      </div>
                      <div className="mt-4">
                        {c.url ? (
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-[#e10600] hover:bg-[#b00400] text-white text-xs font-bold uppercase tracking-wider rounded transition inline-block"
                          >
                            {c.cta}
                          </a>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-[#777777] text-[11px] font-bold uppercase tracking-wider rounded">
                            {c.cta}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================== PHOTOS VIEW ===================== */}
        {activeTab === "photos" && (
          <div className="px-4 sm:px-8 py-10 max-w-[1280px] mx-auto w-full">
            {/* Header */}
            <div className="border-b-2 border-[#e10600] pb-4 mb-8">
              <span className="text-xs font-bold tracking-widest uppercase text-[#e10600]">
                ICEPACK MEDIA ARCHIVES · ON-ICE PHOTOGRAPHY
              </span>
              <h1 className="font-heading text-3xl sm:text-5xl text-[#222222] leading-none mt-1">
                PHOTO GALLERY
              </h1>
              <p className="font-questrial text-sm text-[#555555] mt-2 max-w-2xl leading-relaxed">
                Archival action shots, gameday emotion, trophy ceremonies, and team traditions captured by our student media photographers.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {["all", "Gameday", "Rivalry", "Historic", "Championship", "Tradition", "Training"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPhotoFilter(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
                    photoFilter.toLowerCase() === cat.toLowerCase()
                      ? "bg-[#e10600] text-white shadow-sm"
                      : "bg-gray-100 text-[#555555] hover:bg-gray-200"
                  }`}
                >
                  {cat === "all" ? "All Photos" : cat}
                </button>
              ))}
            </div>

            {/* Photos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {mediaPhotosData
                .filter((p: any) => photoFilter === "all" || p.category.toLowerCase() === photoFilter.toLowerCase())
                .map((p: any) => (
                  <div
                    key={p.id}
                    className="bg-white border border-[#e5e5e5] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group"
                  >
                    <div className="relative overflow-hidden aspect-[4/3] bg-stone-100">
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <span className="absolute top-3 left-3 bg-[#222222]/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                        {p.category}
                      </span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-heading text-xl text-[#222222] leading-tight">
                          {p.title}
                        </h3>
                        <p className="font-questrial text-xs text-[#555555] mt-1.5 leading-relaxed">
                          {p.caption}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-100 text-[10px] font-questrial text-[#888888]">
                        📸 {p.photographer}
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Photo Contribution Notice */}
            <div className="p-6 bg-stone-50 border border-[#e5e5e5] rounded-lg flex flex-wrap items-center justify-between gap-4 text-xs font-questrial">
              <div>
                <strong className="text-[#222222] block font-heading text-lg">HAVE HISTORIC TEAM PHOTOS?</strong>
                <span className="text-[#666666]">
                  If you have vintage photos from past seasons or tournament games, help us preserve the program&apos;s history.
                </span>
              </div>
              <a
                href="mailto:Admin@icepackhockey.com?subject=Icepack%20Photo%20Contribution"
                className="px-4 py-2 bg-[#222222] hover:bg-black text-white font-bold uppercase tracking-wider rounded transition"
              >
                Send Us Photos →
              </a>
            </div>
          </div>
        )}

        {/* ===================== MERCH VIEW ===================== */}
        {activeTab === "merch" && (
          <div className="px-4 sm:px-8 py-10 max-w-[1280px] mx-auto w-full">
            {/* Header */}
            <div className="border-b-2 border-[#e10600] pb-4 mb-8">
              <span className="text-xs font-bold tracking-widest uppercase text-[#e10600]">
                OFFICIAL APPAREL & GEAR · 50TH ANNIVERSARY SEASON
              </span>
              <h1 className="font-heading text-3xl sm:text-5xl text-[#222222] leading-none mt-1">
                ICEPACK TEAM MERCHANDISE
              </h1>
              <p className="font-questrial text-sm text-[#555555] mt-2 max-w-2xl">
                Shop official 50th Anniversary on-ice jerseys, upcoming gameday apparel, and our complete retail line
                through our official partner, The Red and White Shop.
              </p>
            </div>

            {/* 1. TEAM EXCLUSIVES & PRE-ORDERS (Jersey + Soon-to-be T-Shirts) */}
            <div className="mb-14">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-xs font-bold tracking-wider uppercase text-[#e10600]">
                    DIRECT FROM THE CLUB
                  </span>
                  <h2 className="font-heading text-3xl text-[#222222] mt-0.5">
                    TEAM EXCLUSIVES & COMMEMORATIVE GEAR
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {merchData.team_exclusive?.map((item: any) => (
                  <div
                    key={item.id}
                    className="bg-white border-2 border-[#e10600]/30 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative bg-gradient-to-b from-gray-50 to-gray-100 p-6 flex items-center justify-center h-80 overflow-hidden border-b border-[#e5e5e5]">
                        {item.status && (
                          <span
                            className={`absolute top-4 left-4 text-white text-[11px] font-bold px-3 py-1 rounded uppercase tracking-wider shadow ${
                              item.status.toLowerCase().includes("pre-order")
                                ? "bg-[#e10600]"
                                : item.status.toLowerCase().includes("production")
                                ? "bg-amber-600"
                                : "bg-neutral-800"
                            }`}
                          >
                            {item.status}
                          </span>
                        )}
                        {item.price && (
                          <span className="absolute top-4 right-4 bg-[#222222] text-white text-[11px] font-bold px-3 py-1 rounded tracking-wider">
                            {item.price}
                          </span>
                        )}
                        <img
                          src={item.secondary_image || item.image}
                          alt={item.title}
                          className="h-full object-contain hover:scale-105 transition duration-500 drop-shadow-lg"
                          onError={(e: any) => {
                            e.target.src = "/07cdeb598c1716ddf52f5438f9484da2.png";
                          }}
                        />
                      </div>
                      <div className="p-6">
                        {item.badge && (
                          <span className="text-[11px] font-bold text-[#e10600] uppercase tracking-wider">
                            {item.badge}
                          </span>
                        )}
                        <h3 className="font-heading text-3xl text-[#222222] leading-tight mt-1 uppercase">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="font-questrial text-xs text-[#555555] leading-relaxed mt-2">
                            {item.description}
                          </p>
                        )}

                        {Array.isArray(item.features) && item.features.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-[#e5e5e5] space-y-2 text-xs font-questrial text-[#444444]">
                            {item.features.map((feat: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-2">
                                <span className="text-[#e10600] font-bold">✓</span>
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-6 pt-0">
                      {item.url && item.url !== "#" ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-3 bg-[#e10600] hover:bg-[#c40500] text-white font-heading text-lg text-center rounded transition shadow flex items-center justify-center gap-2 uppercase tracking-wider"
                        >
                          {item.action_label || "View Store Item ↗"}
                        </a>
                      ) : (
                        <button
                          onClick={() =>
                            alert(
                              `${item.title} is currently in production by our student creative staff! Check back soon or visit the merchandise table at our next home game at Lane Arena.`
                            )
                          }
                          className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-[#444444] font-heading text-lg text-center rounded transition border border-gray-300 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                        >
                          {item.action_label || "Coming Soon · Check At Gameday"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. OFFICIAL RETAIL PARTNER: THE RED AND WHITE SHOP */}
            <div className="bg-white border border-[#e5e5e5] rounded-xl p-6 sm:p-10 shadow-sm mb-12">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8 pb-8 border-b border-[#e5e5e5]">
                <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                  <div className="w-48 sm:w-56 h-28 p-2 flex items-center justify-center bg-white rounded border border-[#e5e5e5] shadow-sm flex-shrink-0">
                    <img
                      src="/red-and-white-shop.png"
                      alt="The Red and White Shop Logo"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold tracking-widest uppercase text-[#e10600]">
                      OFFICIAL RETAIL APPAREL PARTNER
                    </span>
                    <h2 className="font-heading text-4xl text-[#222222] leading-tight mt-1">
                      THE RED AND WHITE SHOP
                    </h2>
                    <p className="font-questrial text-xs text-[#555555] max-w-xl mt-1 leading-relaxed">
                      3514 Hillsborough St, Raleigh, NC 27607 (Across from NC State Campus).
                      The Red and White Shop is the primary retail outlet for authentic IcePack jerseys, hoodies, tees, Richardson caps, and gameday scarves.
                    </p>
                  </div>
                </div>

                <a
                  href="https://www.redandwhiteshop.com/search?q=icepack"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-[#e10600] hover:bg-[#c40500] text-white font-heading text-lg rounded shadow transition flex-shrink-0 flex items-center gap-2"
                >
                  <span>SHOP ENTIRE STORE (10+ ITEMS)</span>
                  <span>↗</span>
                </a>
              </div>

              {/* Retail Category Filter Pills */}
              <div className="pt-8">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <h3 className="font-heading text-2xl text-[#222222]">
                    AVAILABLE NOW ON REDANDWHITESHOP.COM
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "all", label: "All Items (10)" },
                      { id: "jerseys", label: "Jerseys (2)" },
                      { id: "hoodies", label: "Hoodies (2)" },
                      { id: "t-shirts", label: "Tees (2)" },
                      { id: "hats", label: "Hats (2)" },
                      { id: "accessories", label: "Scarves (2)" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setMerchFilter(f.id)}
                        className={`px-3.5 py-1.5 rounded text-xs font-heading tracking-wider uppercase transition ${
                          merchFilter === f.id
                            ? "bg-[#e10600] text-white shadow-sm"
                            : "bg-gray-100 text-[#555555] hover:bg-gray-200"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {merchData.retail_partner.items
                    .filter((item) => {
                      if (merchFilter === "all") return true;
                      if (merchFilter === "jerseys") return item.category.toLowerCase().includes("jersey");
                      if (merchFilter === "hoodies") return item.category.toLowerCase().includes("hoodie");
                      if (merchFilter === "t-shirts") return item.category.toLowerCase().includes("shirt");
                      if (merchFilter === "hats") return item.category.toLowerCase().includes("hat");
                      if (merchFilter === "accessories") return item.category.toLowerCase().includes("accessories");
                      return true;
                    })
                    .map((item) => (
                      <div
                        key={item.id}
                        className="bg-white border border-[#e5e5e5] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between group"
                      >
                        <div>
                          <div className="h-56 bg-gray-50 p-4 flex items-center justify-center overflow-hidden border-b border-[#e5e5e5]">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-500"
                            />
                          </div>
                          <div className="p-4">
                            <span className="text-[10px] font-bold text-[#e10600] uppercase tracking-wider block">
                              {item.category}
                            </span>
                            <h4 className="font-heading text-lg text-[#222222] leading-tight mt-1 group-hover:text-[#e10600] transition">
                              {item.title}
                            </h4>
                            <span className="font-heading text-xl text-[#222222] font-bold block mt-2">
                              {item.price}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 pt-0">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 bg-[#222222] hover:bg-[#e10600] text-white text-xs font-heading tracking-wider uppercase text-center rounded transition block shadow-sm"
                          >
                            Buy on Red & White Shop ↗
                          </a>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== FOOTBALL TICKET RAFFLE VIEW ===================== */}
        {activeTab === "raffle" && (
          <div className="px-4 sm:px-8 py-10 max-w-[1280px] mx-auto w-full space-y-10 animate-fadeIn">
            {/* Header / Countdown Banner */}
            <div className="border-b-4 border-[#e10600] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-bold tracking-widest uppercase bg-amber-400 text-stone-900 px-3 py-1 rounded-full shadow-xs">
                    🏈 Rivalry Ticket Raffle
                  </span>
                  <span className="text-xs font-bold tracking-wider uppercase bg-red-600 text-white px-3 py-1 rounded-full animate-pulse shadow-xs">
                    ⏳ Limited Time · Ends in ~10 Days
                  </span>
                  <span className="text-xs text-stone-500 font-mono">
                    Drawing: Fri Nov 27 @ 8:00 PM
                  </span>
                </div>
                <h1 className="font-heading text-4xl sm:text-6xl text-[#222222] leading-none mt-1">
                  UNC / NCSU FOOTBALL TICKET RAFFLE
                </h1>
                <p className="font-questrial text-sm sm:text-base text-[#444444] mt-2 max-w-3xl leading-relaxed">
                  Enter for your chance to win <strong>Two (2) Lower Bowl Tickets</strong> to the NC State Wolfpack vs. UNC Chapel Hill football rivalry game at Kenan Memorial Stadium on <strong>Saturday, November 28, 2026</strong>, plus an official <strong>Rams Head Deck parking pass</strong>!
                </p>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row gap-3">
                <a
                  href="https://store.icepackhockey.com/store/p87/UNC%2FNCSU_Football_Ticket_Raffle.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3.5 bg-[#e10600] hover:bg-[#c40500] text-white font-heading text-xl rounded-xl shadow-lg transition inline-flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  <span>Buy Raffle Tickets</span>
                  <span>↗</span>
                </a>
              </div>
            </div>

            {/* Main Showcase Grid: Left Poster Image, Right Details & Tiers */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Official Poster Graphic */}
              <div className="lg:col-span-5 bg-stone-100 rounded-2xl overflow-hidden border border-stone-200 shadow-md">
                <img
                  src="/raffle/unc-ncsu-football-raffle.webp"
                  alt="UNC vs NCSU Football Ticket Raffle Official Poster"
                  className="w-full h-auto object-cover hover:scale-[1.01] transition duration-300"
                  onError={(e: any) => {
                    e.target.src = "/raffle/unc-ncsu-football-raffle.jpg";
                  }}
                />
                <div className="p-4 bg-stone-900 text-white text-center">
                  <span className="text-xs text-stone-300 block font-questrial">
                    Official promotional flyer for the 2026 NCSU vs. UNC Football Ticket Raffle.
                  </span>
                </div>
              </div>

              {/* Right Column: Prize Highlights, Tiers, Video Instructions & Rules */}
              <div className="lg:col-span-7 space-y-6">
                {/* Prize Breakdown Card */}
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
                  <h3 className="font-heading text-2xl sm:text-3xl text-[#222222] border-b border-stone-200 pb-2">
                    🏆 THE GRAND PRIZE PACKAGE
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
                      <span className="text-2xl block mb-1">🎟️</span>
                      <span className="font-heading text-xl text-[#222222] block">2 GAME TICKETS</span>
                      <span className="text-xs text-stone-600 block mt-0.5">Section 315 Bowl Seats</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
                      <span className="text-2xl block mb-1">🅿️</span>
                      <span className="font-heading text-xl text-[#222222] block">PARKING PASS</span>
                      <span className="text-xs text-stone-600 block mt-0.5">Rams Head Parking Deck</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
                      <span className="text-2xl block mb-1">📍</span>
                      <span className="font-heading text-xl text-[#222222] block">KENAN STADIUM</span>
                      <span className="text-xs text-stone-600 block mt-0.5">Saturday, Nov 28 · Chapel Hill</span>
                    </div>
                  </div>
                  <p className="text-xs text-stone-500 font-questrial leading-relaxed">
                    *Kickoff time TBD. All raffle proceeds directly benefit the Icepack Hockey Club at NC State, an independent student-run 501(c)(3) nonprofit program.
                  </p>
                </div>

                {/* Entry Tiers Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading text-2xl text-[#222222]">
                      🎟️ SELECT RAFFLE ENTRY TIER
                    </h3>
                    <span className="text-xs text-stone-500 font-mono">Multiple entries allowed</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {[
                      { tier: "1 Raffle Ticket", price: "$8.00", perTicket: "$8.00 / ticket", badge: "Single Entry" },
                      { tier: "5 Raffle Tickets", price: "$30.00", perTicket: "$6.00 / ticket", badge: "Popular" },
                      { tier: "10 Raffle Tickets", price: "$40.00", perTicket: "$4.00 / ticket", badge: "Great Odds" },
                      { tier: "25 Raffle Tickets", price: "$50.00", perTicket: "$2.00 / ticket", badge: "BEST VALUE · 75% OFF" },
                    ].map((t, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border transition shadow-sm flex flex-col justify-between ${
                          idx === 3
                            ? "bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/40"
                            : "bg-white border-stone-200 hover:border-[#e10600]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                              {t.badge}
                            </span>
                            <h4 className="font-heading text-xl text-[#222222] mt-1.5">{t.tier}</h4>
                            <span className="text-xs text-stone-500 font-questrial">{t.perTicket}</span>
                          </div>
                          <span className="font-heading text-3xl text-[#e10600]">{t.price}</span>
                        </div>

                        <a
                          href="https://store.icepackhockey.com/store/p87/UNC%2FNCSU_Football_Ticket_Raffle.html"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`mt-4 py-2 px-3 rounded-lg text-xs font-heading uppercase tracking-wider text-center transition font-bold block ${
                            idx === 3
                              ? "bg-amber-400 hover:bg-amber-300 text-stone-900 shadow"
                              : "bg-[#e10600] hover:bg-[#c40500] text-white shadow-xs"
                          }`}
                        >
                          Select & Checkout ↗
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Important Instructions & Video Help */}
                <div className="bg-red-50/60 border border-red-200 rounded-2xl p-5 sm:p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚠️</span>
                    <h4 className="font-heading text-lg text-[#222222] tracking-wide">
                      IMPORTANT PURCHASE INSTRUCTIONS
                    </h4>
                  </div>
                  <p className="text-xs text-stone-700 font-questrial leading-relaxed">
                    You must make a selection for the raffle ticket tier you want and cost during checkout.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <a
                      href="https://vimeo.com/1184147681/41160384ea"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg transition shadow-xs"
                    >
                      <span>▶ Watch Video Instructions</span>
                      <span className="text-[10px] text-stone-400">(Vimeo ↗)</span>
                    </a>
                    <a
                      href="https://store.icepackhockey.com/store/p87/UNC%2FNCSU_Football_Ticket_Raffle.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-stone-100 text-[#e10600] border border-[#e10600] text-xs font-bold uppercase tracking-wider rounded-lg transition"
                    >
                      <span>Open Checkout Portal ↗</span>
                    </a>
                  </div>
                </div>

                {/* Drawing & Claim Rules */}
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 sm:p-6 space-y-3">
                  <h4 className="font-heading text-lg text-[#222222] tracking-wide">
                    📜 DRAWING TIMELINE & CLAIM RULES
                  </h4>
                  <ul className="text-xs text-stone-600 font-questrial space-y-2 list-disc list-inside leading-relaxed">
                    <li>
                      <strong>Drawing Time:</strong> The winner will be drawn after <strong>8:00 PM on Friday, November 27, 2026</strong> (the night before kickoff).
                    </li>
                    <li>
                      <strong>Notification:</strong> The lucky winner will be notified by <strong>10:00 PM</strong> on drawing night via email/phone provided at checkout.
                    </li>
                    <li>
                      <strong>Claim Window:</strong> The winner will have until <strong>9:00 AM the next morning (Saturday, Nov 28)</strong> to claim the tickets.
                    </li>
                    <li>
                      <strong>Redraw Policy:</strong> If the tickets are not claimed by 9:00 AM, a new winner will be drawn immediately until claimed.
                    </li>
                    <li>
                      <strong>Tax Exemption:</strong> All ticket contributions support the Ice Hockey Club at NC State, an exempt 501(c)(3) nonprofit (EIN: 46-4129861).
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== SUPPORT / ANNUAL FUND VIEW ===================== */}
        {activeTab === "support" && (
          <div className="px-4 sm:px-8 py-10 max-w-[1280px] mx-auto w-full space-y-12">
            {/* Header Banner with Top-Right Donate Button */}
            <div className="border-b-4 border-[#e10600] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <span className="text-xs font-bold tracking-widest uppercase text-[#e10600]">
                  501(c)(3) TAX-EXEMPT NONPROFIT · EIN 46-4129861
                </span>
                <h1 className="font-heading text-4xl sm:text-6xl text-[#222222] leading-none mt-1">
                  50TH YEAR ANNIVERSARY ANNUAL FUND
                </h1>
                <p className="font-questrial text-sm sm:text-base text-[#444444] mt-3 max-w-3xl leading-relaxed">
                  <strong>Fifty years on the ice. Self funded from day one.</strong> As an independent 501(c)(3) organization run by student-athletes and alumni, our program relies entirely on player dues, alumni gifts, and community partnerships to cover ice time, team travel, equipment, and certified officiating. Your support directly fuels the team&apos;s pursuit of an ACHA National Championship.
                </p>
              </div>

              <div className="shrink-0">
                <a
                  href="https://givebutter.com/icepack50"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3.5 bg-[#e10600] hover:bg-[#c40500] text-white font-heading text-xl rounded-xl shadow-lg transition inline-flex items-center gap-2 uppercase tracking-wider"
                >
                  <span>Donate Online</span>
                  <span>→</span>
                </a>
              </div>
            </div>

            {/* 6 ANNUAL FUND GIVING TIERS (CARDS) */}
            <div className="space-y-6">
              <div className="border-b-2 border-stone-200 pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-[#e10600] font-heading">
                    CHOOSE YOUR LEVEL
                  </span>
                  <h2 className="font-heading text-3xl sm:text-4xl text-[#222222]">
                    ANNUAL GIVING TIERS & DONOR PERKS
                  </h2>
                </div>
                <span className="text-xs text-neutral-500 font-questrial self-start sm:self-auto">
                  Select an annual giving tier below to contribute online
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {givingLevelsData.map((tier: any) => (
                  <div
                    key={tier.id}
                    className={`bg-white rounded-2xl border transition flex flex-col justify-between shadow-sm hover:shadow-md ${
                      tier.highlight
                        ? "border-[#e10600] ring-2 ring-[#e10600]/20"
                        : "border-[#e5e5e5]"
                    }`}
                  >
                    {/* Tier Header */}
                    <div className="p-6 border-b border-stone-100">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded ${
                            tier.highlight
                              ? "bg-red-100 text-[#e10600]"
                              : "bg-stone-100 text-stone-700"
                          }`}
                        >
                          {tier.badge}
                        </span>
                        <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded font-mono">
                          {tier.total_value}
                        </span>
                      </div>
                      <h3 className="font-heading text-2xl sm:text-3xl text-[#222222] leading-none">
                        {tier.name}
                      </h3>
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="font-heading text-4xl text-[#e10600]">
                          {tier.amount_display}
                        </span>
                        <span className="text-xs text-neutral-500 font-questrial">
                          / annual gift
                        </span>
                      </div>
                      <p className="font-questrial text-xs text-[#555555] mt-2 leading-relaxed">
                        {tier.tagline}
                      </p>
                    </div>

                    {/* Perks List */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-heading block mb-2.5">
                          Included Donor Benefits:
                        </span>
                        <ul className="space-y-2.5 text-xs text-[#333333] font-questrial">
                          {tier.perks.map((p: any, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-[#e10600] font-bold text-sm shrink-0">✓</span>
                              <div className="flex-1">
                                <span className="font-semibold text-neutral-900">{p.item}</span>
                                {p.val && (
                                  <span className="text-[11px] text-neutral-400 font-mono ml-1.5">
                                    ({p.val} value)
                                  </span>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* In-Arena Credit Note for Captain & 1976 Club */}
                      {(tier.id === "captain" || tier.id === "1976-club") && (
                        <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-950 font-questrial leading-snug">
                          <strong>Arena Credit Terms:</strong> $25 credit allocated per home game across all 10 Lane Arena games. Usable at the Red & White Shop or Cafe by Tribeca Tavern. Single-game use; no cash trade-in value; does not roll over if unused.
                        </div>
                      )}

                      {/* CTA Button */}
                      <div className="pt-2">
                        <a
                          href={tier.donate_url || "https://givebutter.com/icepack50"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-full py-2.5 rounded font-heading text-base tracking-wider uppercase text-center block transition shadow-sm ${
                            tier.highlight
                              ? "bg-[#e10600] hover:bg-[#c40500] text-white"
                              : "bg-[#222222] hover:bg-black text-white"
                          }`}
                        >
                          Join at {tier.amount_display} Level →
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WHERE YOUR GIFT GOES: 4 OPERATIONAL PILLARS */}
            <div className="space-y-6">
              <div className="border-b-2 border-stone-200 pb-3">
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#e10600] font-heading">
                  TRANSPARENCY & FIDUCIARY STEWARDSHIP
                </span>
                <h2 className="font-heading text-3xl sm:text-4xl text-[#222222]">
                  WHERE YOUR DOLLARS GO
                </h2>
                <p className="font-questrial text-xs sm:text-sm text-[#666666] mt-0.5">
                  100% of all gifts directly fund student-athlete operations across our four primary expense areas:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-3xl">🏒</span>
                      <span className="text-[11px] font-bold font-mono text-[#e10600] bg-white px-2.5 py-0.5 rounded border border-stone-200 shadow-xs shrink-0">
                        $3,000 per game
                      </span>
                    </div>
                    <h4 className="font-heading text-xl text-[#222222]">ICE TIME</h4>
                    <p className="font-questrial text-xs text-[#555555] mt-1 leading-relaxed">
                      Practice sheets, morning skate sessions, and gameday ice rental at Lane Arena @ Wake Competition Center.
                    </p>
                  </div>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-3xl">🚌</span>
                      <span className="text-[11px] font-bold font-mono text-[#e10600] bg-white px-2.5 py-0.5 rounded border border-stone-200 shadow-xs shrink-0">
                        Approx. $15,000 per trip
                      </span>
                    </div>
                    <h4 className="font-heading text-xl text-[#222222]">TEAM TRAVEL</h4>
                    <p className="font-questrial text-xs text-[#555555] mt-1 leading-relaxed">
                      Charter buses, team flights, and lodging for national road trips (Utah, Alabama, Liberty, West Virginia).
                    </p>
                  </div>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-3xl">🛡️</span>
                      <span className="text-[11px] font-bold font-mono text-[#e10600] bg-white px-2.5 py-0.5 rounded border border-stone-200 shadow-xs shrink-0">
                        $10,000 per year
                      </span>
                    </div>
                    <h4 className="font-heading text-xl text-[#222222]">EQUIPMENT</h4>
                    <p className="font-questrial text-xs text-[#555555] mt-1 leading-relaxed">
                      Certified helmets, protective padding, team sticks, game socks, and authentic custom sweaters.
                    </p>
                  </div>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-3xl">⚖️</span>
                      <span className="text-[11px] font-bold font-mono text-[#e10600] bg-white px-2.5 py-0.5 rounded border border-stone-200 shadow-xs shrink-0">
                        $15,000 per year
                      </span>
                    </div>
                    <h4 className="font-heading text-xl text-[#222222]">LEAGUE & OFFICIALS</h4>
                    <p className="font-questrial text-xs text-[#555555] mt-1 leading-relaxed">
                      ACHA Division I annual dues, SECHL conference marks, and certified on-ice referees and medical staff.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* TAX DEDUCTIBILITY & LEGAL 501(c)(3) DETAILS */}
            <div className="bg-stone-100 rounded-2xl p-6 sm:p-8 border border-stone-200 text-xs text-[#444444] font-questrial space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-300 pb-3">
                <div>
                  <h4 className="font-heading text-xl text-[#222222]">TAX-EXEMPT STATUS & GOVERNANCE</h4>
                  <span className="text-[11px] text-[#666666]">The Ice Hockey Club at NC State, Inc. · 501(c)(3) Public Charity</span>
                </div>
                <div className="font-mono text-xs font-bold text-[#e10600] bg-white px-3 py-1 rounded border border-stone-300 self-start sm:self-auto">
                  EIN: 46-4129861
                </div>
              </div>

              <p className="leading-relaxed">
                Contributions to the Ice Hockey Club at NC State, Inc. are tax-deductible to the full extent of the law. In accordance with IRS regulations, the tax-deductible portion of your contribution is limited to the excess of your gift over the fair market value of any goods or services received. Donors may choose to decline donor perks at checkout for a 100% tax-deductible contribution.
              </p>
              <p className="leading-relaxed text-[11px] text-[#666666]">
                Official Mailing Address: 2611 Cates Avenue, Room 1000, Raleigh, NC 27695-8111. For corporate match forms, stock gifts, or donor advised fund (DAF) distributions, please contact <a href="mailto:Admin@icepackhockey.com" className="text-[#e10600] font-bold hover:underline">Admin@icepackhockey.com</a>.
              </p>
            </div>
          </div>
        )}

        {/* ===================== SPONSORS & MEDIA KIT VIEW ===================== */}
        {activeTab === "sponsors" && (
          <div className="px-4 sm:px-8 py-10 max-w-[1280px] mx-auto w-full">
            <div className="border-b-2 border-[#e10600] pb-4 mb-8">
              <span className="text-xs font-bold tracking-widest uppercase text-[#e10600]">
                CORPORATE SPONSORSHIPS & MEDIA KIT
              </span>
              <h1 className="font-heading text-3xl sm:text-5xl text-[#222222] leading-none mt-1">PARTNER WITH THE PACK</h1>
              <p className="font-questrial text-sm text-[#555555] mt-2">
                Connect your business with the most passionate collegiate hockey fan base in the Southeast.
              </p>
            </div>

            {/* Reach Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                { stat: "24,000+", label: "Frozen Finley Attendance (ACHA Record)" },
                { stat: "1,000+", label: "Fans Per Home Game at Lane Arena" },
                { stat: "85,000+", label: "Annual Social & Broadcast Reach" },
                { stat: "100%", label: "Tax-Deductible Corporate Sponsorship" },
              ].map((s, i) => (
                <div key={i} className="bg-[#222222] text-white p-6 rounded-lg text-center">
                  <span className="font-heading text-4xl text-[#e10600] block">{s.stat}</span>
                  <span className="text-xs font-bold uppercase text-white/70 mt-1 block">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Partnership Tiers */}
            <h2 className="font-heading text-3xl text-[#222222] mb-6">SPONSORSHIP PACKAGES</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              {[
                {
                  tier: "Community Partner",
                  price: "$500",
                  perks: ["Digital logo on website partner strip", "Social media welcome announcement", "2 Season tickets"],
                },
                {
                  tier: "Game Night Partner",
                  price: "$1,500",
                  perks: ["Official Game Night sponsor", "In-game PA announcements & promo", "4 Season tickets + VIP seating"],
                },
                {
                  tier: "Season Partner",
                  price: "$3,500",
                  perks: ["Permanent rink-board placement", "Stars of the Week presented by tag", "Broadcast commercial rotation", "8 Season passes"],
                },
                {
                  tier: "Founding Partner",
                  price: "$10,000",
                  perks: ["Full jersey patch sponsorship", "Governor's Cup headline exposure", "PackTV broadcast presenting sponsor", "Lifetime booster status"],
                },
              ].map((pkg, i) => (
                <div key={i} className="border border-[#e5e5e5] rounded-lg p-6 bg-white shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="font-heading text-2xl text-[#222222]">{pkg.tier}</span>
                    <span className="font-heading text-3xl text-[#e10600] block mt-1">{pkg.price}</span>
                    <ul className="mt-4 space-y-2 text-xs font-questrial text-[#555555]">
                      {pkg.perks.map((p, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-[#e10600] font-bold">✓</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <a
                    href="mailto:brent@charterwm.com?subject=IcePack%20Sponsorship%20Inquiry"
                    className="mt-6 w-full py-2.5 bg-[#222222] hover:bg-[#e10600] text-white font-heading text-base text-center rounded transition"
                  >
                    INQUIRE NOW
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== ABOUT / 50-YEAR HISTORY VIEW ===================== */}
        {(activeTab === "history" || activeTab === "about") && (
          <div className="px-4 sm:px-8 py-10 max-w-[1280px] mx-auto w-full">
            {/* Header */}
            <div className="border-b-2 border-[#e10600] pb-4 mb-8">
              <span className="text-xs font-bold tracking-widest uppercase text-[#e10600]">
                EST. 1976 · FIFTY YEARS OF COLLEGIATE HOCKEY
              </span>
              <h1 className="font-heading text-3xl sm:text-5xl text-[#222222] leading-none mt-1">
                A HISTORY OF HOCKEY AT NC STATE
              </h1>
              <p className="font-questrial text-sm text-[#555555] mt-2 max-w-3xl leading-relaxed">
                The Icepack Hockey Team at NC State University kindly asks that you join us in celebrating our 50th anniversary during the 2026–2027 season.
                We thank those who shaped the program into what it is today, and look forward to leaving a continued legacy of greatness across the next 50 years.
              </p>
            </div>

            {/* Introductory Notice Banner */}
            <div className="bg-red-50/70 border border-red-200 rounded-lg p-5 mb-8 text-xs font-questrial text-[#333333] leading-relaxed">
              <span className="font-bold text-[#e10600] uppercase tracking-wide block mb-1">
                COMMEMORATING OUR GOLDEN ANNIVERSARY
              </span>
              To better appreciate how far the program has come, the complete chronological history of the program has been recorded below by our team historians and student staff.
              Some records are still incomplete: if you have historical photos, newspaper clippings, or game records that can help us fill in the blanks, please reach out to us at{" "}
              <a href="mailto:Admin@icepackhockey.com" className="text-[#e10600] font-bold hover:underline">
                Admin@icepackhockey.com
              </a>.
            </div>

            {/* FAST FACTS GRID (From the Live Site!) */}
            <div className="mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-[#e10600] block mb-3">
                PROGRAM HIGHLIGHTS & FAST FACTS
              </span>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { stat: "6", label: "League Champions", sub: "Admiral's Cup Titles" },
                  { stat: "9", label: "Season Champions", sub: "Regular Season Titles" },
                  { stat: "11", label: "ACC M2 Titles", sub: "Division Championships" },
                  { stat: "19 of 27", label: "Final Four", sub: "Tied 1st in ACCHL History" },
                  { stat: "11", label: "Hall of Fame", sub: "Inductees Honored" },
                  { stat: "24,000+", label: "Frozen Finley", sub: "ACHA Attendance Record" },
                ].map((f, i) => (
                  <div key={i} className="bg-[#222222] text-white p-5 rounded-lg text-center flex flex-col justify-center">
                    <span className="font-heading text-4xl text-[#e10600]">{f.stat}</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-white mt-1">{f.label}</span>
                    <span className="text-[10px] text-white/60 mt-0.5">{f.sub}</span>
                  </div>
                ))}
              </div>

              {/* Individual Honors Strip */}
              <div className="mt-4 p-4 bg-gray-50 border border-[#e5e5e5] rounded-lg text-xs font-questrial text-[#555555] flex flex-wrap gap-x-6 gap-y-2 justify-center">
                <span>🏆 <strong>11</strong> Hall of Fame Inductees</span>
                <span>⭐ <strong>10</strong> Season MVP Recipients</span>
                <span>🥇 <strong>6</strong> Tournament MVP Recipients</span>
                <span>🎓 <strong>2</strong> Scholar-Athlete Award Winners</span>
                <span>🌟 <strong>3</strong> Player of the Year Honorees</span>
                <span>👔 <strong>3</strong> Coach of the Year Awards</span>
              </div>
            </div>

            {/* CHRONOLOGICAL ERAS (Un-summarized Full Intern Texts) */}
            <div className="space-y-8 mb-12">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#e10600]">
                  THE COMPLETE 50-YEAR CHRONOLOGY
                </span>
                <h2 className="font-heading text-3xl text-[#222222] mt-0.5">
                  FIFTY YEARS ACROSS SIX ERAS
                </h2>
              </div>

              {historyEras.map((era: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-white border border-[#e5e5e5] rounded-lg p-6 sm:p-8 shadow-sm hover:shadow transition"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#e5e5e5] pb-3 mb-4">
                    <div>
                      <span className="text-[11px] font-bold text-[#e10600] uppercase tracking-widest block">
                        ERA {idx + 1}
                      </span>
                      <h3 className="font-heading text-2xl sm:text-3xl text-[#222222] mt-0.5">
                        {era.era}
                      </h3>
                    </div>
                    {era.theme && (
                      <span className="text-xs font-bold bg-gray-100 text-[#555555] px-3 py-1 rounded uppercase tracking-wider">
                        {era.theme}
                      </span>
                    )}
                  </div>

                  {/* Render content: side-by-side if era.image_side (Era 1 Technician clip like live site) */}
                  {era.image_side ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center my-2">
                      <div className="space-y-3 font-questrial text-sm text-[#444444] leading-relaxed">
                        {era.paragraphs.map((para: string, pIdx: number) => (
                          <p key={pIdx}>{para}</p>
                        ))}
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="border-2 border-black rounded p-1 bg-white shadow-sm max-w-md w-full">
                          <img
                            src={era.image}
                            alt={era.image_caption || era.era}
                            className="w-full h-auto object-contain rounded-sm"
                          />
                        </div>
                        {era.citation && (
                          <span className="text-[11px] font-questrial text-[#777777] italic text-center mt-2 max-w-md block">
                            &gt;&gt; {era.citation} &lt;&lt;
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 font-questrial text-sm text-[#444444] leading-relaxed">
                        {era.paragraphs.map((para: string, pIdx: number) => (
                          <p key={pIdx}>{para}</p>
                        ))}
                      </div>

                      {era.image && (
                        <div className="mt-6 border border-[#e5e5e5] rounded-lg overflow-hidden bg-stone-50">
                          <img
                            src={era.image}
                            alt={era.image_caption || era.era}
                            className="w-full h-72 sm:h-96 object-cover"
                          />
                          {era.image_caption && (
                            <div className="p-3 bg-[#1a1a1a] text-white/90 text-xs font-questrial flex flex-wrap items-center justify-between gap-2">
                              <span>📸 {era.image_caption}</span>
                              <span className="text-[10px] text-white/60">
                                {era.image_credit ? era.image_credit : "Photo by Kaydee Gawlik / IcePack Media"}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {/* Stephen Russell Memorial Link within Era 3 */}
                  {era.era.includes("2004–2009") && (
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center">
                      <button
                        onClick={() => {
                          setActiveTab("stephen-russell");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#e10600] hover:underline"
                      >
                        Read the full Stephen Russell Tribute & Tournament History →
                      </button>
                    </div>
                  )}

                  {/* Citation Note */}
                  {era.citation && !era.image_side && (
                    <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-[#777777] italic font-questrial">
                      Source: {era.citation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== GOVERNANCE & OFFICERS VIEW ===================== */}
        {activeTab === "governance" && (
          <div className="px-4 sm:px-8 py-10 max-w-[1280px] mx-auto w-full">
            {/* Header */}
            <div className="border-b-2 border-[#e10600] pb-4 mb-8">
              <span className="text-xs font-bold tracking-widest uppercase text-[#e10600]">
                501(c)(3) NONPROFIT CHARTER & STUDENT LEADERSHIP
              </span>
              <h1 className="font-heading text-3xl sm:text-5xl text-[#222222] leading-none mt-1">
                PROGRAM GOVERNANCE & TEAM OFFICERS
              </h1>
              <p className="font-questrial text-sm text-[#555555] mt-2 max-w-3xl leading-relaxed">
                The Ice Hockey Club at NC State, Inc. is an independent student-run 501(c)(3) public charity.
                Operating with zero financial support from university athletic fees or state appropriations,
                the club is governed by elected student player officers, coaching staff, and an experienced alumni advisory board.
              </p>
            </div>

            {/* 1. ELECTED STUDENT TEAM OFFICERS */}
            <div className="mb-12">
              <div className="mb-6">
                <span className="text-xs font-bold tracking-wider uppercase text-[#e10600]">
                  STUDENT-LED LEADERSHIP
                </span>
                <h2 className="font-heading text-3xl text-[#222222] mt-0.5">
                  CURRENT TEAM OFFICERS (2026–27)
                </h2>
                <p className="font-questrial text-xs text-[#666666] mt-1">
                  Elected by team members to manage day-to-day club operations, university student organization compliance, and club finances.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    role: "President",
                    name: "Jake Gifford",
                    jersey: "#28",
                    class: "Senior",
                    major: "Finance",
                    note: "Presides over team meetings, oversees university student government relations, and coordinates club operations.",
                  },
                  {
                    role: "Vice President",
                    name: "Erik Dahlin",
                    jersey: "#36",
                    class: "Junior",
                    major: "Sport Management",
                    note: "Coordinates team scheduling, travel logistics, and secondary club administrative duties.",
                  },
                  {
                    role: "Treasurer",
                    name: "Jack Ray",
                    jersey: "#26",
                    class: "Sophomore",
                    major: "Communications",
                    note: "Manages player dues, vendor disbursements, banking, and club budget oversight.",
                  },
                  {
                    role: "Secretary",
                    name: "Jake Lipani",
                    jersey: "#24",
                    class: "Junior",
                    major: "Finance",
                    note: "Maintains official club records, roster compliance filings, and administrative correspondence.",
                  },
                ].map((officer, i) => (
                  <div
                    key={i}
                    className="border-2 border-[#e10600] rounded-lg p-6 bg-white shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#e10600] tracking-wider uppercase block">
                        {officer.role}
                      </span>
                      <h3 className="font-heading text-2xl text-[#222222] mt-1">
                        {officer.name}
                      </h3>
                      <div className="text-xs font-semibold text-[#555555] mt-1">
                        {officer.jersey} · {officer.class} · {officer.major}
                      </div>
                      <p className="font-questrial text-xs text-[#666666] leading-relaxed mt-3">
                        {officer.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. NONPROFIT CHARTER & ADVISORY LEADERSHIP */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
              <div className="lg:col-span-7 bg-[#f8f9fa] border border-[#e5e5e5] rounded-xl p-6 sm:p-8 flex flex-col justify-between shadow-sm">
                <div>
                  <span className="text-xs font-bold text-[#e10600] uppercase tracking-wider block">
                    FIDUCIARY CHARTER & COMPLIANCE
                  </span>
                  <h3 className="font-heading text-3xl text-[#222222] mt-1">
                    501(c)(3) LEGAL STATUS & DISCLOSURES
                  </h3>
                  <p className="font-questrial text-sm text-[#555555] leading-relaxed mt-2">
                    The Ice Hockey Club at NC State, Inc. is recognized by the Internal Revenue Service as a 501(c)(3)
                    tax-exempt public charity. All contributions, corporate sponsorships, and donations are 100% tax-deductible to the fullest extent permitted by law.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="p-4 bg-white border border-[#e5e5e5] rounded-lg text-xs space-y-1.5">
                      <div><strong className="text-[#222222]">Legal Entity:</strong> The Ice Hockey Club at NC State, Inc.</div>
                      <div><strong className="text-[#222222]">Federal EIN:</strong> 46-4129861</div>
                      <div><strong className="text-[#222222]">Tax Status:</strong> 501(c)(3) Public Charity</div>
                      <div><strong className="text-[#222222]">Effective Date:</strong> September 19, 2013</div>
                      <div><strong className="text-[#222222]">Head Coach:</strong> Nagib Ward</div>
                      <div><strong className="text-[#222222]">General Manager:</strong> Rick Daniel</div>
                    </div>
                    <div className="p-4 bg-white border border-[#e5e5e5] rounded-lg text-xs space-y-1.5">
                      <div><strong className="text-[#222222]">Business Dev & Alumni:</strong> Brent Plunkett</div>
                      <div><strong className="text-[#222222]">Home Competition Rink:</strong> Lane Arena @ Wake Competition Center</div>
                      <div><strong className="text-[#222222]">Mailing Address:</strong> 2611 Cates Ave, Room 1000, Raleigh, NC 27695-8111</div>
                    </div>
                  </div>
                </div>

                {/* FORM 990 & FINANCIALS SPOTLIGHT LINK */}
                <div className="mt-6 pt-5 border-t border-[#e5e5e5] flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-lg border border-[#e5e5e5]">
                  <div>
                    <span className="font-heading text-lg text-[#222222] block">
                      IRS FORM 990 & PUBLIC FINANCIALS
                    </span>
                    <p className="font-questrial text-xs text-[#666666]">
                      Review certified annual returns, public charity disclosures, and financial statements.
                    </p>
                  </div>
                  <a
                    href="https://www.causeiq.com/organizations/ice-hockey-club-at-nc-state,464129861/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#e10600] hover:bg-[#c40500] text-white text-xs font-heading tracking-wider uppercase rounded shadow transition flex items-center gap-1.5"
                  >
                    <span>View Financials & Form 990 Filings</span>
                    <span>↗</span>
                  </a>
                </div>
              </div>

              {/* 3. CONTACT US FORM (From Hostinger) */}
              <div className="lg:col-span-5 bg-[#cc0000] text-white rounded-xl p-6 sm:p-8 flex flex-col justify-between shadow-sm">
                <div>
                  <span className="text-xs font-bold tracking-widest uppercase text-white/80 block">
                    DIRECT COMMUNICATION
                  </span>
                  <h3 className="font-heading text-3xl text-white mt-1">CONTACT US</h3>
                  <p className="font-questrial text-xs text-white/90 leading-relaxed mt-1">
                    Questions, alumni updates, or something to add to the history? Send a message to the team officers and advisory board.
                  </p>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const subject = encodeURIComponent("IcePack Website Inquiry from " + contactName);
                      const body = encodeURIComponent(`Name: ${contactName}\nEmail: ${contactEmail}\n\nMessage:\n${contactMsg}`);
                      window.location.href = `mailto:Admin@icepackhockey.com?subject=${subject}&body=${body}`;
                    }}
                    className="mt-4 space-y-3"
                  >
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider block mb-1 text-white">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Wolfpack Fan"
                        className="w-full px-3 py-2 bg-white text-[#222222] rounded text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider block mb-1 text-white">
                        Your Email
                      </label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="you@ncsu.edu"
                        className="w-full px-3 py-2 bg-white text-[#222222] rounded text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider block mb-1 text-white">
                        Message
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={contactMsg}
                        onChange={(e) => setContactMsg(e.target.value)}
                        placeholder="How can we help?"
                        className="w-full px-3 py-2 bg-white text-[#222222] rounded text-xs focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#222222] hover:bg-black text-white font-heading text-base uppercase tracking-wider rounded transition shadow"
                    >
                      SEND MESSAGE ↗
                    </button>
                  </form>
                </div>

                <div className="mt-4 pt-3 border-t border-white/20 text-[11px] font-questrial text-white/80">
                  Opens your email app with this message filled in. You can also email directly to{" "}
                  <a href="mailto:Admin@icepackhockey.com" className="font-bold underline text-white">
                    Admin@icepackhockey.com
                  </a>.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== STEPHEN RUSSELL MEMORIAL VIEW ===================== */}
        {activeTab === "stephen-russell" && (
          <div className="px-4 sm:px-8 py-10 max-w-[1280px] mx-auto w-full">
            {/* Header */}
            <div className="border-b-2 border-[#e10600] pb-4 mb-8">
              <span className="text-xs font-bold tracking-widest uppercase text-[#e10600]">
                IN MEMORIAM · JERSEY RETIRED NOVEMBER 2009
              </span>
              <h1 className="font-heading text-3xl sm:text-5xl text-[#222222] leading-none mt-1">
                STEPHEN RUSSELL MEMORIAL
              </h1>
              <p className="font-questrial text-sm text-[#555555] mt-2 max-w-3xl leading-relaxed">
                Celebrating the life, courage, and enduring impact of beloved NC State goaltender Stephen Russell (1987–2009),
                and the annual collegiate tournament founded in his honor.
              </p>
            </div>

            {/* Tribute / Partnership Notice */}
            <div className="bg-red-50/70 border border-red-200 rounded-lg p-5 mb-10 text-xs font-questrial text-[#333333] leading-relaxed">
              <span className="font-bold text-[#e10600] uppercase tracking-wide block mb-1">
                AN ANNUAL TRADITION OF EXCELLENCE AND REMEMBRANCE
              </span>
              The <strong>Stephen Russell Memorial Tournament</strong> is an annual event held in partnership with Stephen&apos;s family,
              Icepack Hockey, and the Atlantic Coast Collegiate Hockey League (ACCHL). In recent years, the tournament has shifted
              from being a season kick-off into a premier showcase of talent and celebration of hockey for teams across the league and the East Coast.
            </div>

            {/* Stephen Russell Bio & Legacy Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
              {/* Left Column: Life, Legacy & Jersey Retirement */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white border border-[#e5e5e5] rounded-lg p-6 sm:p-8 shadow-sm">
                  <span className="text-[11px] font-bold text-[#e10600] uppercase tracking-widest block mb-1">
                    HIS LIFE & WOLFPACK CAREER
                  </span>
                  <h2 className="font-heading text-3xl text-[#222222] mb-4">
                    STEPHEN RUSSELL (1987–2009)
                  </h2>

                  <div className="space-y-4 font-questrial text-sm text-[#444444] leading-relaxed">
                    <p>
                      <strong>Stephen Russell</strong> was born in Newfoundland, Canada. He stepped on the ice and in the net
                      for the first time at the age of twelve. Stephen was a proud member of the NC State Hockey Club from 2006 to 2009.
                      He was passionate and intense about hockey, and as one teammate put it,{" "}
                      <em>&ldquo;he would make the same effort to save the 200th shot in practice as he would in an OT shot in a crucial game.&rdquo;</em>
                    </p>
                    <p>
                      On July 4, 2009, the Wolfpack tragically lost Stephen. At the time of his passing, Stephen was a rising senior
                      at NC State University where he was studying Political Science. As a goaltender for NC State&rsquo;s Hockey team,
                      Stephen loved the spirit of competition, the camaraderie of the team, and the game of hockey.
                    </p>
                    <p>
                      Stephen&apos;s jersey was retired in November 2009: one of the highest honors that can be bestowed upon an athlete.
                      His teammates and coaches felt he represented the best of the sport, both on and off the ice. We honor Stephen,
                      and through our remembrance, celebrate his impact and the game of hockey he loved so much. His legacy will live on
                      in this arena, in our team, and in this tournament.
                    </p>
                  </div>

                  {/* Documentary Callout Card */}
                  <div className="mt-6 p-5 bg-stone-50 border border-stone-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-[#222222] uppercase tracking-wide block">
                        Watch &ldquo;Stephen&apos;s Ripple&rdquo;
                      </span>
                      <p className="text-xs font-questrial text-[#666666]">
                        Experience Stephen&apos;s life and legacy through the eyes of his family, coaches, and teammates.
                      </p>
                    </div>
                    <a
                      href="https://youtu.be/En1WERVBKEs?si=TAdRgApTTCx02y_2"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[#e10600] hover:bg-[#b00400] text-white text-xs font-bold uppercase tracking-wider rounded transition whitespace-nowrap shadow-sm"
                    >
                      Watch on YouTube ↗
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Column: Photo & Video Embed */}
              <div className="lg:col-span-5 space-y-6">
                {/* Photo Card */}
                <div className="bg-white border border-[#e5e5e5] rounded-lg p-5 shadow-sm flex flex-col items-center">
                  <div className="p-3 bg-stone-100 rounded-lg border border-gray-200 w-full flex justify-center">
                    <img
                      src="/stephen-russell.png"
                      alt="Stephen Russell NC State Goaltender"
                      className="h-72 w-auto object-contain rounded shadow-sm"
                    />
                  </div>
                  <div className="mt-3 text-center">
                    <span className="font-heading text-xl text-[#222222] block">
                      STEPHEN RUSSELL
                    </span>
                    <span className="text-xs text-[#e10600] font-bold uppercase tracking-wider block">
                      Goaltender · NC State Hockey Club
                    </span>
                    <span className="text-[11px] font-questrial text-[#777777] mt-0.5 block">
                      Member 2006–2009 · Jersey Retired Nov 2009
                    </span>
                  </div>
                </div>

                {/* Video Embed Card */}
                <div className="bg-[#222222] text-white border border-[#444444] rounded-lg p-4 shadow-sm">
                  <span className="text-[11px] font-bold text-[#e10600] uppercase tracking-widest block mb-2">
                    FEATURED TRIBUTE VIDEO
                  </span>
                  <div className="w-full aspect-video rounded overflow-hidden bg-black">
                    <iframe
                      width="100%"
                      height="100%"
                      src="https://www.youtube.com/embed/k5sLfCfCX0o?si=jeU-ZO1QuRXf5lg3"
                      title="Stephen's Ripple Tribute"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                  <div className="mt-2 text-[11px] font-questrial text-white/70 flex items-center justify-between">
                    <span>Stephen&apos;s Ripple (Official Video)</span>
                    <a
                      href="https://youtu.be/En1WERVBKEs?si=TAdRgApTTCx02y_2"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#e10600] hover:underline"
                    >
                      Open in YouTube ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Tournament Overview & Champions Table */}
            <div className="border border-[#e5e5e5] rounded-lg p-6 sm:p-8 bg-white shadow-sm mb-12">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#e5e5e5] pb-4 mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#e10600] block">
                    TOURNAMENT ARCHIVE & CHAMPIONS
                  </span>
                  <h2 className="font-heading text-3xl sm:text-4xl text-[#222222] mt-0.5">
                    THE STEPHEN RUSSELL MEMORIAL TOURNAMENT
                  </h2>
                </div>
                <div className="bg-red-50 text-[#e10600] border border-red-200 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">
                  🏆 8x NC State Tournament Titles
                </div>
              </div>

              <p className="font-questrial text-sm text-[#555555] leading-relaxed mb-8 max-w-4xl">
                The <strong>Stephen Russell Memorial Tournament</strong> (formerly called the Fall Showcase before being renamed in 2009)
                utilizes a Modified Buffalo scoring system as teams go head-to-head throughout the weekend. Between 2010 and 2017,
                the tournament was held in Raleigh, and featured a skills competition. In 2019, the tournament was held in Charlotte, NC.
                Due to the pandemic, a tournament was not held in 2020. From 2021 to 2023, the tournament took on new life as a single game
                honoring Stephen&apos;s memory. In 2024, the full tournament format returned to Raleigh and was held at Wake Competition Center
                in Morrisville, NC and the Orange County Sports Complex in Hillsborough, NC.
              </p>

              {/* Tournament History Table */}
              <div className="overflow-x-auto border border-[#e5e5e5] rounded-lg">
                <table className="w-full text-left border-collapse text-xs font-questrial">
                  <thead>
                    <tr className="bg-[#222222] text-white uppercase text-[11px] font-bold tracking-wider">
                      <th className="py-3 px-4 border-r border-[#333333] w-28">Year</th>
                      <th className="py-3 px-4 border-r border-[#333333]">Tournament Winner</th>
                      <th className="py-3 px-4">Tournament MVP / Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e5e5]">
                    {stephenRussellData.tournamentHistory.map((item: any, idx: number) => (
                      <tr
                        key={idx}
                        className={`transition hover:bg-red-50/50 ${
                          item.isNCState ? "bg-red-50/30 font-semibold" : idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-[#222222] border-r border-[#e5e5e5]">
                          {item.year}
                        </td>
                        <td className="py-3 px-4 border-r border-[#e5e5e5]">
                          <div className="flex items-center gap-2">
                            <span className={item.isNCState ? "text-[#e10600] font-bold text-sm" : "text-[#333333]"}>
                              {item.winner}
                            </span>
                            {item.isNCState && (
                              <span className="text-[10px] bg-[#e10600] text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                Champion
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#555555]">
                          {item.mvp ? (
                            <span>
                              Tournament MVP: <strong>{item.mvp}</strong>
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Quick Navigation */}
            <div className="p-6 bg-stone-50 border border-[#e5e5e5] rounded-lg flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#222222] block">
                  EXPLORE MORE ABOUT THE PACK
                </span>
                <span className="text-xs font-questrial text-[#666666]">
                  Discover fifty years of team chronology or inspect our student-led 501(c)(3) governance.
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setActiveTab("history");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-4 py-2 bg-[#222222] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded transition"
                >
                  Program History →
                </button>
                <button
                  onClick={() => {
                    setActiveTab("governance");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-4 py-2 bg-white border border-[#222222] text-[#222222] hover:bg-gray-100 text-xs font-bold uppercase tracking-wider rounded transition"
                >
                  Governance →
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 5. FOOTER */}
      <footer className="bg-[#222222] text-white px-4 sm:px-8 pt-12 pb-8 border-t-4 border-[#e10600]">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-[#444444] text-sm">
          {/* Col 1: Identity */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <img src="/07cdeb598c1716ddf52f5438f9484da2.png" alt="IcePack Logo" className="w-12 h-12 object-contain" />
              <div className="flex flex-col">
                <span className="font-heading text-2xl leading-none">ICEPACK HOCKEY</span>
                <span className="text-[10px] font-bold text-white/70 tracking-widest">EST. 1976 · ACHA D1</span>
              </div>
            </div>
            <p className="font-questrial text-xs text-white/70 leading-relaxed">
              The Ice Hockey Club at NC State is a student-run 501(c)(3) nonprofit operating independently
              of NC State Athletics.
            </p>
            <span className="text-xs text-white/60 font-mono">EIN: 46-4129861</span>
          </div>

          {/* Col 2: Quick Links */}
          <div className="flex flex-col gap-2 font-opensans text-xs uppercase tracking-wider font-semibold">
            <span className="font-heading text-base text-white border-b border-[#e10600] pb-1 mb-2">QUICK LINKS</span>
            <button onClick={() => setActiveTab("schedule")} className="text-left text-white/80 hover:text-[#e10600] transition">
              Schedule & Tickets
            </button>
            <button onClick={() => setActiveTab("standings")} className="text-left text-white/80 hover:text-[#e10600] transition">
              Standings
            </button>
            <button onClick={() => setActiveTab("team")} className="text-left text-white/80 hover:text-[#e10600] transition">
              Roster & Staff
            </button>
            <button
              onClick={() => {
                setActiveTab("news");
                setSelectedArticle(null);
              }}
              className="text-left text-white/80 hover:text-[#e10600] transition"
            >
              Newsroom
            </button>
            <button onClick={() => setActiveTab("videos")} className="text-left text-white/80 hover:text-[#e10600] transition">
              Media & Highlights
            </button>
            <button onClick={() => setActiveTab("history")} className="text-left text-white/80 hover:text-[#e10600] transition">
              History & Governance
            </button>
            <button onClick={() => setActiveTab("support")} className="text-left text-white/80 hover:text-[#e10600] transition">
              Annual Fund
            </button>
            <button
              onClick={() => {
                setActiveTab("raffle");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-left text-amber-400 font-bold hover:text-amber-300 transition flex items-center justify-between"
            >
              <span>🏈 Football Ticket Raffle</span>
              <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded font-mono">~10 Days</span>
            </button>
            <a
              href="https://ncstatewhockey.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-left text-white/80 hover:text-[#e10600] transition flex items-center gap-1 normal-case tracking-normal text-xs pt-1 border-t border-[#444444] mt-1"
            >
              <span>NC State Women&apos;s Hockey Team</span>
              <span>↗</span>
            </a>
          </div>

          {/* Col 3: Gameday Info */}
          <div className="flex flex-col gap-2 text-xs font-questrial text-white/80">
            <span className="font-heading text-base text-white border-b border-[#e10600] pb-1 mb-2 uppercase">
              HOME VENUE
            </span>
            <span className="font-bold text-white">Lane Arena</span>
            <span>Wake Competition Center</span>
            <span>111 Competition Center Dr</span>
            <span>Morrisville, NC 27560</span>
            <a
              href="https://icepackhockey.ticketsauce.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#e10600] font-bold hover:underline mt-2 inline-block"
            >
              Get Game Tickets on Ticketsauce →
            </a>
          </div>

          {/* Col 4: Newsletter */}
          <div className="flex flex-col gap-2">
            <span className="font-heading text-base text-white border-b border-[#e10600] pb-1 mb-2 uppercase">
              STAY CONNECTED
            </span>
            <p className="font-questrial text-xs text-white/70">
              Get game recaps, outdoor game ticket drops, and alumni announcements.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert("Thank you for signing up!"); }} className="mt-2 flex">
              <input
                type="email"
                placeholder="you@ncsu.edu"
                required
                className="px-3 py-2 text-xs bg-[#333333] border border-[#555555] rounded-l text-white focus:outline-none flex-1"
              />
              <button
                type="submit"
                className="bg-[#e10600] hover:bg-[#c40500] text-white px-4 py-2 text-xs font-heading tracking-wider rounded-r transition"
              >
                JOIN
              </button>
            </form>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto pt-6 flex flex-wrap justify-between items-center text-xs text-white/60 font-questrial">
          <span>© 2026 Ice Hockey Club at NC State, Inc. All rights reserved.</span>
          <span>Home of the 2023 Frozen Finley Record (24,000+ Fans)</span>
        </div>
      </footer>
    </div>
  );
}

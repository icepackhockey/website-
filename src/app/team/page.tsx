import IcePackApp from "@/components/IcePackApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team Roster & Staff — Icepack Hockey",
  description: "Official player roster, coaching staff, and hockey operations team for NC State Icepack.",
};

export default function TeamPage() {
  return <IcePackApp initialTab="team" initialSubTab="players" />;
}

import IcePackApp from "@/components/IcePackApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Player Roster — Icepack Hockey",
  description: "Official NC State Icepack player roster and player stats.",
};

export default function RosterPage() {
  return <IcePackApp initialTab="team" initialSubTab="players" />;
}

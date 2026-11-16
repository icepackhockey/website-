import IcePackApp from "@/components/IcePackApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Player Roster — IcePack Hockey",
  description: "Official NC State IcePack player roster and player stats.",
};

export default function RosterPage() {
  return <IcePackApp initialTab="team" initialSubTab="players" />;
}

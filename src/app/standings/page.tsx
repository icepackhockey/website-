import IcePackApp from "@/components/IcePackApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Standings & Rankings — IcePack Hockey",
  description: "SECHL Conference standings, ACHA national rankings, and Road to Nationals tracking for NC State IcePack.",
};

export default function StandingsPage() {
  return <IcePackApp initialTab="standings" />;
}

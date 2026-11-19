import IcePackApp from "@/components/IcePackApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Standings & Rankings — Icepack Hockey",
  description: "SECHL Conference standings, ACHA national rankings, and Road to Nationals tracking for NC State Icepack.",
};

export default function StandingsPage() {
  return <IcePackApp initialTab="standings" />;
}

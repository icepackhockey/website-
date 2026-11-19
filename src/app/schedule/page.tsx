import IcePackApp from "@/components/IcePackApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Schedule & Results — Icepack Hockey",
  description: "Official 2026-27 game schedule, scores, and ticketing info for NC State Icepack Hockey.",
};

export default function SchedulePage() {
  return <IcePackApp initialTab="schedule" />;
}

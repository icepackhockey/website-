import IcePackApp from "@/components/IcePackApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Schedule & Results — IcePack Hockey",
  description: "Official 2026-27 game schedule, scores, and ticketing info for NC State IcePack Hockey.",
};

export default function SchedulePage() {
  return <IcePackApp initialTab="schedule" />;
}

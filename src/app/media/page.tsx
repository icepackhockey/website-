import IcePackApp from "@/components/IcePackApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Media & Highlights — Icepack Hockey",
  description: "Official game highlights, broadcast archives, and photo galleries for NC State Icepack.",
};

export default function MediaPage() {
  return <IcePackApp initialTab="media" />;
}

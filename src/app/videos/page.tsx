import IcePackApp from "@/components/IcePackApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Videos & Broadcasts — Icepack Hockey",
  description: "Official game broadcasts, YouTube highlights, and interviews for NC State Icepack.",
};

export default function VideosPage() {
  return <IcePackApp initialTab="videos" />;
}

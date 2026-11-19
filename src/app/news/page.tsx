import IcePackApp from "@/components/IcePackApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Newsroom & Game Recaps — Icepack Hockey",
  description: "Official game recaps, previews, and feature stories from Icepack student journalists.",
};

export default function NewsPage() {
  return <IcePackApp initialTab="news" />;
}

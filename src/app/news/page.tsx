import IcePackApp from "@/components/IcePackApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Newsroom & Game Recaps — IcePack Hockey",
  description: "Official game recaps, previews, and feature stories from IcePack student journalists.",
};

export default function NewsPage() {
  return <IcePackApp initialTab="news" />;
}

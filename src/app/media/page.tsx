import IcePackApp from "@/components/IcePackApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Media & Highlights — IcePack Hockey",
  description: "Official game highlights, broadcast archives, and photo galleries for NC State IcePack.",
};

export default function MediaPage() {
  return <IcePackApp initialTab="media" />;
}

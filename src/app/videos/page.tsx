import IcePackApp from "@/components/IcePackApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Videos & Broadcasts — IcePack Hockey",
  description: "Official game broadcasts, YouTube highlights, and interviews for NC State IcePack.",
};

export default function VideosPage() {
  return <IcePackApp initialTab="videos" />;
}

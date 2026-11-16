import IcePackApp from "@/components/IcePackApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Photo Galleries — IcePack Hockey",
  description: "High-resolution game photography and team galleries for NC State IcePack.",
};

export default function PhotosPage() {
  return <IcePackApp initialTab="photos" />;
}

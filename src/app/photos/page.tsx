import IcePackApp from "@/components/IcePackApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Photo Galleries — Icepack Hockey",
  description: "High-resolution game photography and team galleries for NC State Icepack.",
};

export default function PhotosPage() {
  return <IcePackApp initialTab="photos" />;
}

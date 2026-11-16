import IcePackApp from "@/components/IcePackApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stephen Russell Memorial Tournament — IcePack Hockey",
  description: "Honoring the memory of Stephen Russell through collegiate hockey.",
};

export default function StephenRussellPage() {
  return <IcePackApp initialTab="stephen-russell" />;
}

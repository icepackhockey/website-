import IcePackApp from "@/components/IcePackApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "History & Tradition — IcePack Hockey",
  description: "50 years of NC State hockey history, 1976 origins, and Frozen Finley outdoor game record.",
};

export default function AboutPage() {
  return <IcePackApp initialTab="history" />;
}

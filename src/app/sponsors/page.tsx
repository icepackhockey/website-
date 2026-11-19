import IcePackApp from "@/components/IcePackApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Corporate Sponsors & Partners — Icepack Hockey",
  description: "Official partners and corporate sponsors of the NC State Icepack.",
};

export default function SponsorsPage() {
  return <IcePackApp initialTab="sponsors" />;
}

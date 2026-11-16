import IcePackApp from "@/components/IcePackApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Corporate Sponsors & Partners — IcePack Hockey",
  description: "Official partners and corporate sponsors of the NC State IcePack.",
};

export default function SponsorsPage() {
  return <IcePackApp initialTab="sponsors" />;
}

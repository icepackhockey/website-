import IcePackApp from "@/components/IcePackApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Facilities & Lane Arena — IcePack Hockey",
  description: "Wake Competition Center, Lane Arena, and training facilities for NC State IcePack.",
};

export default function FacilitiesPage() {
  return <IcePackApp initialTab="team" initialSubTab="facilities" />;
}

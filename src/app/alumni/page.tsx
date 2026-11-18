import IcePackApp from "@/components/IcePackApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Alumni Reconnect & Network — IcePack Hockey",
  description: "Official NC State IcePack Hockey Alumni directory, registry, and reconnect questionnaire.",
};

export default function AlumniPage() {
  return <IcePackApp initialTab="team" initialSubTab="alumni" />;
}

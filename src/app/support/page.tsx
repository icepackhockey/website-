import IcePackApp from "@/components/IcePackApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support the Pack — IcePack Hockey",
  description: "Tax-deductible contributions to support NC State IcePack player travel, ice time, and equipment.",
};

export default function SupportPage() {
  return <IcePackApp initialTab="support" />;
}

import IcePackApp from "@/components/IcePackApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "50th Anniversary Annual Fund — IcePack Hockey",
  description: "Tax-deductible contributions to support NC State IcePack player travel, ice time, and equipment.",
};

export default function AnnualFundPage() {
  return <IcePackApp initialTab="support" />;
}

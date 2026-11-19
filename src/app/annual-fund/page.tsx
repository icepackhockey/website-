import IcePackApp from "@/components/IcePackApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "50th Anniversary Annual Fund — Icepack Hockey",
  description: "Tax-deductible contributions to support NC State Icepack player travel, ice time, and equipment.",
};

export default function AnnualFundPage() {
  return <IcePackApp initialTab="support" />;
}

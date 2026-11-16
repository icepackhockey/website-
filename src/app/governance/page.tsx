import IcePackApp from "@/components/IcePackApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Governance & 501(c)(3) Board — IcePack Hockey",
  description: "Board of Directors, nonprofit disclosures, and governance documentation for Ice Hockey Club at NC State, Inc.",
};

export default function GovernancePage() {
  return <IcePackApp initialTab="governance" />;
}

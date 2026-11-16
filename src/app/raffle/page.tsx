import IcePackApp from "@/components/IcePackApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UNC vs. NC State Football Ticket Raffle — IcePack Hockey",
  description: "Win 2 Lower Bowl tickets (Sec 315) to NC State vs. UNC Football plus Rams Head Deck parking pass.",
};

export default function RafflePage() {
  return <IcePackApp initialTab="raffle" />;
}

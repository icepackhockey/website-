import IcePackApp from "@/components/IcePackApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UNC vs. NC State Football Ticket Raffle — IcePack Hockey",
  description: "Win 2 tickets (Level 1, Sec 202, Row O, Seats 13 & 14) to NC State vs. UNC Football plus parking pass @ Jackson Deck (239 Jackson Circle).",
};

export default function RafflePage() {
  return <IcePackApp initialTab="raffle" />;
}

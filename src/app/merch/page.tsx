import IcePackApp from "@/components/IcePackApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team Store & Merch — Icepack Hockey",
  description: "Official 50th Anniversary jerseys, season tickets, and Wolfpack hockey gear.",
};

export default function MerchPage() {
  return <IcePackApp initialTab="merch" />;
}

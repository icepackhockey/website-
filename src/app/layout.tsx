import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IcePack Hockey — NC State · ACHA Division I",
  description: "Official website for the Ice Hockey Club at NC State (501(c)(3) Nonprofit). ACHA Division I & ACCHL Conference.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Open+Sans:wght@400;600;700&family=Questrial&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#ffffff] text-[#222222] selection:bg-[#e10600] selection:text-white">
        {children}
      </body>
    </html>
  );
}

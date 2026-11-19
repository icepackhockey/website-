import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Icepack Hockey — NC State · ACHA Division I",
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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-2TY7R5BQ48"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-2TY7R5BQ48');
          `}
        </Script>
      </head>
      <body className="antialiased bg-[#ffffff] text-[#222222] selection:bg-[#e10600] selection:text-white">
        {children}
      </body>
    </html>
  );
}

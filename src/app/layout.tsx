import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Malitha Nishan Medical Relief Fund | Kalutara Vidyalaya 2011 A/L Batch",
  description:
    "Official medical relief fund portal for Malitha Nishan, organized by the Kalutara Vidyalaya 2011 A/L batch committee. Transparent donor ledger, verified bank account details, and progress tracking.",
  keywords: [
    "Malitha Nishan",
    "Kalutara Vidyalaya",
    "2011 A/L",
    "Medical Relief Fund",
    "People's Bank Kalutara",
    "Sri Lanka Medical Fund",
  ],
  authors: [{ name: "Kalutara Vidyalaya 2011 A/L Batch Committee" }],
  openGraph: {
    title: "Malitha Nishan Medical Relief Fund | Kalutara Vidyalaya 2011 A/L",
    description:
      "Official transparent medical relief fund organized by Kalutara Vidyalaya 2011 A/L batch for our brother Malitha Nishan. View verified bank details and contribution ledger.",
    type: "website",
    locale: "en_LK",
  },
};

export const viewport: Viewport = {
  themeColor: "#881337", // Kalutara Vidyalaya Deep Maroon
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}

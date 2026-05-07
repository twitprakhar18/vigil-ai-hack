import type { Metadata } from "next";
import { DM_Sans, Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import ClientShell from "@/components/ClientShell";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "700"],
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-logo",
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Vigil.ai — Housing.com Command Center",
  description: "AI-powered brand reputation management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${poppins.variable} ${playfair.variable} flex h-full max-h-full overflow-hidden bg-[#f5f8fa] font-sans antialiased`}
        style={{ backgroundColor: "#f5f8fa", minHeight: "100vh" }}
        suppressHydrationWarning
      >
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const underfind = localFont({
  src: [
    {
      path: "../fonts/undefined-medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/undefined-medium.woff",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SoundClash — The Ultimate Music Battle",
  description:
    "A fighting-game-themed music guessing game. Two teams face off, guessing songs from progressive audio snippets. Last team standing wins.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${underfind.variable} antialiased`}
      >
        <div className="relative z-10 min-h-screen min-h-dvh flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}

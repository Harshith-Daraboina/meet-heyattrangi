import type { Metadata } from "next";
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
  title: "Hey Attrangi Meet | AI-Powered Premium Meetings",
  description: "Experience secure, high-quality video meetings with Pragya, your intelligent AI meeting assistant.",
  icons: {
    icon: "/images/icon.png",
    apple: "/images/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
          /* Force LiveKit Buttons & Inputs on Mobile/Safari to ignore Tailwind v4 stripping */
          .lk-button {
            appearance: none !important;
            -webkit-appearance: none !important;
            background-color: #1f1f1f !important;
            color: white !important;
            padding: 0.5rem 1rem !important;
            border-radius: 0.5rem !important;
            border: 1px solid #333 !important;
            font-weight: 500 !important;
            cursor: pointer !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .lk-button:hover { background-color: #2f2f2f !important; }
          
          .lk-form-control, .lk-device-menu {
            appearance: none !important;
            -webkit-appearance: none !important;
            background-color: #1f1f1f !important;
            color: white !important;
            padding: 0.5rem 1rem !important;
            border-radius: 0.5rem !important;
            border: 1px solid #333 !important;
            display: block !important;
            width: 100% !important;
          }

          .lk-join-button {
            background-color: #FF6A2D !important;
            border-color: #FF6A2D !important;
            color: white !important;
            font-weight: 600 !important;
            width: 100% !important;
            margin-top: 1rem !important;
          }
          .lk-join-button:hover { background-color: #e55a1f !important; }
        `}} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

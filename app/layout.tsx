import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WanderWise — AI Travel Planner",
  description: "Create a personalized travel itinerary with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

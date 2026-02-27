import type { Metadata } from "next";
import "./globals.css";
import AppLayout from "@/components/AppLayout";

export const metadata: Metadata = {
  title: "VC Intelligence",
  description: "VC Intelligence Platform for Company Analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" style={{ margin: 0, padding: 0 }}>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}

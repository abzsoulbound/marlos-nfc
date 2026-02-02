import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marlo’s Brasserie",
  description: "NFC Ordering System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#000",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}

import "./globals.css";
import type { ReactNode } from "react";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header>
          <img
            src="/marlos-logo.png"
            alt="Marlo’s Brasserie"
            style={{ height: 56 }}
          />
        </header>
        {children}
      </body>
    </html>
  );
}

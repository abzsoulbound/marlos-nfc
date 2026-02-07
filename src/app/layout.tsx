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
        <header>Marlo’s Brasserie</header>
        {children}
      </body>
    </html>
  );
}

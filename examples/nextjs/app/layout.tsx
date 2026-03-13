import { Instrument } from "./instrument";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Element Source - Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, boxSizing: "border-box" }}>
        <Instrument />
        {children}
      </body>
    </html>
  );
}

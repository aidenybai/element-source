import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "element-source",
  description: "Get the source file location of any DOM element. Works with React, Vue, Svelte, and Solid.",
  openGraph: {
    title: "element-source",
    description: "Get the source file location of any DOM element. Works with React, Vue, Svelte, and Solid.",
  },
  twitter: {
    card: "summary_large_image",
    title: "element-source",
    description: "Get the source file location of any DOM element. Works with React, Vue, Svelte, and Solid.",
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
          <TooltipProvider delay={0} closeDelay={0}>{children}</TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;

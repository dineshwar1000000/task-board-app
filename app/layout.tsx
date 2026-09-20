import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TaskFlow — Visual Task Board",
  description:
    "A clean, drag-and-drop task board to organize your work into To Do, In Progress, and Done.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground relative">
        <div className="bg-pattern" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}

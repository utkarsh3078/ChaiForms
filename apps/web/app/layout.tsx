import type { Metadata } from "next";
import localFont from "next/font/local";
// @ts-expect-error -- Next.js handles global CSS side-effect imports
import "./globals.css";
import { GlobalProviders } from "../providers/global";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "ChaiForms",
  description:
    "Create and share forms with ease using ChaiForms. Our intuitive form builder allows you to design custom forms for surveys, feedback, registrations, and more. With seamless sharing options and real-time responses, ChaiForms is your go-to solution for all your form needs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <GlobalProviders>{children}</GlobalProviders>
      </body>
    </html>
  );
}

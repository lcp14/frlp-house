import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./_helpers/providers";
import SideMenu from "./components/side-menu";
import "./globals.css";
import { createClient } from "./utils/supabase/server";
import { cookies } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Household Budget",
  description: "A simple household budgeting app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <html lang="en">
        <body className={inter.className}>
          <div className="flex min-h-screen">
            <SideMenu />
            <div className="flex-grow p-8">{children}</div>
          </div>
        </body>
      </html>
    </Providers>
  );
}

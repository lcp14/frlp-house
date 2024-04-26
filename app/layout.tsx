import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./_helpers/providers";
import SideMenu from "./components/side-menu";
import "./globals.css";
import Breadcrumb from "./components/breadcrumb";

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
            <div id="main-layout" className="flex-grow p-8 m-0">
              <Breadcrumb />
              <div className="py-4">{children}</div>
            </div>
          </div>
        </body>
      </html>
    </Providers>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SideMenu from "./components/side-menu";
import "./globals.css";
import Breadcrumb from "./components/breadcrumb";
import { User2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "./utils/supabase/server";
import { cookies } from "next/headers";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";

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
  const supabase = createClient(cookies());
  const { data } = await supabase.auth.getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="flex max-h-screen">
          <SideMenu />
          <div id="main-layout" className="flex-grow p-4 m-0">
            <div className="flex items-center py-2">
              <Breadcrumb className="hidden md:flex flex-grow" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Link href={"/profile"}>
                      <Avatar>
                        <AvatarImage
                          src={data.user?.user_metadata.avatar_url}
                        ></AvatarImage>
                        <AvatarFallback>
                          <User2 className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>{data.user?.email}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="py-4 overflow-y-auto max-h-screen">{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}

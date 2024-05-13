import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import {
  DollarSignIcon,
  Github,
  GithubIcon,
  Home,
  LineChart,
  PiggyBank,
  Settings,
  User2,
  Users2,
} from "lucide-react";
import Link from "next/link";
import React from "react";

function SideMenuItem({
  title,
  href,
  icon,
}: {
  title: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
        >
          <Button size="icon" variant="ghost">
            {icon}
            <span className="sr-only">{title}</span>
          </Button>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">{title}</TooltipContent>
    </Tooltip>
  );
}

export default function SideMenu() {
  const menuList = [
    {
      title: "Dashboard",
      href: "/",
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: "Transactions",
      href: "/transactions",
      icon: <DollarSignIcon className="h-5 w-5" />,
    },
    {
      title: "Smart Split",
      href: "/smartsplit",
      icon: <Users2 className="h-5 w-5" />,
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: <LineChart className="h-5 w-5" />,
    },
  ];

  return (
    <aside className="inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <PiggyBank className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">Finances Inc</span>
          </Link>
          {menuList.map((item) => (
            <SideMenuItem key={item.title} {...item} />
          ))}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size={"icon"} variant={"ghost"}>
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="right">
              <DropdownMenuItem>
                {" "}
                <User2 className="w-4 h-4 mr-2" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <GitHubLogoIcon className="w-4 h-4 mr-2" /> Github
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </TooltipProvider>
    </aside>
  );
}

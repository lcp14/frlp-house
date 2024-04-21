"use client";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { DollarSignIcon, HomeIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export default function SideMenu() {
  const menu = [
    {
      title: "Home",
      icon: <HomeIcon size={16} />,
      href: "/",
    },
    {
      title: "Transactions",
      icon: <DollarSignIcon size={16} />,
      href: "/transactions",
    },
  ];

  return (
    <div className="w-72 min-w-72 border-r-2 p-2 shadow-sm">
      <div className="space-y-3 p-4">
        <Separator />

        <NavigationMenu orientation="vertical">
          <NavigationMenuList>
            <ul>
              {menu.map((item) => {
                return (
                  <NavigationMenuItem key={item.href}>
                    <Link href={item.href} legacyBehavior passHref>
                      <NavigationMenuLink
                        className={navigationMenuTriggerStyle()}
                      >
                        <div className="flex space-x-2 justify-start items-center">
                          {item.icon} <span> {item.title} </span>
                        </div>
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                );
              })}
            </ul>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
}

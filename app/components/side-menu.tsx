import Link from "next/link";
import { Button } from "@/components/ui/button";
import UserCard from "./user-card";
import { Separator } from "@/components/ui/separator";
import {
  CreditCardIcon,
  DollarSignIcon,
  HomeIcon,
  LayoutDashboardIcon,
} from "lucide-react";

export default async function SideMenu() {
  const menu = [
    {
      title: "Home",
      icon: <HomeIcon size={12} />,
      href: "/",
    },
    {
      title: "Dashboard",
      icon: <LayoutDashboardIcon size={12} />,
      href: "/dashboard",
    },
    {
      title: "Transactions",
      icon: <DollarSignIcon size={12} />,
      href: "/transactions",
    },
  ];

  return (
    <div className="w-72 min-w-72 border-r-2 p-2 shadow-sm">
      <div className="space-y-3 p-4">
        <UserCard />
        <Separator />
        <div className="flex flex-col">
          {menu.map((item, index) => (
            <Link href={item.href} key={index}>
              <Button
                className="w-full justify-start space-x-2"
                variant={"ghost"}
              >
                {item.icon} <span> {item.title} </span>
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

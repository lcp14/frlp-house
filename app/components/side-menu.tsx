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
import { createClient } from "../utils/supabase/server";
import { cookies } from "next/headers";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarIcon } from "@radix-ui/react-icons";

export default async function SideMenu() {
  const menu = [
    {
      title: "Home",
      icon: <HomeIcon size={16} />,
      href: "/",
    },
    {
      title: "Dashboard",
      icon: <LayoutDashboardIcon size={16} />,
      href: "/dashboard",
    },
    {
      title: "Transactions",
      icon: <DollarSignIcon size={16} />,
      href: "/transactions",
    },
  ];
  const supabase = createClient(cookies());
  const { data, error } = await supabase.auth.getUser();

  return (
    <div className="w-72 min-w-72 border-r-2 p-2 shadow-sm">
      <div className="space-y-3 p-4">
        {error || !data.user ? (
          <Avatar>
            {" "}
            <AvatarFallback>
              {" "}
              <AvatarIcon />{" "}
            </AvatarFallback>{" "}
          </Avatar>
        ) : (
          <UserCard avatar_url={data.user.user_metadata.avatar_url} />
        )}
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

"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "../utils/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserIcon } from "lucide-react";

import { MoonIcon, SunIcon } from "@radix-ui/react-icons";

export default function UserCard({ avatar_url }: { avatar_url: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={avatar_url} />
          <AvatarFallback delayMs={20}>
            <UserIcon />
          </AvatarFallback>
        </Avatar>{" "}
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom">
        <DropdownMenuItem> Logout </DropdownMenuItem>
        <DropdownMenuItem> Logout </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem> Logout </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

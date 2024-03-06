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
export default async function UserCard() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={data.user?.user_metadata.avatar_url} />
          <AvatarFallback delayMs={20}>
            {" "}
            <UserIcon />{" "}
          </AvatarFallback>
        </Avatar>{" "}
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom">
        <DropdownMenuItem> Logout </DropdownMenuItem>
        <DropdownMenuItem> Logout </DropdownMenuItem>
        <DropdownMenuItem> Logout </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem> Logout </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

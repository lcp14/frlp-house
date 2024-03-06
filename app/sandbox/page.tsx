"use client";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
} from "@/components/ui/command";
import { getTagsByLoggedUser } from "@/server/tags";
import { useQuery } from "@tanstack/react-query";
import { CommandLoading } from "cmdk";
import {
  PlusIcon,
  RefreshCwIcon,
  RefreshCwOff,
  RotateCcwIcon,
  RotateCwIcon,
} from "lucide-react";
import React from "react";

export default function SandboxPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["tags"],
    queryFn: () => getTagsByLoggedUser(),
  });

  const [search, setSearch] = React.useState("");

  return (
    <Command>
      <CommandInput
        placeholder="Search for tags"
        onValueChange={setSearch}
        value={search}
      />
      <CommandList>
        {isLoading && (
          <CommandLoading className="h-50 flex items-center justify-center p-4 align-middle">
            <RotateCwIcon size={12} className="animate-spin" />{" "}
          </CommandLoading>
        )}
        {data?.data?.map((tag) => (
          <CommandItem key={tag.id} title={tag.text}>
            {tag.text}
          </CommandItem>
        ))}
        {search && (
          <CommandItem
            onSelect={(item) => {
              console.log(item);
            }}
            value={search}
          >
            <Button variant={"ghost"}>
              Add tag
              <div className="m-2 rounded-xl bg-zinc-300 p-2">{search}</div>
            </Button>
          </CommandItem>
        )}
      </CommandList>
    </Command>
  );
}

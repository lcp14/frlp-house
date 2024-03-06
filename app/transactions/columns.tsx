"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tables } from "@/types/supabase";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import Tag from "../components/tag";

type Columns = {
  description: string;
  amount: number;
  transaction_date: string;
  tags: string[];
  id: string;
};

export const columns: ColumnDef<Columns>[] = [
  {
    header: "Description",
    accessorKey: "description",
  },
  {
    header: "Amount",
    accessorKey: "amount",
    cell: ({ row }) => {
      return (
        <span className="text-right">
          {row.original.amount < 0 ? "-" : ""}
          {Math.abs(row.original.amount).toLocaleString("pt-br", {
            style: "currency",
            currency: "BRL",
          })}
        </span>
      );
    },
  },
  {
    header: "Date",
    accessorKey: "transaction_date",
  },
  {
    header: "Tags",
    accessorKey: "tags",
    cell: ({ row }) => {
      return (
        <div className="space-x-1">
          {row.original.tags?.map((tag: string, index: number) => (
            <Tag key={index} tag={tag} />
          ))}
        </div>
      );
    },
    // cell:  ({ row }) => {
    //   const supabase = createClient();
    //   const { data: tags, error } = await supabase
    //     .from("transactions_tags")
    //     .select(
    //       `tag_id (
    //       text
    //       )`,
    //     )
    //     .eq("transaction_id", row.original.id);

    //   if (error) {
    //     console.error(error);
    //     return null;
    //   }
    //   return (
    //     <div>
    //       <Button variant="ghost" size="sm">
    //         Add Tag
    //       </Button>
    //       {tags?.map((tag) => (
    //         <span
    //           key={tag.text}
    //           className="mr-1 rounded-full bg-gray-200 px-2 py-1 text-xs"
    //         >
    //           {tag.text}
    //         </span>
    //       ))}
    //     </div>
    //   );
    // },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const transaction = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Split With...</DropdownMenuItem>
            <DropdownMenuItem>
              {row.original.amount >= 0
                ? "Change to expense"
                : "Change to income"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

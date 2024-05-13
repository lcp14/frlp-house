"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  changeTransactionTypeById,
  deleteTransactionById,
} from "@/server/transactions";
import { Database } from "@/types/supabase";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, UserRound, Users2 } from "lucide-react";
import React from "react";
import { formatCurrency } from "../_helpers/_currency";
import Tag from "../components/tag";
import { SplitWithDrawerForm } from "../components/split-with-drawer-form";

export const columns: ColumnDef<
  Database["public"]["Functions"]["get_user_transactions"]["Returns"][0]
>[] = [
  {
    header: "Description",
    accessorKey: "description",
    cell: ({ row }) => {
      return (
        <div>
          <div className="flex gap-3">
            {!row.original.belongs_to_me ? (
              <Users2 className="w-4 h-4" />
            ) : (
              <UserRound className="w-4 h-4" />
            )}{" "}
            {row.original.description}
          </div>
          <div className="text-gray-500 text-xs">
            {!row.original.split_amount && row.original.belongs_to_me
              ? ""
              : row.original.belongs_to_me
                ? "Shared by me"
                : "Shared with me"}
          </div>
        </div>
      );
    },
  },
  {
    header: "Amount",
    accessorKey: "amount",
    cell: ({ row }) => {
      return (
        <>
          <span className="text-right">
            {formatCurrency(row.original.amount)}
          </span>
          <div className="text-gray-500 text-xs">
            {!row.original.split_amount && row.original.belongs_to_me
              ? ""
              : row.original.belongs_to_me
                ? formatCurrency(row.original.split_amount)
                : formatCurrency(row.original.split_amount)}
          </div>
        </>
      );
    },
  },
  {
    header: "Date",
    accessorKey: "transaction_date",
    cell: ({ row }) => {
      return new Date(row.original.transaction_date).toLocaleDateString();
    },
  },
  {
    header: "Tags",
    accessorKey: "tags",
    cell: ({ row }) => {
      if (!row.original.belongs_to_me) return;
      if (!(row.original.tags instanceof Array)) return;
      return (
        <div className="space-x-1">
          {row.original.tags?.map((tag: any, index: number) => (
            <Tag key={index} tag={tag} />
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: function Cell({ row }) {
      const [open, setOpen] = React.useState(false);
      if (!row.original.belongs_to_me) return;

      async function handleDeleteTransaction() {
        const { data, error } = await deleteTransactionById(row.original.t_id);
        if (error) {
          console.error(error);
          return;
        }
        console.info("Transaction deleted");
      }

      async function updateTransactions(transaction: typeof row.original) {
        await changeTransactionTypeById(transaction.t_id, transaction.amount);
      }

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setOpen(!open)}>
                Split With...
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => updateTransactions(row.original)}
              >
                {row.original.amount >= 0
                  ? "Change to expense"
                  : "Change to income"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteTransaction()}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <SplitWithDrawerForm
            open={open}
            setOpen={setOpen}
            transaction={row.original}
          />
        </>
      );
    },
  },
];

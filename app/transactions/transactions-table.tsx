"use client";
import { TransactionForm } from "@/app/components/transaction-form";
import { useQuery } from "@tanstack/react-query";
import { getTransactionsById } from "@/server/transactions";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { useState } from "react";
export function TransactionsTable() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => getTransactionsById(),
  });

  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>
          <Button size={"icon"} onClick={() => setOpen}>
            <PlusIcon />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Transaction form</DialogTitle>
          <TransactionForm
            onAddTransaction={() => {
              refetch();
              setOpen(!open);
            }}
          />
        </DialogContent>
      </Dialog>
      <hr />
      {isLoading ? (
        <span> Loading... </span>
      ) : (
        <DataTable columns={columns} data={data?.data ?? []} />
      )}
    </div>
  );
}

"use client";
import { TransactionForm } from "@/app/components/transaction-form";
import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "@/server/transactions";
import { columns } from "./columns";
import { DataTable } from "./data-table";
export function TransactionsTable() {
  const { data, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => getTransactions(),
  });

  return (
    <div className="space-y-4">
      <TransactionForm />
      <hr />
      {isLoading ? (
        <span> Loading... </span>
      ) : (
        <DataTable columns={columns} data={data?.data ?? []} />
      )}
    </div>
  );
}

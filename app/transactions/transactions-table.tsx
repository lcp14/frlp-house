"use client";
import { columns } from "./columns";
import { DataTable } from "./data-table";
export function TransactionsTable({ transactions }: { transactions: any[] }) {
  return <DataTable columns={columns} data={transactions ?? []} />;
}

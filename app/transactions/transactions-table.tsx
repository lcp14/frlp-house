"use client";
import { Database } from "@/types/supabase";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export function TransactionsTable({
  transactions,
}: {
  transactions: Database["public"]["Functions"]["get_user_transactions"]["Returns"];
}) {
  return <DataTable columns={columns} data={transactions ?? []} />;
}

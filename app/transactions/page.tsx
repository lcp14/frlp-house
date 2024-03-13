import { TransactionsTable } from "./transactions-table";

export default async function Page() {
  return (
    <div className="space-y-4">
      <TransactionsTable />
    </div>
  );
}

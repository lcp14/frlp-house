import { getUser } from "../_helpers/_auth";
import { TransactionsTable } from "./transactions-table";

export default async function Page() {
  await getUser();

  return (
    <div className="space-y-4">
      <h1>Transactions</h1>
      <TransactionsTable />
    </div>
  );
}

import { unstable_cache } from "next/cache";
import { TransactionsTable } from "./transactions-table";
import { getCurrentUserTransactions } from "@/server/transactions";
import { createClient } from "../utils/supabase/server";
import { cookies } from "next/headers";
import { TransactionForm } from "../components/transaction-form";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTagsByUserId } from "@/server/tags";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { Suspense } from "react";

const getCachedTransactions = unstable_cache(
  async (cookies: ReadonlyRequestCookies, id: string) =>
    getCurrentUserTransactions(cookies, id),
  ["my-transactions"],
);

const getCachedTags = unstable_cache(
  async (cookies: ReadonlyRequestCookies, id: string) =>
    await getTagsByUserId(cookies, id),
  ["tags"],
);

export default async function Page() {
  const supabase = createClient(cookies());
  const { data } = await supabase.auth.getUser();
  const { data: transactions } = await getCachedTransactions(
    cookies(),
    data.user?.id ?? "",
  );
  const { data: tags } = await getCachedTags(cookies(), data.user?.id ?? "");

  return (
    <div className="space-y-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button className="space-x-2">
            <PlusIcon /> <span> Add transaction </span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Transaction form</DialogTitle>
          <Suspense>
            <TransactionForm tags={tags ?? []} />
          </Suspense>
        </DialogContent>
      </Dialog>
      <Suspense>
        <TransactionsTable transactions={transactions ?? []} />
      </Suspense>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  getCurrentUserTransactions,
  getCurrentUserTransactionsByFilter,
} from "@/server/transactions";
import { getTransactionSharedWithCurrentUser } from "@/server/transactions_shared";
import { unstable_cache } from "next/cache";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { formatCurrency } from "./_helpers/_currency";
import { createClient } from "./utils/supabase/server";
import { Database, Tables } from "@/types/supabase";
import { capitalize } from "./_helpers/_string";
import { DashboardNumberCard } from "./components/dashboard-number-card";

const getCachedTransactionsById = unstable_cache(
  async (cookies: ReadonlyRequestCookies, id: string) =>
    await getCurrentUserTransactions(cookies, id),
  ["transactions-by-id"],
  { revalidate: 1 },
);

const getCachedTransactionSharedWithCurrentUser = unstable_cache(
  async (cookies: ReadonlyRequestCookies, id) =>
    await getTransactionSharedWithCurrentUser(cookies, id),
  ["transactions-shared-by-id"],
  { revalidate: 1 },
);

const getCachedTransactionsCurrentMonth = unstable_cache(
  async (cookies: ReadonlyRequestCookies, id) =>
    await getCurrentUserTransactionsByFilter(cookies, id, {
      date_range: {
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    }),
  ["transactions-current-month"],
  { revalidate: 1 },
);

const getCachedTransactionsPreviousMonth = unstable_cache(
  async (cookies: ReadonlyRequestCookies, id) =>
    await getCurrentUserTransactionsByFilter(cookies, id, {
      date_range: {
        from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        to: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
      },
    }),
  ["transactions-previous-month"],
  { revalidate: 1 },
);

export default async function Page() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  const [
    { data: transactions },
    { data: transactions_shared },
    { data: transactions_current_month },
    { data: transactions_previous_month },
  ] = await Promise.all([
    getCachedTransactionsById(cookies(), data?.user.id),
    getCachedTransactionSharedWithCurrentUser(cookies(), data?.user.id),
    getCachedTransactionsCurrentMonth(cookies(), data?.user.id),
    getCachedTransactionsPreviousMonth(cookies(), data?.user.id),
  ]);

  const sumTransactions = transactions_current_month?.reduce(
    (acc, curr) => {
      if (curr.amount >= 0) {
        acc.positive += curr.amount;
      } else {
        acc.negative += curr.amount;
      }

      acc.total += curr.amount;

      return acc;
    },
    { positive: 0, negative: 0, total: 0 },
  );

  const sum_transactions_previous_month = transactions_previous_month?.reduce(
    (acc, curr) => {
      if (curr.amount >= 0) {
        acc.positive += curr.amount;
      } else {
        acc.negative += curr.amount;
      }

      acc.total += curr.amount;

      return acc;
    },
    { positive: 0, negative: 0, total: 0 },
  );

  const total_per_tag =
    transactions_current_month &&
    reduceTransactionsByTag(transactions_current_month);

  const result = Object.values(total_per_tag ?? [])
    .sort(
      (a: { tag: string; value: number }, b: { tag: string; value: number }) =>
        b.value - a.value,
    )
    .slice(0, 5)
    .map((tag) => ({
      tag: tag.tag,
      value: tag.value,
    }));

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <DashboardNumberCard
        name={new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1,
        ).toLocaleString("default", { month: "long", year: "numeric" })}
        value={sumTransactions?.total}
      >
        <span className="px-2">
          {new Date(
            new Date().getFullYear(),
            new Date().getMonth() - 1,
            1,
          ).toLocaleString("default", { month: "long", year: "numeric" })}
        </span>
        {sum_transactions_previous_month &&
          formatCurrency(sum_transactions_previous_month?.total)}
      </DashboardNumberCard>
      <DashboardNumberCard
        name="Income"
        value={sumTransactions?.positive}
        type="positive"
      >
        <span className="px-2">
          {new Date(
            new Date().getFullYear(),
            new Date().getMonth() - 1,
            1,
          ).toLocaleString("default", { month: "long", year: "numeric" })}
        </span>
        {sum_transactions_previous_month &&
          formatCurrency(sum_transactions_previous_month?.positive)}
      </DashboardNumberCard>
      <DashboardNumberCard
        name="Expenses"
        value={sumTransactions?.negative}
        type="negative"
      >
        <span className="px-2">
          {new Date(
            new Date().getFullYear(),
            new Date().getMonth() - 1,
            1,
          ).toLocaleString("default", { month: "long", year: "numeric" })}
        </span>
        {sum_transactions_previous_month &&
          formatCurrency(sum_transactions_previous_month?.negative)}
      </DashboardNumberCard>
      <div className="col-start-1 col-end-3">
        <DashboardNumberCard name="In debt with">
          <Table>
            <TableBody>
              {transactions_shared?.map((transaction, index) => (
                <TableRow key={transaction.id}>
                  <TableCell key={`transaction-${index}-created-by`}>
                    {transaction.created_by?.email}
                  </TableCell>
                  <TableCell key={`transaction-${index}-split-amount`}>
                    <div>{formatCurrency(transaction.split_amount)}</div>
                  </TableCell>
                  <TableCell key={`transaction-${index}-settle`}>
                    <Button> Settle </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DashboardNumberCard>
      </div>
      <div>
        <DashboardNumberCard name="Most expensive tags this month">
          <Table>
            <TableBody>
              {result.map((tag, index) => (
                <TableRow key={tag.tag}>
                  <TableCell key={`tag-${index}-tag`}>
                    {capitalize(tag.tag)}
                  </TableCell>
                  <TableCell key={`tag-${index}-value`}>
                    <div>{formatCurrency(tag.value)}</div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DashboardNumberCard>
      </div>
    </div>
  );
}

function reduceTransactionsByTag(
  transactions: Database["public"]["Functions"]["get_user_transactions"]["Returns"][0][],
): {
  [key: number]: { tag: string; value: number };
} {
  return transactions.reduce(
    (acc: { [key: number]: { tag: string; value: number } }, curr) => {
      (curr.tags as Tables<"tags">[]).forEach((tag) => {
        if (curr.amount >= 0) return acc;

        const tagId = tag.id;
        if (!acc[tagId]) {
          acc[tagId] = { tag: tag.text, value: 0 };
        }
        acc[tagId].value = acc[tagId].value + -1 * curr.amount;
      });
      return acc;
    },
    {},
  );
}

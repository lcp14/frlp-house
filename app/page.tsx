import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { getCurrentUserTransactions } from "@/server/transactions";
import { getTransactionSharedWithCurrentUser } from "@/server/transactions_shared";
import { unstable_cache } from "next/cache";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { formatCurrency } from "./_helpers/_currency";
import { createClient } from "./utils/supabase/server";
import { cn } from "@/lib/utils";

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

export default async function Page() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  const { data: transactions } = await getCachedTransactionsById(
    cookies(),
    data?.user.id,
  );

  const { data: transactions_shared } =
    await getCachedTransactionSharedWithCurrentUser(cookies(), data?.user.id);

  const transactions_payload = transactions ?? [];

  const sumTransactions = transactions_payload.reduce(
    (
      acc: {
        positive: number;
        negative: number;
        total: number;
        shared_total: number;
      },
      curr,
    ) => {
      if (curr.split_amount) {
        acc.negative += curr.split_amount;
        if (!curr.belongs_to_me) {
          acc.shared_total += curr.split_amount;
        }
      } else if (!curr.belongs_to_me) {
        acc.negative += curr.split_amount;
      } else {
        acc.positive += curr.amount > 0 ? curr.amount : 0;
        acc.negative += curr.amount < 0 ? curr.amount : 0;
      }

      acc.total = acc.positive - acc.negative;
      return acc;
    },
    {
      positive: 0,
      negative: 0,
      total: 0,
      shared_total: 0,
    },
  );

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <DashboardNumberCard
        name={new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1,
        ).toLocaleString("default", { month: "long", year: "2-digit" })}
        value={sumTransactions?.total}
      >
        <div>
          <div>Pending: {formatCurrency(sumTransactions.shared_total)}</div>
        </div>
      </DashboardNumberCard>
      <DashboardNumberCard
        name="Income"
        value={sumTransactions.positive}
        type="positive"
      />
      <DashboardNumberCard
        name="Expenses"
        value={sumTransactions.negative}
        type="negative"
      />
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
    </div>
  );
}

export function DashboardNumberCard({
  name,
  value,
  type,
  children,
}: {
  name: string;
  value?: number;
  type?: "positive" | "negative";
  children?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{name}</CardDescription>
        {value !== undefined && (
          <CardTitle
            className={cn(
              "text-4xl",
              type === "negative"
                ? "text-red-400"
                : type === "positive"
                  ? "text-green-400"
                  : "",
            )}
          >
            {formatCurrency(value)}
          </CardTitle>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground">{children}</div>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}

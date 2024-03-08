import { cookies } from "next/headers";
import { createClient } from "./utils/supabase/server";
import { redirect } from "next/navigation";
import {
  getTransactionsById,
  getTransactionsSumAggByMonth,
  getTransactionsSumAggByTag,
} from "@/server/transactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { formatCurrency } from "./_helpers/_currency";

const SumByTagBarChart = dynamic(
  () => import("@/app/components/charts/sum-by-tag-pie-chart"),
  {
    ssr: false,
  },
);

const SumByMonth = dynamic(
  () => import("@/app/components/charts/sum-by-month-bar-chart"),
  {
    ssr: false,
  },
);

export default async function Page() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  const { data: transactions } = await getTransactionsById(data?.user.id);
  if (!transactions) {
    return;
  }
  const sumAggByTag = await getTransactionsSumAggByTag(transactions);
  const transactionByMonth = await getTransactionsSumAggByMonth(transactions);

  const sumTransactions = transactions?.reduce(
    (acc: any, curr) => {
      acc.positive += curr.amount > 0 ? curr.amount : 0;
      acc.negative += curr.amount < 0 ? curr.amount : 0;
      acc.total += curr.amount;
      return acc;
    },
    {
      positive: 0,
      negative: 0,
      total: 0,
    },
  );

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Positive</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold text-green-500`}>
            + {formatCurrency(sumTransactions.positive)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Negative</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold text-red-500`}>
            - {formatCurrency(sumTransactions.negative * -1)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${sumTransactions.total > 0 ? "text-green-500" : "text-red-500"}`}
          >
            = {formatCurrency(sumTransactions.total)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {" "}
            Transaction by Tag
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64 w-full">
          <SumByTagBarChart data={Object.values(sumAggByTag)} />
        </CardContent>
      </Card>
      <Card className="col-span-12">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {" "}
            Transaction by Tag
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64 w-full">
          <SumByMonth data={Object.values(transactionByMonth)} />
        </CardContent>
      </Card>
    </div>
  );
}

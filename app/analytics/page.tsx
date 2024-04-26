import {
  getTransactionsSumAggByMonth,
  getTransactionsSumAggByTag,
} from "@/server/transactions";
import { unstable_cache } from "next/cache";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import dynamic from "next/dynamic";
import { cookies } from "next/headers";
import { DashboardNumberCard } from "../page";
import { Suspense } from "react";

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

const getCachedTransactionsSumAggByTag = unstable_cache(
  async (cookies: ReadonlyRequestCookies) =>
    await getTransactionsSumAggByTag(cookies),
  ["transactions-sum-agg-by-tag"],
);

const getCachedTransactionsSumAggByMonth = unstable_cache(
  async (cookies: ReadonlyRequestCookies) =>
    await getTransactionsSumAggByMonth(cookies),
  ["transactions-sum-agg-by-month"],
);

export default async function Page() {
  // const sumAggByTag = await getCachedTransactionsSumAggByTag(cookies());
  // const transactionByMonth =
  //   await getCachedTransactionsSumAggByMonth(cookies());
  const [sumAggByTag, transactionByMonth] = await Promise.all([
    getCachedTransactionsSumAggByTag(cookies()),
    getCachedTransactionsSumAggByMonth(cookies()),
  ]);

  return (
    <div className="grid grid-cols-2 gap-2">
      <DashboardNumberCard name="Sum agg by tag">
        <div className="h-[400px]">
          <Suspense>
            <SumByTagBarChart data={Object.values(sumAggByTag)} />
          </Suspense>
        </div>
      </DashboardNumberCard>
      <DashboardNumberCard name="Sum agg by month">
        <Suspense>
          <SumByMonth data={Object.values(transactionByMonth)} />
        </Suspense>
      </DashboardNumberCard>
    </div>
  );
}

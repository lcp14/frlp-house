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
  { revalidate: 1 },
);

const getCachedTransactionsSumAggByMonth = unstable_cache(
  async (cookies: ReadonlyRequestCookies) =>
    await getTransactionsSumAggByMonth(cookies),
  ["transactions-sum-agg-by-month"],
  { revalidate: 1 },
);

export default async function Page() {
  const [sumAggByTag, transactionByMonth] = await Promise.all([
    getCachedTransactionsSumAggByTag(cookies()),
    getCachedTransactionsSumAggByMonth(cookies()),
  ]);

  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="col-span-3">
        <DashboardNumberCard name="Sum agg by tag">
          <SumByTagBarChart data={Object.values(sumAggByTag)} />
        </DashboardNumberCard>
      </div>
      <div className="col-span-3">
        <DashboardNumberCard name="Sum agg by month">
          <SumByMonth data={Object.values(transactionByMonth)} />
        </DashboardNumberCard>
      </div>
    </div>
  );
}

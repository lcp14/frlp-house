"use client";

import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function renderLegend(value: string, entry: any) {
  const { color } = entry;
  return <span className="m-2"> Transactions sum by month</span>;
}

export default function transactionSumByMonth({ data }: { data: any }) {
  return (
    <ResponsiveContainer width="100%" height={300} className={"p-4"}>
      <BarChart data={data}>
        <XAxis dataKey="key" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#0088FE" />
        <Legend formatter={renderLegend} />
      </BarChart>
    </ResponsiveContainer>
  );
}

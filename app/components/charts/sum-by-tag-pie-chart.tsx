"use client";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatCurrency } from "@/app/_helpers/_currency";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

function CustomTooltip({ payload, label, active }: any) {
  if (active) {
    return (
      <Card>
        <CardHeader>{`${payload[0].name}`}</CardHeader>
        <CardContent>{`Total: ${formatCurrency(payload[0].value)}`}</CardContent>
      </Card>
    );
  }
  return null;
}
export default function SumByTagPieChart({
  data,
}: {
  data: { tag: string; value: number }[];
}) {
  return (
    <ResponsiveContainer className={"p-2"} height={400}>
      <PieChart>
        <Tooltip content={<CustomTooltip />} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="tag"
          cx="50%"
          cy="50%"
          fill="#8884d8"
          label={({ name, value }) => `${formatCurrency(value)}`}
        >
          {data.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

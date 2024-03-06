import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cookies } from "next/headers";
import { createClient } from "../utils/supabase/server";
import { redirect } from "next/navigation";
import { getTransactions } from "@/server/transactions";

export default async function Page() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }
  const { data: transactions, error: error_transactions } =
    await getTransactions();

  if (!transactions) {
    return <div>Loading...</div>;
  }
  const sum = transactions.reduce((acc, transaction) => {
    return acc + transaction.amount;
  }, 0);

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle> Total </CardTitle>
        <CardDescription>
          {sum.toLocaleString("pt-br", {
            style: "currency",
            currency: "BRL",
          })}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

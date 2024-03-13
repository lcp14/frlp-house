"use server";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getTransactionsById(id?: string) {
  const supabase = createClient(cookies());
  let user_id = id as string;
  if (!id) {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) redirect("/login");
    user_id = data?.user.id;
  }

  return await supabase
    .from("transactions")
    .select(
      "id, amount, description, created_at, transaction_date, tags (id, text)",
    )
    .eq("created_by", user_id)
    .throwOnError();
}

export async function getTransactionsSumAggByTag(transactions: any) {
  if (!transactions) {
    return [];
  }
  return transactions.reduce((acc: any, curr: any) => {
    curr.tags.forEach((tag: any) => {
      const tagId = tag.id;
      if (!acc[tagId]) {
        acc[tagId] = { tag: tag.text, value: 0 };
      }
      acc[tagId].value = acc[tagId].value + curr.amount;
    });
    return acc;
  }, {});
}

export async function getTransactionsSumAggByMonth(transactions: any) {
  if (!transactions) {
    return [];
  }
  return transactions.reduce((acc: any, curr: any) => {
    const month = new Date(curr.transaction_date).getMonth();
    const year = new Date(curr.transaction_date).getFullYear();
    const key = `${year}/${month}`;
    if (!acc[key]) {
      acc[key] = { key, value: 0 };
    }
    acc[key].value = acc[key].value + curr.amount;
    return acc;
  }, {});
}

export async function deleteTransactionById(transaction_id: number) {
  const supabase = createClient(cookies());
  return await supabase.from("transactions").delete().eq("id", transaction_id);
}

"use server";
import { createClient } from "@/app/utils/supabase/server";
import { Tables } from "@/types/supabase";
import { cookies } from "next/headers";

export async function getTransactionsById(id: string) {
  const supabase = createClient(cookies());

  return await supabase
    .from("transactions")
    .select(
      "id, amount, description, created_at, transaction_date, tags (id, text)",
    )
    .eq("created_by", id)
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

"use server";
import { createClient } from "@/app/utils/supabase/server";
import { Database, Tables } from "@/types/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath, revalidateTag } from "next/cache";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getTransactionsById(
  supabase: SupabaseClient,
  id?: string,
) {
  let user_id = id as string;
  if (!id) {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) redirect("/login");
    user_id = data?.user.id;
  }

  const query = await supabase
    .from("transactions")
    .select(
      "id, amount, description, created_at, transaction_date, tags (id, text), transactions_shared (split_amount, split_with, users:split_with(id, email))",
    )
    .eq("created_by", user_id)
    .throwOnError();
  return query;
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

type UserTransactions = {
  id: number;
  amount: number;
  description: string;
  transaction_date: string;
  tags: { id: number; text: string }[];
  split_amount: number;
  belongs_to_me: boolean;
};

export async function getCurrentUserTransactions(
  cookies: ReadonlyRequestCookies,
  id: string,
) {
  const supabase = createClient(cookies);
  return await supabase
    .rpc("get_user_transactions", { id: id })
    .order("transaction_date", { ascending: false });
}

export async function createTransaction(values: any) {
  const { amount, description, transaction_date, tags } = values;

  const payload = {
    amount,
    transaction_date: transaction_date.toISOString(),
    description,
  };

  const supabase = createClient(cookies());
  const user = supabase.auth.getUser();
  const response = await supabase.from("transactions").insert(payload).select();
  if (response.error) {
    return {
      status: "error",
      title: "Transaction error",
      description: "Transaction was not addded",
    };
  }

  const tagPayload = tags.map((tag: Tables<"tags">) => ({
    transaction_id: response.data[0].id,
    tag_id: tag.id as number,
  }));
  const { error } = await supabase.from("transactions_tags").insert(tagPayload);
  if (error) {
    return {
      status: "error",
      title: "Tags was not added",
      description: "Tags was not succesfully added",
    };
  }
  revalidateTag("my-transactions");
  revalidatePath("/", "page");
  return {
    status: "success",
    title: "Transaction created",
    description: "Transaction has been created successfully",
  };
}

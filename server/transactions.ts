"use server";
import { transactionSchema } from "@/app/components/transaction-form";
import { createClient } from "@/app/utils/supabase/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function getTransactionsById(
  cookies: ReadonlyRequestCookies,
  id?: string,
) {
  const supabase = createClient(cookies);
  let user_id = id as string;
  if (!id) {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) redirect("/login");
    user_id = data?.user.id;
  }

  const query = await supabase
    .from("transactions")
    .select(
      "id, amount, description, created_at, transaction_date, tags (id, text), transactions_shared (split_amount, split_with, users:users!public_transactions_shared_split_with_fkey(id, email))",
    )
    .eq("created_by", user_id)
    .throwOnError();
  return query;
}

export async function getTransactionsSumAggByTag(
  cookies: ReadonlyRequestCookies,
) {
  const { data: transactions } = await getTransactionsById(cookies);
  if (!transactions) {
    return [];
  }
  return transactions.reduce(
    (acc: { [key: number]: { tag: string; value: number } }, curr) => {
      curr.tags.forEach((tag) => {
        if (curr.amount >= 0) return acc;

        const tagId = tag.id;
        if (!acc[tagId]) {
          acc[tagId] = { tag: tag.text, value: 0 };
        }
        acc[tagId].value = acc[tagId].value + -1 * curr.amount;
      });
      return acc;
    },
    {},
  );
}

export async function getTransactionsSumAggByMonth(
  cookies: ReadonlyRequestCookies,
) {
  const { data: transactions } = await getTransactionsById(cookies);
  if (!transactions) {
    return [];
  }
  return transactions.reduce((acc: any, curr) => {
    const month = new Date(curr.transaction_date).toLocaleString("default", {
      month: "long",
    });
    const year = new Date(curr.transaction_date).toLocaleString("default", {
      year: "2-digit",
    });
    if (curr.amount >= 0) return acc;
    const key = `${month}-${year}`;
    if (!acc[key]) {
      acc[key] = { key, value: 0 };
    }
    acc[key].value = -1 * acc[key].value + curr.amount;
    return acc;
  }, {});
}

export async function deleteTransactionById(transaction_id: number) {
  const supabase = createClient(cookies());
  const response = await supabase
    .from("transactions")
    .delete()
    .eq("id", transaction_id);
  revalidateTag("my-transactions");
  revalidatePath("/transactions", "page");
  console.log(response);
  return response;
}

export async function getCurrentUserTransactions(
  cookies: ReadonlyRequestCookies,
  id: string,
) {
  const supabase = createClient(cookies);
  const response = await supabase
    .rpc("get_user_transactions", { id: id })
    .order("transaction_date", { ascending: false })
    .throwOnError();
  return response;
}

export async function getCurrentUserTransactionsByFilter(
  cookies: ReadonlyRequestCookies,
  id: string,
  filter?: {
    date_range?: { from?: Date; to?: Date };
  },
) {
  const supabase = createClient(cookies);
  const query = supabase.rpc("get_user_transactions", { id: id });

  if (filter?.date_range) {
    filter.date_range.from &&
      query.gte("transaction_date", filter.date_range.from.toISOString());
    filter.date_range.to &&
      query.lte("transaction_date", filter.date_range.to.toISOString());
  }

  query.order("transaction_date", { ascending: false }).throwOnError();
  return await query;
}

export async function createTransaction(
  values: z.infer<typeof transactionSchema>,
) {
  const { amount, description, transaction_date, tags } = values;

  const payload = {
    amount,
    transaction_date: transaction_date.toISOString(),
    description,
  };

  const supabase = createClient(cookies());
  const response = await supabase.from("transactions").insert(payload).select();
  if (response.error) {
    return {
      status: "error",
      title: "Transaction error",
      description: "Transaction was not addded",
    };
  }

  const tagPayload = tags.map((tag) => ({
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
  revalidatePath("/transactions", "page");
  return {
    status: "success",
    title: "Transaction created",
    description: "Transaction has been created successfully",
  };
}

export async function changeTransactionTypeById(id: number, value: number) {
  const supabase = createClient(cookies());
  const response = await supabase
    .from("transactions")
    .update({ amount: value * -1 })
    .eq("id", id)
    .throwOnError();
  revalidateTag("my-transactions");
  revalidatePath("/transactions", "page");
  return response;
}

"use server";

import { createClient } from "@/app/utils/supabase/server";
import { TablesInsert } from "@/types/supabase";
import { cookies } from "next/headers";
import { getUsersByEmails } from "./users";

export async function createTransactionShared(
  payload: TablesInsert<"transactions_shared">[],
) {
  const supabase = createClient(cookies());
  const splitWithArray = payload?.map((p) => {
    const email = p.split_with;
    if (!email) throw new Error("Email cannot be empty");
    return email;
  });
  const { data, error } = await getUsersByEmails(splitWithArray);
  if (!data || error) {
    throw new Error("User not found.");
  }

  payload.forEach((p) => {
    const email = p.split_with;
    const user = data.find((d) => d.email === email);
    if (!user) throw new Error("User not found.");
    p.split_with = user.id;
  });

  return await supabase
    .from("transactions_shared")
    .insert(payload)
    .select()
    .throwOnError();
}

export async function getTransactionsSharedByTransactionId(
  transaction_id: number,
) {
  const supabase = createClient(cookies());
  return await supabase
    .from("transactions_shared")
    .select(
      "id, split_amount, split_with:users!public_transactions_shared_split_with_fkey(id, email)",
    )
    .eq("transaction_id", transaction_id)
    .throwOnError();
}

export async function getTransactionSharedBySlitWithCurrentUser(id: string) {
  const supabase = createClient(cookies());
  return await supabase
    .from("transactions_shared")
    .select(
      "id, split_amount, split_with, transactions(*, users:created_by(id, email))",
    )
    .neq("created_by", id)
    .eq("split_with", id)
    .order("created_at", { ascending: false })
    .throwOnError();
}

export async function deleteTransactionSharedByTransactionId(id: number) {
  const supabase = createClient(cookies());
  const response = await supabase
    .from("transactions_shared")
    .delete()
    .eq("transaction_id", id)
    .throwOnError();
  return response;
}

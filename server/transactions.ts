"use server";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";

export async function getTransactions() {
  const supabase = createClient(cookies());
  const { data: currentUser, error } = await supabase.auth.getUser();
  if (error) {
    throw new Error("Error getting user");
  }

  return await supabase
    .from("transactions")
    .select("amount, description, created_at, transaction_date, tags (text)")
    .eq("created_by", currentUser.user.id)
    .throwOnError();
}

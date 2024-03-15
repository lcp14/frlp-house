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

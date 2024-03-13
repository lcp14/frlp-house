"use server";

import { createClient } from "@/app/utils/supabase/server";
import { TablesInsert } from "@/types/supabase";
import { cookies } from "next/headers";
import { checkIfUserExists } from "./users";

export async function createTransactionShared(
  payload: TablesInsert<"transactions_shared">[],
) {
  const supabase = createClient(cookies());
  const splitWithArray = payload?.map((p) => {
    const email = p.split_with;
    if (!email) throw new Error("Email cannot be empty");
    return email;
  });
  const isValidUser = checkIfUserExists(splitWithArray);
  if (!isValidUser) {
    throw new Error("User not found.");
  }

  return await supabase
    .from("transactions_shared")
    .insert(payload)
    .select()
    .throwOnError();
}

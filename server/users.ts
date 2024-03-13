"use server";

import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";

export async function checkIfUserExists(emails: string[]) {
  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from("users")
    .select()
    .in("email", emails);
  if (!data) {
    return false;
  }
  return true;
}

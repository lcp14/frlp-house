"use server";

import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";

export async function getUsersByEmails(emails: string[]) {
  const supabase = createClient(cookies());
  return await supabase
    .from("users")
    .select()
    .in("email", emails)
    .throwOnError();
}

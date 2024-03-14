import { cookies } from "next/headers";
import { createClient } from "../utils/supabase/server";
import { redirect } from "next/navigation";

export async function getUser() {
  const supabase = createClient(cookies());
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    console.info("Invalid session: Redirecting...");
    redirect("/login");
  }

  return data.user;
}

import { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export async function getUser(supabase: SupabaseClient) {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    console.info("Invalid session: Redirecting...");
    redirect("/login");
  }

  return data.user;
}

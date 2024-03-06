"use server";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";

export async function getTagsByLoggedUser() {
  const supabase = createClient(cookies());
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) {
    throw new Error("User not found.");
  }
  return await supabase
    .from("tags")
    .select("*")
    .eq("created_by", userId)
    .throwOnError();
}

export async function createTag(tag: { text: string }) {
  const supabase = createClient(cookies());
  return await supabase.from("tags").insert(tag).select().throwOnError();
}

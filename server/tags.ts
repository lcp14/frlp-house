"use server";
import { createClient } from "@/app/utils/supabase/server";
import { revalidateTag } from "next/cache";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { cookies } from "next/headers";

export async function getTagsByUserId(
  cookies: ReadonlyRequestCookies,
  id: string,
) {
  const supabase = createClient(cookies);
  return await supabase
    .from("tags")
    .select("*")
    .eq("created_by", id)
    .throwOnError();
}

export async function createTag(tag: { text: string }) {
  const supabase = createClient(cookies());

  const data = await supabase.from("tags").insert(tag).select().throwOnError();
  revalidateTag("tags");
  return data;
}

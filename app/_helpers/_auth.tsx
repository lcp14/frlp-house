"use server";
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

export function getURL(): string {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    "http://localhost:3000/";
  // Make sure to include `https://` when not localhost.
  url = url.includes("http") ? url : `https://${url}`;
  // Make sure to include a trailing `/`.
  url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;
  return url;
}

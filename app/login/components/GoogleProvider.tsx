"use client";
import { createClient } from "@/app/utils/supabase/client";
import { Button } from "@/components/ui/button";

function getURL(): string {
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

export default function GoogleLoginButton() {
  const loginWithGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
        redirectTo: getURL(),
      },
    });
  };
  return (
    <Button variant={"outline"} onClick={loginWithGoogle}>
      Login with Google
    </Button>
  );
}

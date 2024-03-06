"use client";
import { createClient } from "@/app/utils/supabase/client";
import { Button } from "@/components/ui/button";

export default async function GoogleLoginButton() {
  const loginWithGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
        redirectTo: "http://localhost:3000/auth/callback",
      },
    });
  };
  return (
    <Button variant={"outline"} onClick={loginWithGoogle}>
      Login with Google
    </Button>
  );
}

import { cookies } from "next/headers";
import { createClient } from "../utils/supabase/server";

export default async function Page() {
  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from("transactions")
    .select(
      "id, amount, description, created_at, transaction_date, tags (id, text), transactions_shared (split_amount, split_with, users(id, email))",
    );

  console.log(data);

  const transactions_shared = await supabase
    .from("transactions_shared")
    .select("split_with, users(email))");

  return (
    <>
      <pre> {JSON.stringify(data, null, 2)} </pre>
      <pre> {JSON.stringify(transactions_shared.data, null, 2)} </pre>
    </>
  );
}

import { createClient } from "../utils/supabase/client";

export async function TransactionList() {
  const supabase = createClient();
  const { data, error } = await supabase.from("transactions").select();
  if (error) {
    return <div> {error.message}</div>;
  }
  return <div> List: {JSON.stringify(data)}</div>;
}

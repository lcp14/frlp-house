"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  createTransactionShared,
  deleteTransactionSharedByTransactionId,
  getTransactionsSharedByTransactionId,
} from "@/server/transactions_shared";
import { Database } from "@/types/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import currency from "currency.js";
import { ArrowRightIcon, Badge, Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import { Input } from "@/components/ui/input";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createClient } from "../utils/supabase/client";

export function SplitWithForm({ transaction }: any) {
  const [emails, setEmails] = React.useState<
    { email: string; value: number }[]
  >([
    {
      email: "you",
      value: transaction.amount,
    },
  ]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    getTransactionsSharedByTransactionId(transaction.t_id).then((response) => {
      if (!response?.data) return;
      const emails = response.data.map((r) => {
        return {
          email: r.split_with?.email ?? "Error fetching email",
          value: r.split_amount,
        };
      });
      setEmails(emails);
      setLoading(false);
    });
  }, [transaction.t_id]);

  const supabase = createClient();

  const userFormSchema = z.object({
    email: z.string().email(),
  });
  const userForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (payload: z.infer<typeof userFormSchema>) => {
    const { data, error } = await supabase.auth.getSession();
    if (!data || !data.session || error) {
      redirect("/login");
    }
    const email = payload.email;
    if (
      email === data.session.user.email ||
      emails.map((e) => e.email).includes(email)
    ) {
      return;
    }
    const emailsCopy = [...emails, { email, value: 0 }];
    const distribution = currency(transaction.amount).distribute(
      emailsCopy.length,
    );
    const newEmails = emailsCopy.map((email, index) => {
      return { email: email.email, value: distribution[index].value };
    });
    setEmails([...newEmails]);
  };

  async function onSubmitShared(emails: { email: string; value: number }[]) {
    const { data, error } = await supabase.auth.getSession();
    if (!data || !data.session || error) {
      redirect("/login");
    }
    const userEmail = data.session.user?.email;
    if (!userEmail) {
      throw new Error("User email not found");
    }
    emails[0].email = userEmail;
    const payload = emails.map((email) => {
      return {
        split_with: email.email,
        split_amount: email.value,
        transaction_id: transaction.id as number,
      };
    });
    await createTransactionShared(payload);
  }

  async function onClickDeleteSplitForm(
    transaction: Database["public"]["Functions"]["get_user_transactions"]["Returns"][0],
  ) {
    const { data, error } = await deleteTransactionSharedByTransactionId(
      transaction.t_id,
    );
    if (!data || error) {
      console.error(error);
    }
    console.info("Transaction shared deleted");
  }

  return (
    <div className="p-4">
      <div className="flex justify-center">
        <Card className="mb-2 w-1/2">
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <div>
                <p> Description: {transaction.description} </p>
                <p>
                  {" "}
                  Amount:{" "}
                  {currency(transaction.amount, { symbol: "R$" }).format()}{" "}
                </p>
                <p>
                  {" "}
                  Date: {new Date(
                    transaction.transaction_date,
                  ).toDateString()}{" "}
                </p>
              </div>
              <div className="space-x-2">
                Tags:{" "}
                {transaction.tags.map((tag: { id: string; text: string }) => (
                  <Badge key={tag.id}> {tag.text} </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Form {...userForm}>
        <form onSubmit={userForm.handleSubmit(onSubmit)} className="space-y-2">
          <FormLabel> Choose who you want to share with </FormLabel>
          <div className="flex space-x-2">
            <FormField
              control={userForm.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <Input placeholder="e.g someone@provider.com" {...field} />
                  <FormMessage />
                  <FormDescription>
                    We will split the amount equally between the emails.
                    <span className="italic"> Custom split soon... </span>
                  </FormDescription>
                </FormItem>
              )}
            />
            <Button variant={"secondary"} type="submit">
              {" "}
              Share with...
            </Button>
          </div>
        </form>
      </Form>
      <div className="flex justify-center space-y-2 p-4">
        <div className="max-h-32 overflow-y-scroll pl-2">
          {loading && <Loader2 className="animate-spin w-4 h-4" />}
          {!loading &&
            emails.slice(0).map((email, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-base"> {email.email} </span>
                <ArrowRightIcon />
                <span className="text-sm font-thin">
                  {email.value.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
            ))}
        </div>
      </div>
      <div className="float-right space-x-2">
        <Button
          variant={"destructive"}
          onClick={() => onClickDeleteSplitForm(transaction)}
        >
          Delete
        </Button>
        <Button onClick={() => onSubmitShared(emails)}> Confirm shared </Button>
      </div>
    </div>
  );
}

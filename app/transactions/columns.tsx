"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import Tag from "../components/tag";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { createClient } from "../utils/supabase/client";
import {
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import currency from "currency.js";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createTransactionShared } from "@/server/transactions_shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { deleteTransactionById } from "@/server/transactions";

export const columns: ColumnDef<any>[] = [
  {
    header: "Description",
    accessorKey: "description",
    cell: function ({ row }) {
      const transactions_shared = row.original.transactions_shared;
      console.log(transactions_shared);
      return (
        <div>
          <span> {row.original.description} </span>
          {transactions_shared.length
            ? transactions_shared.map((t: any) => (
                <span className="text-xs" key={t.id}>
                  {" "}
                  {t.users.email}{" "}
                </span>
              ))
            : ""}
        </div>
      );
    },
  },
  {
    header: "Amount",
    accessorKey: "amount",
    cell: ({ row }) => {
      const transaction_shared = row.original.transactions_shared;

      return (
        <span className="text-right">
          {row.original.amount < 0 ? "-" : ""}
          {Math.abs(row.original.amount).toLocaleString("pt-br", {
            style: "currency",
            currency: "BRL",
          })}
          {
            <div className="flex flex-col items-start">
              {transaction_shared.map((t: any) => (
                <span className="text-xs" key={t.id}>
                  {currency(t.split_amount).format()}
                </span>
              ))}{" "}
            </div>
          }
        </span>
      );
    },
  },
  {
    header: "Date",
    accessorKey: "transaction_date",
    cell: ({ row }) => {
      return new Date(row.original.transaction_date).toLocaleDateString();
    },
  },
  {
    header: "Tags",
    accessorKey: "tags",
    cell: ({ row }) => {
      return (
        <div className="space-x-1">
          {row.original.tags?.map((tag: any, index: number) => (
            <Tag key={index} tag={tag} />
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: function Cell({ row }) {
      const transaction = row.original;
      const [open, setOpen] = useState(false);

      async function handleDeleteTransaction() {
        const { data, error } = await deleteTransactionById(row.original.id);
        if (!data || error) {
          console.error(error);
        }
        console.info("Transaction deleted");
      }

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setOpen(!open)}>
                Split With...
              </DropdownMenuItem>
              <DropdownMenuItem>
                {row.original.amount >= 0
                  ? "Change to expense"
                  : "Change to income"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteTransaction()}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <SplitWithDrawerForm
            open={open}
            setOpen={setOpen}
            transaction={transaction}
          />
        </>
      );
    },
  },
];

type SplitWithDrawerProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  transaction: any;
};
function SplitWithDrawerForm({
  open,
  setOpen,
  transaction,
}: SplitWithDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={(value) => setOpen(value)}>
      <DrawerPortal container={document.getElementById("main-layout")}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Split With...</DrawerTitle>
            <DrawerDescription>
              You paid but some friends owe you? Here it is..
            </DrawerDescription>
          </DrawerHeader>
          <SplitWithForm transaction={transaction} />
        </DrawerContent>
      </DrawerPortal>
    </Drawer>
  );
}

function SplitWithForm({ transaction }: any) {
  const [emails, setEmails] = useState<{ email: string; value: number }[]>([
    {
      email: "you",
      value: transaction.amount,
    },
  ]);
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
        created_at: undefined,
        transaction_id: transaction.id,
      };
    });
    await createTransactionShared(payload);
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
          {emails.slice(0).map((email, index) => (
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
      <Button className="float-right" onClick={() => onSubmitShared(emails)}>
        {" "}
        Confirm shared{" "}
      </Button>
    </div>
  );
}

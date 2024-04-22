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
import { Loader, Loader2, MoreHorizontal } from "lucide-react";
import Tag from "../components/tag";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerPortal,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
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
import {
  createTransactionShared,
  deleteTransactionSharedByTransactionId,
  getTransactionsSharedByTransactionId,
} from "@/server/transactions_shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { deleteTransactionById } from "@/server/transactions";
import React from "react";
import { Database } from "@/types/supabase";

export const columns: ColumnDef<any>[] = [
  {
    header: "Description",
    accessorKey: "description",
  },
  {
    header: "Amount",
    accessorKey: "amount",
    cell: ({ row }) => {
      return (
        <span className="text-right">
          {row.original.amount < 0 ? "-" : ""}
          {Math.abs(row.original.amount).toLocaleString("pt-br", {
            style: "currency",
            currency: "BRL",
          })}
        </span>
      );
    },
  },
  {
    header: "Split amount",
    accessorKey: "split_amount",
    cell: ({ row }) => {
      if (!row.original.split_amount) return "-";
      return (
        <span className="text-right">
          {row.original.split_amount < 0 ? "-" : ""}
          {Math.abs(row.original.split_amount).toLocaleString("pt-br", {
            style: "currency",
            currency: "BRL",
          })}
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
      const [open, setOpen] = React.useState(false);
      if (!transaction.belongs_to_me) return;

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
            <DropdownMenuTrigger>
              <MoreHorizontal className="h-4 w-4" />
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
  const mainLayout = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    mainLayout.current = document.getElementById(
      "main-layout",
    ) as HTMLDivElement;
  });

  return (
    <Drawer open={open} onOpenChange={(value) => setOpen(value)}>
      <DrawerPortal container={mainLayout.current}>
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

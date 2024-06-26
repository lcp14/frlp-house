"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { createTag } from "@/server/tags";
import { Badge } from "@/components/ui/badge";
import Tag from "./tag";
import { createTransaction } from "@/server/transactions";
import { Tables } from "@/types/supabase";
import React from "react";

export const transactionSchema = z.object({
  amount: z.coerce.number(),
  description: z.string().min(2, {
    message: "Description must be at least 2 characters long",
  }),
  transaction_date: z.date(),
  tags: z.array(
    z.object({
      id: z.number(),
      text: z.string(),
      created_at: z.string(),
      created_by: z.string().nullable(),
    }),
  ),
});

export function TransactionForm({ tags }: { tags: Tables<"tags">[] }) {
  const [search, setSearch] = React.useState("");

  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      transaction_date: new Date(),
      amount: 0,
      description: "",
      tags: [],
    },
  });

  const onSubmit = async (values: z.infer<typeof transactionSchema>) => {
    await createTransaction(values);
    form.reset();
  };
  const { replace, append } = useFieldArray({
    control: form.control,
    name: "tags",
  });

  const formWatch = form.watch("tags");

  function onSelectTag(
    field: any,
    tag: z.infer<typeof transactionSchema>["tags"][0],
  ): void {
    if (field?.value?.filter((element: any) => tag.id === element.id).length)
      return;
    append(tag);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel> Description </FormLabel>
              <FormControl>
                <Input
                  placeholder="Insert transaction description (e.g Groceries)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center gap-2">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel> Amount </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Insert transaction value (e.g 134.02)"
                    type="number"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="transaction_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transaction date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel> Tags </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <div className="flex w-full flex-row space-x-2">
                      {!formWatch?.length
                        ? "Select tags..."
                        : formWatch.map((tag) => (
                            <Tag
                              tag={tag}
                              key={tag.id}
                              onRemove={() => {
                                replace(
                                  field.value.filter(
                                    (element) => tag.id !== element.id,
                                  ),
                                );
                                return;
                              }}
                            />
                          ))}
                    </div>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="popover-content-width-same-as-its-trigger"
                >
                  <Command>
                    <CommandInput
                      placeholder="Search for tags"
                      onValueChange={setSearch}
                      value={search}
                    />
                    <CommandList>
                      {tags?.map((tag) => (
                        <CommandItem
                          key={tag.id}
                          title={tag.text}
                          onSelect={() => onSelectTag(field, tag)}
                        >
                          {tag.text}
                        </CommandItem>
                      ))}
                      {search && (
                        <CommandItem
                          key={"search"}
                          onSelect={async (item) => {
                            const { data, error } = await createTag({
                              text: item,
                            });
                            if (error) {
                              console.error(error);
                              return;
                            }

                            onSelectTag(field, {
                              id: data[0]?.id,
                              text: item,
                              created_at: "",
                              created_by: null,
                            });
                          }}
                          value={search}
                        >
                          <Button className="space-x-2" variant={"ghost"}>
                            <span>Add tag </span>
                            <Badge>{search}</Badge>
                          </Button>
                        </CommandItem>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit">Add transaction</Button>
        </div>
      </form>
    </Form>
  );
}

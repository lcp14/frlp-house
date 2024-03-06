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
import { CalendarIcon, RotateCwIcon, XIcon } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { createClient } from "../utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { createTag, getTagsByLoggedUser } from "@/server/tags";
import React from "react";
import { CommandLoading } from "cmdk";
import { useToast } from "@/components/ui/use-toast";
import { Tables } from "@/types/supabase";
import { Badge } from "@/components/ui/badge";
import Tag from "./tag";

export function TransactionForm({ refetch }: { refetch: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["tags"],
    queryFn: () => getTagsByLoggedUser(),
  });

  const tags = data?.data ?? [];
  const [search, setSearch] = React.useState("");
  const { toast } = useToast();

  const transactionSchema = z.object({
    amount: z.coerce.number(),
    description: z.string().min(2, {
      message: "Description must be at least 2 characters long",
    }),
    transaction_date: z.date(),
    tags: z.array(
      z.object({
        id: z.number().nullable(),
        text: z.string(),
        created_at: z.string().nullable(),
        created_by: z.string().nullable(),
      }),
    ),
  });
  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      transaction_date: new Date(),
    },
  });

  const errors = form.formState.errors;

  const onSubmit = async (values: z.infer<typeof transactionSchema>) => {
    const { amount, description, transaction_date, tags } = values;

    const payload = {
      amount,
      transaction_date: transaction_date.toISOString(),
      description,
    };

    const supabase = createClient();
    const { data, error } = await supabase
      .from("transactions")
      .insert(payload)
      .select();

    if (error) {
      toast({
        title: "Transaction error",
        description: "Transaction was not addded",
        variant: "destructive",
      });
    }

    if (data?.length) {
      const tagPayload = tags.map((tag) => ({
        transaction_id: data[0].id,
        tag_id: tag.id as number,
      }));
      const { error } = await supabase
        .from("transactions_tags")
        .insert(tagPayload);
      if (error) {
        toast({
          title: "Tags was not added",
          description: "Tags was not succesfully added",
        });
        return;
      }
    }
    void refetch();
    toast({
      title: "Transaction created",
      description: "Transaction has been created successfully",
    });
  };
  const { replace, append } = useFieldArray({
    control: form.control,
    name: "tags",
  });

  const formWatch = form.watch("tags");

  function onSelectTag(field: any, tag: Tables<"tags">): void {
    if (field?.value?.filter((element: any) => tag.id === element.id).length)
      return;
    append(tag);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
        ></FormField>
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
        ></FormField>
        <FormField
          control={form.control}
          name="transaction_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Transaction date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
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
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel> Tags </FormLabel>
              {JSON.stringify(errors) ?? ""}
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
                      {isLoading && (
                        <CommandLoading className="h-50 flex items-center justify-center p-4 align-middle">
                          <RotateCwIcon size={12} className="animate-spin" />{" "}
                        </CommandLoading>
                      )}
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

                            onSelectTag(field, { id: data[0]?.id, text: item });
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
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

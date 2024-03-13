"use client";
import { Drawer, DrawerContent, DrawerHeader } from "@/components/ui/drawer";
import { useState } from "react";

export default function DrawerForm() {
  const [open, setOpen] = useState(false);

  console.log(route);

  return (
    <Drawer open={open}>
      <DrawerHeader>oi</DrawerHeader>
      <DrawerContent>oi</DrawerContent>
    </Drawer>
  );
}

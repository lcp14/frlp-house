import {
  Drawer,
  DrawerPortal,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { SplitWithForm } from "./split-with-form";
import React from "react";

type SplitWithDrawerProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  transaction: any;
};

export function SplitWithDrawerForm({
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

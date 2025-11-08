import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Bell, BellDot } from "lucide-react";
import React from "react";

interface SideBarSheetProps {
  isNotification: boolean;
}

export default function SideBarSheet({ isNotification }: SideBarSheetProps) {
  return (
    <Sheet>
      <SheetTrigger>{isNotification ? <BellDot /> : <Bell />}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Are you absolutely sure?</SheetTitle>
          <SheetDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}

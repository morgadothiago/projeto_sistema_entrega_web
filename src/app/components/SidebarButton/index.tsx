"use client";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";

type ButtonProps = {
  className: string;
};

export function SidebarButton({ className }: ButtonProps) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button variant="link" onClick={toggleSidebar} className={className}>
      <Menu color="#0049A5" size={100} />
    </Button>
  );
}

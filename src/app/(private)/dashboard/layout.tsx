import Header from "@/app/components/Header";
import React, { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className=" w-full ">
      <Header />

      {children}
    </div>
  );
}

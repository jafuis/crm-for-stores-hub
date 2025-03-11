
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex w-full bg-gray-50 dark:bg-gray-900">
      <AppSidebar />
      <main className="flex-1 p-4 md:p-6 overflow-auto pt-20 w-full">
        <div className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700 z-40" />
        {children}
      </main>
    </div>
  );
}

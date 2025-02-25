
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useToast } from "@/hooks/use-toast";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 p-4 md:p-6 overflow-auto pt-20 w-full">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

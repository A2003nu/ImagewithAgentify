import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "./_components/AppSidebar";
import AppHeader from "./_components/AppHeader";

export default function DashboardLayout({ children }: any) {
  return (
    <SidebarProvider>
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <AppHeader />
          <main className="flex-1 p-4">
            {children}
          </main>
        </div>
      
    </SidebarProvider>
  );
}
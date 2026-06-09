/**
 * BNKhub — Layout commun (Header + Sidebar (desktop) + BottomNav (mobile) + <main>).
 */
import { ReactNode } from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { InstallModal } from "@/components/pwa/InstallModal";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";

const LayoutContent = ({ children }: { children: ReactNode }) => {
  const { isCollapsed, isHovered } = useSidebar();
  const isSidebarExpanded = !isCollapsed || isHovered;
  
  // Calculate padding: when collapsed, it's pl-20, expanded is pl-64 lg:pl-72
  const mainPadding = isSidebarExpanded 
    ? 'md:pb-8 md:pl-64 lg:pl-72' 
    : 'md:pb-8 md:pl-20';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />
        <main className={`flex-1 pb-24 ${mainPadding}`}>{children}</main>
        <BottomNav />
      </div>
      <InstallModal />
    </div>
  );
};

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
};

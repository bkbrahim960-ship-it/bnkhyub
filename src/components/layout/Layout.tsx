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
  
  // Calculate padding: when collapsed, it's pr-20, expanded is pr-64 lg:pr-72
  const mainPadding = isSidebarExpanded 
    ? 'md:pb-8 md:pr-64 lg:pr-72' 
    : 'md:pb-8 md:pr-20';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface-primary">
      <div className="flex-1 flex flex-col">
        <Header />
        <main className={`flex-1 pb-24 ${mainPadding}`}>{children}</main>
        <BottomNav />
      </div>
      <Sidebar />
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

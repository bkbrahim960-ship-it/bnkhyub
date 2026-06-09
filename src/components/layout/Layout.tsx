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
  const mainPadding = "md:pb-8";
  const { isCollapsed } = useSidebar();
  
  // Sidebar width: 72px when collapsed, 240px when expanded
  const sidebarWidth = isCollapsed ? 72 : 240;

  return (
    <div className="min-h-screen bg-surface-primary">
      <Sidebar />
      {/* Main content with smooth transition */}
      <div 
        className="hidden md:flex md:flex-col min-h-screen transition-all duration-300 ease-out"
        style={{
          marginLeft: `${sidebarWidth}px`
        }}
      >
        <Header />
        <main className={`flex-1 pb-24 ${mainPadding}`}>{children}</main>
        <BottomNav />
      </div>
      {/* Mobile layout - no sidebar offset */}
      <div className="md:hidden flex flex-col min-h-screen">
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

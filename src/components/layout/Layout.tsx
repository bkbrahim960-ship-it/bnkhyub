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
    <>
      <Sidebar />
      {/* Desktop Layout - with sidebar offset using padding */}
      <div 
        className="hidden md:flex md:flex-col min-h-screen bg-surface-primary transition-all duration-300 ease-out"
        style={{
          paddingLeft: `${sidebarWidth}px`
        }}
      >
        <Header />
        <main className={`flex-1 pb-24 ${mainPadding}`}>{children}</main>
        <BottomNav />
      </div>
      
      {/* Mobile Layout - no sidebar */}
      <div className="md:hidden flex flex-col min-h-screen bg-surface-primary">
        <Header />
        <main className={`flex-1 pb-24 ${mainPadding}`}>{children}</main>
        <BottomNav />
      </div>
      <InstallModal />
    </>
  );
};

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
};

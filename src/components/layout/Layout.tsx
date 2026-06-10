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
  const { isCollapsed, isHovered } = useSidebar();
  
  return (
    <>
      <Sidebar />
      {/* Desktop Layout - with sidebar offset using CSS variable */}
      <div 
        className="hidden md:flex md:flex-col min-h-screen bg-surface-primary transition-all duration-300 ease-out"
        style={{
          paddingLeft: "var(--sidebar-w, 72px)"
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

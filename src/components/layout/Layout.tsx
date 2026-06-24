/**
 * BNKhub — Layout commun (Header + Sidebar (desktop) + BottomNav (mobile) + <main>).
 */
import { ReactNode } from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { InstallModal } from "@/components/pwa/InstallModal";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";

const Footer = () => (
  <footer className="w-full py-6 text-center text-white/50 text-xs sm:text-sm mt-auto border-t border-white/5">
    تم تصميم وتطوير التطبيق من قبل{" "}
    <a 
      href="https://instagram.com/brahim____bnk" 
      target="_blank" 
      rel="noopener noreferrer" 
      className="text-accent font-bold hover:underline"
    >
      brahim____bnk
    </a>
  </footer>
);

const LayoutContent = ({ children }: { children: ReactNode }) => {
  const mainPadding = "md:pb-8";
  const { isCollapsed, isHovered } = useSidebar();
  
  const isExpanded = !isCollapsed || isHovered;
  const sidebarWidth = isExpanded ? 240 : 72;

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
        <main className={`flex-1 flex flex-col pb-24 ${mainPadding}`}>
          {children}
          <Footer />
        </main>
        <BottomNav />
      </div>
      
      {/* Mobile Layout - no sidebar */}
      <div className="md:hidden flex flex-col min-h-screen bg-surface-primary">
        <Header />
        <main className={`flex-1 flex flex-col pb-24 ${mainPadding}`}>
          {children}
          <Footer />
        </main>
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

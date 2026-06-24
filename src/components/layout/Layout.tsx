import { ReactNode } from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { InstallModal } from "@/components/pwa/InstallModal";

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Sidebar />
      <div className="flex flex-col min-h-screen bg-surface-primary transition-all duration-300 ease-out md:pl-[76px]">
        <Header />
        <main className="flex-1 pb-24 md:pb-8">{children}</main>
        <BottomNav />
      </div>
      <InstallModal />
    </>
  );
};

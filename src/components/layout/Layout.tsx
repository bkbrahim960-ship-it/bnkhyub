/**
 * BNKhub — Layout commun (Header + Sidebar (desktop) + BottomNav (mobile) + <main>).
 */
import { ReactNode } from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { InstallModal } from "@/components/pwa/InstallModal";

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface-primary">
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 pb-24 md:pb-8 md:pr-64 lg:pr-72">{children}</main>
        <BottomNav />
      </div>
      <Sidebar />
      <InstallModal />
    </div>
  );
};

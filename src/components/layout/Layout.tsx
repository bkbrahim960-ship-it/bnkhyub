/**
 * BNKhub — Layout commun (Header + <main> + Footer).
 */
import { ReactNode } from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { InstallModal } from "@/components/pwa/InstallModal";

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col bg-surface-primary">
      <Header />
      <main className="flex-1 pb-24 md:pb-32">{children}</main>
      <BottomNav />
      <InstallModal />
    </div>
  );
};

import { ReactNode, useEffect, useState } from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { InstallModal } from "@/components/pwa/InstallModal";

const LayoutContent = ({ children }: { children: ReactNode }) => {
  const mainPadding = "md:pb-8";
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <>
      <Sidebar />
      <div
        className="flex flex-col min-h-screen bg-surface-primary transition-all duration-300 ease-out"
        style={{ paddingLeft: isDesktop ? "68px" : "0px" }}
      >
        <Header />
        <main className={`flex-1 pb-24 ${mainPadding}`}>{children}</main>
        <BottomNav />
      </div>
      <InstallModal />
    </>
  );
};

export const Layout = ({ children }: { children: ReactNode }) => {
  return <LayoutContent>{children}</LayoutContent>;
};

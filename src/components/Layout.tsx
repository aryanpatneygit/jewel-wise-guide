import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { DashboardCustomizationProvider } from "@/contexts/DashboardCustomizationContext";

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isCustomizeMode, setIsCustomizeMode] = useState(false);

  const toggleCustomizeMode = () => {
    setIsCustomizeMode(!isCustomizeMode);
  };

  return (
    <DashboardCustomizationProvider
      value={{
        isCustomizeMode,
        toggleCustomizeMode,
      }}
    >
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header 
            onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
            sidebarOpen={sidebarOpen}
          />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </DashboardCustomizationProvider>
  );
};

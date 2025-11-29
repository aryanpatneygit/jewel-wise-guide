import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  TrendingUp, 
  Search, 
  BarChart3,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/inventory", icon: Package, label: "Inventory" },
  { to: "/market", icon: TrendingUp, label: "Market Overview" },
  { to: "/keywords", icon: Search, label: "Keyword Intelligence" },
  { to: "/analytics", icon: BarChart3, label: "Custom Analytics" },
];

export const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 overflow-hidden",
        isOpen ? "w-64" : "w-0"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-4 border-b border-sidebar-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0 overflow-hidden">
          <img src="/logo.png" alt="Karat.AI Logo" className="h-full w-full object-contain" />
        </div>
        {isOpen && (
          <>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-semibold text-sidebar-foreground">Karat.AI</h1>
              <p className="text-xs text-muted-foreground">Business Intelligence</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8 shrink-0 border-sidebar-border hover:bg-sidebar-accent hover:border-sidebar-accent-foreground"
              aria-label="Hide sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {isOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {isOpen && (
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="text-xs font-semibold">RS</span>
            </div>
            <div className="flex-1 text-xs">
              <p className="font-medium text-sidebar-foreground">Raj Store</p>
              <p className="text-muted-foreground">Mumbai</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

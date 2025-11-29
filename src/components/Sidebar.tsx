import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  TrendingUp, 
  Search, 
  Sparkles,
  Calculator
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/inventory", icon: Package, label: "Inventory" },
  { to: "/market", icon: TrendingUp, label: "Market Overview" },
  { to: "/predictions", icon: Calculator, label: "Sales Predictor" },
  { to: "/keywords", icon: Search, label: "Keyword Intelligence" },
];

export const Sidebar = ({ isOpen }: SidebarProps) => {
  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
        isOpen ? "w-64" : "w-0 md:w-16"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-4 border-b border-sidebar-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        {isOpen && (
          <div>
            <h1 className="text-sm font-semibold text-sidebar-foreground">JewelAI</h1>
            <p className="text-xs text-muted-foreground">Business Intelligence</p>
          </div>
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

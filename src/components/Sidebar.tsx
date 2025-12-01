import { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  TrendingUp, 
  Search, 
  Calculator,
  Sparkles,
  ChevronLeft,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { 
    to: "/inventory", 
    icon: Package, 
    label: "Inventory",
    subItems: [
      { to: "/inventory/bracelets", label: "Bracelets" },
      { to: "/inventory/rings", label: "Rings", disabled: true },
      { to: "/inventory/necklaces", label: "Necklaces", disabled: true },
    ]
  },
  { to: "/market", icon: TrendingUp, label: "Market Overview" },
  { to: "/keywords", icon: Search, label: "Keyword Intelligence" },
  { to: "/predictions", icon: Calculator, label: "Sales Predictions" },
];

export const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const [expandedItems, setExpandedItems] = useState<string[]>(["/inventory"]);
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
        {navItems.map((item) => {
          const hasSubItems = 'subItems' in item && item.subItems;
          const isExpanded = expandedItems.includes(item.to);

          return (
            <div key={item.to}>
              {hasSubItems ? (
                <div>
                  <button
                    onClick={() => {
                      setExpandedItems((prev) =>
                        prev.includes(item.to)
                          ? prev.filter((i) => i !== item.to)
                          : [...prev, item.to]
                      );
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {isOpen && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 shrink-0" />
                        )}
                      </>
                    )}
                  </button>
                  {isExpanded && isOpen && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.subItems.map((subItem) => (
                        <NavLink
                          key={subItem.to}
                          to={subItem.to}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                              subItem.disabled
                                ? "text-muted-foreground cursor-not-allowed opacity-50"
                                : cn(
                                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                    isActive
                                      ? "bg-sidebar-accent text-sidebar-primary font-medium"
                                      : "text-sidebar-foreground"
                                  )
                            )
                          }
                          onClick={(e) => {
                            if (subItem.disabled) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <span>{subItem.label}</span>
                          {subItem.disabled && (
                            <span className="text-xs">(Coming Soon)</span>
                          )}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
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
              )}
            </div>
          );
        })}
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

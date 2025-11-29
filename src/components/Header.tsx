import { Menu, Bell, Calendar, Settings2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDashboardCustomization } from "@/contexts/DashboardCustomizationContext";

interface HeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

export const Header = ({ onMenuClick, sidebarOpen }: HeaderProps) => {
  const location = useLocation();
  const { isCustomizeMode, toggleCustomizeMode } = useDashboardCustomization();
  const isDashboard = location.pathname === "/";

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className={sidebarOpen ? "md:hidden" : ""}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select defaultValue="30">
            <SelectTrigger className="w-[140px] border-none bg-transparent text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isDashboard && (
          <Button 
            variant={isCustomizeMode ? "default" : "ghost"} 
            size="sm"
            onClick={toggleCustomizeMode}
            className="gap-2"
          >
            <Settings2 className="h-4 w-4" />
            Customise
          </Button>
        )}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
        </Button>
      </div>
    </header>
  );
};

import { createContext, useContext, ReactNode } from "react";

interface DashboardCustomizationContextType {
  isCustomizeMode: boolean;
  toggleCustomizeMode: () => void;
}

const DashboardCustomizationContext = createContext<DashboardCustomizationContextType | undefined>(undefined);

export const useDashboardCustomization = () => {
  const context = useContext(DashboardCustomizationContext);
  if (!context) {
    return { isCustomizeMode: false, toggleCustomizeMode: () => {} };
  }
  return context;
};

interface DashboardCustomizationProviderProps {
  children: ReactNode;
  value: DashboardCustomizationContextType;
}

export const DashboardCustomizationProvider = ({ children, value }: DashboardCustomizationProviderProps) => {
  return (
    <DashboardCustomizationContext.Provider value={value}>
      {children}
    </DashboardCustomizationContext.Provider>
  );
};


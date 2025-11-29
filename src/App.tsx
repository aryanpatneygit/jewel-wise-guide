import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FilterProvider } from "./contexts/FilterContext";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Market from "./pages/Market";
import Keywords from "./pages/Keywords";
<<<<<<< HEAD
import Predictions from "./pages/Predictions";
=======
import Analytics from "./pages/Analytics";
>>>>>>> parent of 2819360 (feat: Integrate ML models with JewelAI frontend (Phases 1-4))
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
<<<<<<< HEAD
      <FilterProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/market" element={<Market />} />
              <Route path="/keywords" element={<Keywords />} />
              <Route path="/predictions" element={<Predictions />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </FilterProvider>
=======
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/market" element={<Market />} />
            <Route path="/keywords" element={<Keywords />} />
            <Route path="/analytics" element={<Analytics />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
>>>>>>> parent of 2819360 (feat: Integrate ML models with JewelAI frontend (Phases 1-4))
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

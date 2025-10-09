import { Toaster } from "@/components/ui/sonner";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";
import Landing from "./pages/Landing.tsx";
import SimpleDashboard from "./pages/SimpleDashboard.tsx";
import NotFound from "./pages/NotFound.tsx";
import { RefreshHandler } from "./components/RefreshHandler.tsx";
import "./types/global.d.ts";

// Initialize clean session on app start
const initializeApp = () => {
  // Clear any stale session data on fresh app load
  const isNewTabOrWindow = !sessionStorage.getItem('agrismart_sessionActive');
  
  if (isNewTabOrWindow) {
    // Clear any refresh flags from previous sessions
    sessionStorage.removeItem('agrismart_pageRefreshed');
    sessionStorage.removeItem('agrismart_lastPage');
  }
};

// Initialize app
initializeApp();

// Simple temporary main without Convex authentication
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename="/crop_prediction">
      <RefreshHandler />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<SimpleDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
    <Toaster />
  </StrictMode>,
);
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/react";
import App from "./App";
import AppErrorBoundary from "./components/AppErrorBoundary";
import { queryClient } from "./config/queryClient";
import "./index.css";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppErrorBoundary>
      <BrowserRouter>
        <ClerkProvider publishableKey={clerkPublishableKey}>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </ClerkProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  </StrictMode>,
);

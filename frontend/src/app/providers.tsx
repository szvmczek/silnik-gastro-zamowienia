import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import type { PropsWithChildren } from "react";
import { ThemeBootstrap } from "@/app/ThemeBootstrap";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeBootstrap />
        {children}
        <Toaster position="top-right" />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

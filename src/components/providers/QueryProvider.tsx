"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode, useState } from "react";

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV === "development" ? (
        <ReactQueryDevtools buttonPosition="bottom-right" position="bottom" />
      ) : null}
    </QueryClientProvider>
  );
}

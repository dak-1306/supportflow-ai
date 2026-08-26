import React from "react";
import ReactDOM from "react-dom/client";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { Toaster } from "@supportflow/ui/src/components/ui/sonner";
import { toast } from "sonner";
import App from "./app/App";
import "./index.css";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any) => {
      if (error?.status === 500) {
        toast.error("Lỗi hệ thống (500). Vui lòng thử lại sau!");
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      if (error?.status === 500) {
        toast.error("Thao tác thất bại do lỗi máy chủ (500).");
      }
    },
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (_failureCount, error: any) => {
        if (error?.status === 500) return false;
        return _failureCount < 1;
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster />
    </QueryClientProvider>
  </React.StrictMode>,
);

import React from "react";
import ReactDOM from "react-dom/client";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { Toaster } from "@supportflow/ui/src/components/ui/sonner.tsx";
import App from "./app/App.tsx";
import "./index.css";
import { toast } from "sonner";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any) => {
      if (error?.response?.status === 500) {
        toast.error("Lỗi hệ thống (500). Vui lòng thử lại sau!");
        // Hoặc điều hướng nếu muốn: window.location.href = "/500";
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      if (error?.response?.status === 500) {
        toast.error("Thao tác thất bại do lỗi máy chủ (500).");
      }
    },
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Không retry nếu server trả về lỗi 500
        if (error?.response?.status === 500) return false;
        return failureCount < 1;
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

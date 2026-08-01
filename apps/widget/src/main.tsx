import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import CSS dạng string để đưa vào Shadow DOM
import cssText from "./index.css?inline";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const WIDGET_CONTAINER_ID = "supportflow-widget-container";

const mountWidget = () => {
  // Tránh mount trùng lặp nếu script bị load nhiều lần
  if (document.getElementById(WIDGET_CONTAINER_ID)) {
    return;
  }

  // 1. Tạo Host Element
  const hostElement = document.createElement("div");
  hostElement.id = WIDGET_CONTAINER_ID;
  document.body.appendChild(hostElement);

  // 2. Tạo Shadow DOM
  const shadowRoot = hostElement.attachShadow({ mode: "open" });

  // 3. Inject CSS vào bên trong Shadow DOM
  const styleTag = document.createElement("style");
  styleTag.textContent = cssText;
  shadowRoot.appendChild(styleTag);

  // 4. Tạo React Root Container bên trong Shadow DOM
  const reactRootDiv = document.createElement("div");
  reactRootDiv.id = "supportflow-app-root";
  shadowRoot.appendChild(reactRootDiv);

  // 5. Mount App (Không cần truyền workspaceId vì API Client đã tự đọc từ window.SupportFlowConfig)
  ReactDOM.createRoot(reactRootDiv).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </React.StrictMode>,
  );
};

// Đảm bảo DOM đã sẵn sàng
if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  mountWidget();
} else {
  document.addEventListener("DOMContentLoaded", mountWidget);
}

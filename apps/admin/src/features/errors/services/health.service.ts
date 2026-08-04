// src/features/errors/services/health.service.ts

// Lấy trực tiếp VITE_API_URL (đã có sẵn /api/v1)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export interface HealthResponse {
  status: string;
  uptime: number;
  timestamp: string;
}

export async function checkServerHealth(): Promise<{
  isAlive: boolean;
  data?: HealthResponse;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // Timeout sau 8s

    // Gọi trực tiếp ${API_URL}/health -> https://supportflow-ai-yz1j.onrender.com/api/v1/health
    const response = await fetch(`${API_URL}/health`, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "Cache-Control": "no-cache",
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data: HealthResponse = await response.json();
      return { isAlive: data.status === "OK", data };
    }

    return { isAlive: false };
  } catch (error) {
    console.error("❌ Health check failed:", error);
    return { isAlive: false };
  }
}

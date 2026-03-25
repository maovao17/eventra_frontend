export const API_URL = "http://localhost:3002";

type ApiError = {
  error: true;
  message: string;
  status?: number;
};

const buildError = (message: string, status?: number): ApiError => ({
  error: true,
  message,
  status,
});

export async function apiFetch(
  endpoint: string,
  options?: RequestInit
) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  try {
    const isFormData = typeof FormData !== "undefined" && options?.body instanceof FormData;
    const headers: Record<string, string> = {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options?.headers as Record<string, string> | undefined),
    };

    if (!isFormData && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 204) {
      return null;
    }

    const text = await res.text();
    let parsed: any = null;

    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        if (!res.ok) {
          return buildError("Invalid JSON response from server", res.status);
        }
        return text;
      }
    }

    if (!res.ok) {
      const errorMessage =
        parsed?.message ||
        parsed?.error ||
        `HTTP ${res.status}`;

      return buildError(String(errorMessage), res.status);
    }

    return parsed;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    return buildError(message);
  }
}

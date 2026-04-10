const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";
const API_PREFIX = "/api";

type ApiError = {
  message: string;
  status?: number;
  data?: unknown;
};

export class ApiFetchError extends Error {
  status?: number;
  data?: unknown;

  constructor({ message, status, data }: ApiError) {
    super(message);
    this.name = "ApiFetchError";
    this.status = status;
    this.data = data;
  }
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("firebaseToken")
      : null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(`${BASE_URL}${API_PREFIX}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      let parsed = null;
      try {
        parsed = JSON.parse(text);
      } catch {}

      throw new ApiFetchError({
        message:
          parsed?.message ||
          parsed?.error ||
          `API error: ${res.status}`,
        status: res.status,
        data: parsed,
      });
    }

    const text = await res.text();
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new ApiFetchError({
        message: "Request timeout",
      });
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
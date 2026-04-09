import { auth, } from "@/lib/firebase";
import { getAuth } from "firebase/auth";

// force rebuild 

export const API_URL =
  (process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:3002") + "/api";
type ApiError = {
  message: string
  status?: number
  data?: unknown
};

export class ApiFetchError extends Error {
  status?: number
  data?: unknown

  constructor({ message, status, data }: ApiError) {
    super(message)
    this.name = "ApiFetchError"
    this.status = status
    this.data = data
  }
}

const resolveAuthToken = async (endpoint: string) => {
  if (typeof window === "undefined") return null;

  const authInstance = getAuth();
  const user = authInstance.currentUser;

  if (!user) {
    console.warn(`⚠️ No Firebase user for API call`);
    return null;
  }

  try {
    const token = await user.getIdToken(true);
    console.log(`📡 API [${endpoint}] token len: ${token?.length || 0}`);
    return token;
  } catch (err) {
    console.error("Token error:", err);
    return null;
  }
};


export async function apiFetch(
  endpoint: string,
  options?: RequestInit
) {
  const token = await resolveAuthToken(endpoint);


  try {
    const isFormData = typeof FormData !== "undefined" && options?.body instanceof FormData;
    const headers: Record<string, string> = {
      ...((options?.headers as Record<string, string> | undefined) ?? {}),
    };

    if (!isFormData && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 204) {
      return null;
    }

    const text = await res.text();
    let parsed: unknown = null;

    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        if (!res.ok) {
          throw new ApiFetchError({
            message: "Invalid JSON response from server",
            status: res.status,
          })
        }
        return text;
      }
    }

    if (!res.ok) {
      const errorMessage =
        (parsed as any)?.message ||
        (parsed as any)?.error ||
        `HTTP ${res.status}`;

      throw new ApiFetchError({
        message: String(errorMessage),
        status: res.status,
        data: parsed,
      })
    }

    return parsed;
  } catch (error) {
    if (error instanceof ApiFetchError) {
      throw error
    }

    const message = error instanceof Error ? error.message : "Network error";
    throw new ApiFetchError({ message });
  }
}

export type AppRole = "admin" | "customer" | "vendor"

export function getDashboardPathForRole(role?: string | null) {
  switch (role) {
    case "admin":
      return "/admin/dashboard"
    case "vendor":
      return "/vendor/dashboard"
    case "customer":
    default:
      return "/customer/dashboard"
  }
}

import type { UserProfileResponse } from "@/types";

export function isUserAdmin(user: UserProfileResponse | null | undefined): boolean {
  if (!user) return false;
  if (user.is_admin === true) return true;
  if (user.role === "ADMIN") return true;
  if (user.roles?.some((r) => r === "ADMIN" || r === "ROLE_ADMIN")) return true;
  return false;
}

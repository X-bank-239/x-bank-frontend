import type { UserProfileResponse } from "@/types";

export function isUserAdmin(user: UserProfileResponse | null | undefined): boolean {
  if (!user) return false;
  return user.role === "ADMIN";
}

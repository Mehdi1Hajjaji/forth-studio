import { getAuthSession, getCurrentUser } from "@/lib/auth";

export function getSession() {
  return getAuthSession();
}

export function getUserFromSession() {
  return getCurrentUser();
}

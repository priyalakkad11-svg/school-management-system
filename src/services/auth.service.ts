import { DEMO_USERS, ROLE_COOKIE_NAME, ROLE_HOME } from "@/lib/auth";
import type { SessionUser, UserRole } from "@/types/domain";

export const AuthService = {
  signIn(role: UserRole): { user: SessionUser; redirectTo: string } {
    if (typeof document !== "undefined") {
      document.cookie = `${ROLE_COOKIE_NAME}=${role}; path=/; max-age=86400; SameSite=Lax`;
    }
    return {
      user: DEMO_USERS[role],
      redirectTo: ROLE_HOME[role],
    };
  },

  signOut(): void {
    if (typeof document !== "undefined") {
      document.cookie = `${ROLE_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
    }
  },

  getCurrentClientUser(): SessionUser {
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|; )educore_role=([^;]+)/);
      const role = match?.[1] as UserRole | undefined;
      if (role && role in DEMO_USERS) {
        return DEMO_USERS[role];
      }
    }
    return DEMO_USERS.admin;
  },
};


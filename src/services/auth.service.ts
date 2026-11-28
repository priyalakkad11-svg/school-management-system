import { DEMO_USERS, ROLE_HOME } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import {
  signInAction,
  signOutAction,
  sendRecoveryOtpAction,
  verifyOtpAction,
  resetPasswordAction,
  setupPasswordAction,
  updateAccountAction,
} from "@/app/actions/auth.actions";
import type { SessionUser, UserRole } from "@/types/domain";

let cachedUser: SessionUser | null = null;
let listenerInitialized = false;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

async function hydrateCurrentUser() {
  if (typeof window === "undefined") return;
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      cachedUser = null;
      notifyListeners();
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, user_code, full_name, email, role, subtitle, initials")
      .eq("id", user.id)
      .is("deleted_at", null)
      .maybeSingle();

    if (profile) {
      cachedUser = {
        id: profile.user_code ?? profile.id,
        name: profile.full_name,
        email: profile.email,
        role: profile.role as UserRole,
        initials: profile.initials,
        subtitle: profile.subtitle || profile.role,
      };
      notifyListeners();
    }
  } catch {
    // Keep last known snapshot on transient network failures
  }
}

export const AuthService = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    if (typeof window !== "undefined" && !listenerInitialized) {
      listenerInitialized = true;
      const supabase = createClient();
      supabase.auth.onAuthStateChange(() => {
        void hydrateCurrentUser();
      });
      void hydrateCurrentUser();
    }
    return () => {
      listeners.delete(listener);
    };
  },

  async signInWithCredentials(params: {
    role: UserRole;
    schoolCode?: string;
    identifier: string;
    password: string;
    rememberDevice?: boolean;
  }): Promise<{ ok: boolean; user?: SessionUser; redirectTo?: string; error?: string }> {
    const res = await signInAction({
      role: params.role,
      schoolCode: params.schoolCode,
      identifier: params.identifier,
      password: params.password,
      rememberDevice: params.rememberDevice ?? true,
    });
    if (!res.ok || !res.data) {
      return { ok: false, error: res.error ?? "Sign in failed." };
    }
    cachedUser = res.data.user;
    notifyListeners();
    return {
      ok: true,
      user: res.data.user,
      redirectTo: res.data.redirectTo,
    };
  },

  signIn(role: import("@/types/domain").PortalLoginRole): { user: SessionUser; redirectTo: string } {
    return {
      user: DEMO_USERS[role],
      redirectTo: ROLE_HOME[role],
    };
  },

  async signOut(): Promise<void> {
    cachedUser = null;
    notifyListeners();
    if (typeof window !== "undefined") {
      const supabase = createClient();
      await supabase.auth.signOut({ scope: "local" });
    }
    await signOutAction();
  },

  getCurrentClientUser(): SessionUser {
    return cachedUser ?? DEMO_USERS.admin;
  },

  async refreshClientUser(): Promise<SessionUser | null> {
    await hydrateCurrentUser();
    return cachedUser;
  },

  sendRecoveryOtp: sendRecoveryOtpAction,
  verifyOtp: verifyOtpAction,
  resetPassword: resetPasswordAction,
  setupPassword: setupPasswordAction,
  updateAccount: updateAccountAction,
};

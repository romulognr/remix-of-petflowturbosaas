import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isSuperAdmin: boolean;
  signOut: () => Promise<void>;
  refreshRoles: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  session: null,
  loading: true,
  isSuperAdmin: false,
  signOut: async () => {},
  refreshRoles: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const computeRoles = async (s: Session | null) => {
    if (!s?.user) {
      setIsSuperAdmin(false);
      return;
    }
    // Try to claim super admin if list is empty (first user ever)
    try {
      await supabase.rpc("claim_super_admin_if_empty");
    } catch {}
    // Check via app_config.super_admin_emails OR user_roles
    const { data: cfg } = await supabase.from("app_config").select("super_admin_emails").maybeSingle();
    const emails = (cfg?.super_admin_emails ?? []).map((e: string) => e.toLowerCase());
    const email = (s.user.email ?? "").toLowerCase();
    if (emails.includes(email)) {
      setIsSuperAdmin(true);
      return;
    }
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", s.user.id);
    setIsSuperAdmin(!!roles?.some((r) => r.role === "super_admin"));
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setLoading(false);
      // defer to avoid deadlock
      setTimeout(() => { computeRoles(s); }, 0);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
      computeRoles(data.session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <Ctx.Provider
      value={{
        user: session?.user ?? null,
        session,
        loading,
        isSuperAdmin,
        signOut: async () => {
          await supabase.auth.signOut();
        },
        refreshRoles: () => computeRoles(session),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);

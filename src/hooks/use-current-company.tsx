import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

export function useCurrentCompany() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["current-company", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Find first company via company_user, then via created_by
      const { data: cu } = await supabase
        .from("company_user")
        .select("company_id, role")
        .eq("user_id", user!.id)
        .eq("ativo", true)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      let companyId = cu?.company_id;
      let role = cu?.role;

      if (!companyId) {
        const { data: owned } = await supabase
          .from("company")
          .select("id")
          .eq("created_by", user!.id)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();
        companyId = owned?.id;
        role = "owner" as any;
      }

      if (!companyId) return null;

      const { data: company } = await supabase
        .from("company")
        .select("*")
        .eq("id", companyId)
        .maybeSingle();

      return company ? { ...company, role } : null;
    },
  });
}

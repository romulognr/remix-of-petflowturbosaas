export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      app_config: {
        Row: {
          app_name: string
          created_at: string
          id: string
          super_admin_emails: string[]
          system_settings: Json
          updated_at: string
        }
        Insert: {
          app_name?: string
          created_at?: string
          id?: string
          super_admin_emails?: string[]
          system_settings?: Json
          updated_at?: string
        }
        Update: {
          app_name?: string
          created_at?: string
          id?: string
          super_admin_emails?: string[]
          system_settings?: Json
          updated_at?: string
        }
        Relationships: []
      }
      appointment: {
        Row: {
          company_id: string
          completed_at: string | null
          created_at: string
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          notes: string | null
          price: number | null
          professional_id: string
          professional_name: string | null
          scheduled_at: string
          service_id: string
          service_name: string | null
          source: Database["public"]["Enums"]["appointment_source"]
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          notes?: string | null
          price?: number | null
          professional_id: string
          professional_name?: string | null
          scheduled_at: string
          service_id: string
          service_name?: string | null
          source?: Database["public"]["Enums"]["appointment_source"]
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          notes?: string | null
          price?: number | null
          professional_id?: string
          professional_name?: string | null
          scheduled_at?: string
          service_id?: string
          service_name?: string | null
          source?: Database["public"]["Enums"]["appointment_source"]
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professional"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service"
            referencedColumns: ["id"]
          },
        ]
      }
      company: {
        Row: {
          business_hours: Json | null
          ciclo: Database["public"]["Enums"]["ciclo_type"]
          cnpj: string | null
          created_at: string
          created_by: string | null
          email_contato: string | null
          endereco: Json | null
          id: string
          logo_url: string | null
          name: string
          nome_fantasia: string | null
          onboarding_concluido: boolean
          onboarding_step: number
          plano: Database["public"]["Enums"]["plano_type"]
          primary_color: string | null
          proximo_vencimento: string | null
          razao_social: string | null
          slug: string | null
          status_cobranca: Database["public"]["Enums"]["status_cobranca"]
          telefone_comercial: string | null
          trial_ate: string | null
          ultimo_acesso_at: string | null
          updated_at: string
          valor_mensal: number
          whatsapp: string | null
        }
        Insert: {
          business_hours?: Json | null
          ciclo?: Database["public"]["Enums"]["ciclo_type"]
          cnpj?: string | null
          created_at?: string
          created_by?: string | null
          email_contato?: string | null
          endereco?: Json | null
          id?: string
          logo_url?: string | null
          name: string
          nome_fantasia?: string | null
          onboarding_concluido?: boolean
          onboarding_step?: number
          plano?: Database["public"]["Enums"]["plano_type"]
          primary_color?: string | null
          proximo_vencimento?: string | null
          razao_social?: string | null
          slug?: string | null
          status_cobranca?: Database["public"]["Enums"]["status_cobranca"]
          telefone_comercial?: string | null
          trial_ate?: string | null
          ultimo_acesso_at?: string | null
          updated_at?: string
          valor_mensal?: number
          whatsapp?: string | null
        }
        Update: {
          business_hours?: Json | null
          ciclo?: Database["public"]["Enums"]["ciclo_type"]
          cnpj?: string | null
          created_at?: string
          created_by?: string | null
          email_contato?: string | null
          endereco?: Json | null
          id?: string
          logo_url?: string | null
          name?: string
          nome_fantasia?: string | null
          onboarding_concluido?: boolean
          onboarding_step?: number
          plano?: Database["public"]["Enums"]["plano_type"]
          primary_color?: string | null
          proximo_vencimento?: string | null
          razao_social?: string | null
          slug?: string | null
          status_cobranca?: Database["public"]["Enums"]["status_cobranca"]
          telefone_comercial?: string | null
          trial_ate?: string | null
          ultimo_acesso_at?: string | null
          updated_at?: string
          valor_mensal?: number
          whatsapp?: string | null
        }
        Relationships: []
      }
      company_user: {
        Row: {
          ativo: boolean
          company_id: string
          convite_aceito: boolean
          convite_token: string | null
          created_at: string
          email: string
          forcar_troca_senha: boolean
          id: string
          nome: string | null
          role: Database["public"]["Enums"]["tenant_role"]
          ultimo_login: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ativo?: boolean
          company_id: string
          convite_aceito?: boolean
          convite_token?: string | null
          created_at?: string
          email: string
          forcar_troca_senha?: boolean
          id?: string
          nome?: string | null
          role?: Database["public"]["Enums"]["tenant_role"]
          ultimo_login?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ativo?: boolean
          company_id?: string
          convite_aceito?: boolean
          convite_token?: string | null
          created_at?: string
          email?: string
          forcar_troca_senha?: boolean
          id?: string
          nome?: string | null
          role?: Database["public"]["Enums"]["tenant_role"]
          ultimo_login?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_user_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
        ]
      }
      customer: {
        Row: {
          company_id: string
          created_at: string
          email: string | null
          id: string
          last_appointment_at: string | null
          name: string
          notes: string | null
          phone: string
          status: Database["public"]["Enums"]["customer_status"]
          tags: string[] | null
          total_appointments: number
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          email?: string | null
          id?: string
          last_appointment_at?: string | null
          name: string
          notes?: string | null
          phone: string
          status?: Database["public"]["Enums"]["customer_status"]
          tags?: string[] | null
          total_appointments?: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          email?: string | null
          id?: string
          last_appointment_at?: string | null
          name?: string
          notes?: string | null
          phone?: string
          status?: Database["public"]["Enums"]["customer_status"]
          tags?: string[] | null
          total_appointments?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_entry: {
        Row: {
          amount: number
          category: string | null
          company_id: string
          created_at: string
          date: string
          description: string | null
          id: string
          reference_appointment_id: string | null
          status: Database["public"]["Enums"]["financial_status"]
          type: Database["public"]["Enums"]["financial_type"]
          updated_at: string
        }
        Insert: {
          amount: number
          category?: string | null
          company_id: string
          created_at?: string
          date: string
          description?: string | null
          id?: string
          reference_appointment_id?: string | null
          status?: Database["public"]["Enums"]["financial_status"]
          type: Database["public"]["Enums"]["financial_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string | null
          company_id?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          reference_appointment_id?: string | null
          status?: Database["public"]["Enums"]["financial_status"]
          type?: Database["public"]["Enums"]["financial_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_entry_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_entry_reference_appointment_id_fkey"
            columns: ["reference_appointment_id"]
            isOneToOne: false
            referencedRelation: "appointment"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_simulated: {
        Row: {
          amount: number
          company_id: string
          created_at: string
          due_date: string
          id: string
          paid_at: string | null
          reference_month: string
          status: Database["public"]["Enums"]["invoice_status"]
        }
        Insert: {
          amount: number
          company_id: string
          created_at?: string
          due_date: string
          id?: string
          paid_at?: string | null
          reference_month: string
          status?: Database["public"]["Enums"]["invoice_status"]
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string
          due_date?: string
          id?: string
          paid_at?: string | null
          reference_month?: string
          status?: Database["public"]["Enums"]["invoice_status"]
        }
        Relationships: [
          {
            foreignKeyName: "invoice_simulated_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
        ]
      }
      professional: {
        Row: {
          active: boolean
          commission_type: string | null
          commission_value: number | null
          company_id: string
          created_at: string
          id: string
          name: string
          photo_url: string | null
          specialty: string | null
          updated_at: string
          work_schedule: Json | null
        }
        Insert: {
          active?: boolean
          commission_type?: string | null
          commission_value?: number | null
          company_id: string
          created_at?: string
          id?: string
          name: string
          photo_url?: string | null
          specialty?: string | null
          updated_at?: string
          work_schedule?: Json | null
        }
        Update: {
          active?: boolean
          commission_type?: string | null
          commission_value?: number | null
          company_id?: string
          created_at?: string
          id?: string
          name?: string
          photo_url?: string | null
          specialty?: string | null
          updated_at?: string
          work_schedule?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_service: {
        Row: {
          commission_type: string | null
          commission_value: number | null
          professional_id: string
          service_id: string
        }
        Insert: {
          commission_type?: string | null
          commission_value?: number | null
          professional_id: string
          service_id: string
        }
        Update: {
          commission_type?: string | null
          commission_value?: number | null
          professional_id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_service_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professional"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_service_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service"
            referencedColumns: ["id"]
          },
        ]
      }
      service: {
        Row: {
          active: boolean
          category_id: string | null
          company_id: string
          created_at: string
          description: string | null
          duration_minutes: number
          featured: boolean
          id: string
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          category_id?: string | null
          company_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          featured?: boolean
          id?: string
          name: string
          price?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          category_id?: string | null
          company_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          featured?: boolean
          id?: string
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
        ]
      }
      service_category: {
        Row: {
          active: boolean
          company_id: string
          created_at: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          company_id: string
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          company_id?: string
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_category_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_super_admin_if_empty: { Args: never; Returns: boolean }
      current_company_id: { Args: never; Returns: string }
      has_company_access: { Args: { _company_id: string }; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin"
      appointment_source: "interno" | "online" | "demo"
      appointment_status:
        | "agendado"
        | "confirmado"
        | "em_andamento"
        | "concluido"
        | "cancelado"
        | "nao_compareceu"
      ciclo_type: "mensal" | "anual"
      commission_type: "percent" | "fixed"
      customer_status: "active" | "inactive" | "vip"
      financial_status: "confirmado" | "pendente" | "cancelado"
      financial_type: "entrada" | "saida"
      invoice_status: "pago" | "pendente" | "vencido" | "cancelado"
      plano_type: "starter" | "pro" | "premium"
      status_cobranca:
        | "trial"
        | "ativo"
        | "inadimplente"
        | "suspenso"
        | "cancelado"
      tenant_role: "owner" | "admin" | "recepcao" | "barbeiro" | "financeiro"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin"],
      appointment_source: ["interno", "online", "demo"],
      appointment_status: [
        "agendado",
        "confirmado",
        "em_andamento",
        "concluido",
        "cancelado",
        "nao_compareceu",
      ],
      ciclo_type: ["mensal", "anual"],
      commission_type: ["percent", "fixed"],
      customer_status: ["active", "inactive", "vip"],
      financial_status: ["confirmado", "pendente", "cancelado"],
      financial_type: ["entrada", "saida"],
      invoice_status: ["pago", "pendente", "vencido", "cancelado"],
      plano_type: ["starter", "pro", "premium"],
      status_cobranca: [
        "trial",
        "ativo",
        "inadimplente",
        "suspenso",
        "cancelado",
      ],
      tenant_role: ["owner", "admin", "recepcao", "barbeiro", "financeiro"],
    },
  },
} as const

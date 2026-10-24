import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type BrandEmailPayload =
  | {
      tipo: "credenciais_admin";
      destinatario_email: string;
      destinatario_nome?: string;
      dados: {
        email_login: string;
        senha_temporaria: string;
        link_painel: string;
        link_agendamento?: string;
        nome_barbearia: string;
      };
    }
  | {
      tipo: "convite_equipe";
      destinatario_email: string;
      destinatario_nome?: string;
      dados: {
        nome_convidador: string;
        nome_barbearia: string;
        link_convite: string;
        papel: string;
      };
    }
  | {
      tipo: "confirmacao_agendamento";
      destinatario_email: string;
      destinatario_nome?: string;
      dados: {
        nome_barbearia: string;
        servico: string;
        profissional: string;
        data_hora_formatada: string;
        endereco?: string;
        link_cancelar?: string;
      };
    };

/**
 * Dispara email transacional via edge function `enviar-email`.
 * Nunca lança — se falhar, mostra toast amarelo e retorna false.
 */
export async function sendBrandEmail(payload: BrandEmailPayload): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke("enviar-email", { body: payload });
    if (error || (data as any)?.error) {
      toast.info("Envio de email desativado (stub)", {
        description: "Conecte um provedor de email na função enviar-email para habilitar.",
        duration: 5000,
      });
      return false;
    }
    return true;
  } catch {
    toast.info("Envio de email desativado (stub)", {
      description: "Conecte um provedor de email na função enviar-email para habilitar.",
      duration: 5000,
    });
    return false;
  }
}

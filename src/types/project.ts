
import { Json } from "@/integrations/supabase/types";

// Define a type that matches your JSON structure for etapas
export type Etapa = {
  id: string;
  nome: string;
  concluida: boolean;
};

// Convert between application Etapa type and Json type for Supabase
export const etapasToJson = (etapas: Etapa[]): Json => {
  return etapas as unknown as Json;
};

export const jsonToEtapas = (json: Json | null): Etapa[] => {
  if (!json) return [];
  try {
    if (Array.isArray(json)) {
      return json.map(etapa => ({
        id: String(etapa.id || ''),
        nome: String(etapa.nome || ''),
        concluida: Boolean(etapa.concluida)
      }));
    }
    return [];
  } catch (error) {
    console.error("Error converting JSON to Etapas:", error);
    return [];
  }
};

export type Projeto = {
  id: string;
  titulo: string;
  descricao: string;
  dataInicio: string; 
  dataFim: string;
  etapas: Etapa[];
  progresso: number;
};

export type ProjetoDTO = {
  titulo: string;
  descricao: string;
  data_inicio: string;
  data_fim: string;
  etapas: Json;
  owner_id: string;
};

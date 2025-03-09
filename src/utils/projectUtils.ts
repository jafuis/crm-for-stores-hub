
import { Json } from "@/integrations/supabase/types";

export interface Etapa {
  id: string;
  descricao: string;
  concluida: boolean;
}

export interface Projeto {
  id: string;
  titulo: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  etapas: Etapa[];
  progresso: number;
}

// Convert our Etapa[] to JSON format for Supabase
export const etapasToJson = (etapas: Etapa[]): Json => {
  return etapas as unknown as Json;
};

// Convert JSON from Supabase to our Etapa[] format
export const jsonToEtapas = (json: Json | null): Etapa[] => {
  if (!json) return [];
  
  try {
    if (Array.isArray(json)) {
      return json.map(etapa => {
        // Check if etapa is an object before accessing properties
        if (etapa && typeof etapa === 'object') {
          return {
            id: String(etapa.id || ''),
            descricao: String(etapa.descricao || ''),
            concluida: Boolean(etapa.concluida)
          };
        }
        // Return a default etapa if the item is not properly structured
        return {
          id: '',
          descricao: '',
          concluida: false
        };
      });
    }
    return [];
  } catch (error) {
    console.error("Error converting JSON to Etapas:", error);
    return [];
  }
};

// Calculate project progress based on completed steps
export const calcularProgresso = (etapas: Etapa[]): number => {
  if (etapas.length === 0) return 0;
  const etapasConcluidas = etapas.filter(etapa => etapa.concluida).length;
  return Math.round((etapasConcluidas / etapas.length) * 100);
};


import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface NotificationsContextType {
  notificacoesTarefas: number;
  notificacoesAniversariantes: number;
  notificacoesContasPagar: number;
  refreshNotifications: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
};

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notificacoesTarefas, setNotificacoesTarefas] = useState<number>(0);
  const [notificacoesAniversariantes, setNotificacoesAniversariantes] = useState<number>(0);
  const [notificacoesContasPagar, setNotificacoesContasPagar] = useState<number>(0);
  const { user } = useAuth();

  const refreshNotifications = () => {
    if (user) {
      buscarTarefasVencidas();
      buscarAniversariantes();
      buscarContasVencidas();
    }
  };

  useEffect(() => {
    if (user) {
      refreshNotifications();
    }
  }, [user]);

  const buscarTarefasVencidas = async () => {
    if (!user) return;
    
    try {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('owner_id', user.id)
        .eq('status', 'pending')
        .lte('due_date', hoje.toISOString());
      
      if (error) throw error;
      
      if (data) {
        setNotificacoesTarefas(data.length);
      }
    } catch (error) {
      console.error("Erro ao buscar tarefas vencidas:", error);
    }
  };

  const buscarAniversariantes = async () => {
    if (!user) return;
    
    try {
      const hoje = new Date();
      const diaHoje = hoje.getDate();
      const mesHoje = hoje.getMonth() + 1;
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('owner_id', user.id);
      
      if (error) throw error;
      
      if (data) {
        const aniversariantes = data.filter(cliente => {
          if (cliente.birthday) {
            const [ano, mes, dia] = cliente.birthday.split('-');
            return parseInt(dia) === diaHoje && parseInt(mes) === mesHoje;
          }
          return false;
        });
        
        setNotificacoesAniversariantes(aniversariantes.length);
      }
    } catch (error) {
      console.error("Erro ao buscar aniversariantes:", error);
    }
  };

  const buscarContasVencidas = async () => {
    if (!user) return;
    
    try {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('financas')
        .select('*')
        .eq('owner_id', user.id)
        .eq('tipo', 'despesa')
        .or(`status.eq.pendente,status.eq.vencida`)
        .order('data_vencimento', { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        // Filtrar contas vencidas
        const contasVencidas = data.filter(conta => {
          if (conta.data_vencimento) {
            const dataVencimento = new Date(conta.data_vencimento);
            dataVencimento.setHours(0, 0, 0, 0);
            return dataVencimento < hoje && (conta.status === 'pendente' || conta.status === 'vencida');
          }
          return false;
        });
        
        // Atualizar status das contas vencidas se necessário
        const atualizacoes = contasVencidas
          .filter(conta => conta.status === 'pendente')
          .map(async (conta) => {
            try {
              const { error: updateError } = await supabase
                .from('financas')
                .update({ status: 'vencida' })
                .eq('id', conta.id);
              
              if (updateError) {
                console.error("Erro ao atualizar status da conta:", updateError);
              }
            } catch (err) {
              console.error("Erro ao atualizar status da conta:", err);
            }
          });
        
        setNotificacoesContasPagar(contasVencidas.length);
      }
    } catch (error) {
      console.error("Erro ao buscar contas vencidas:", error);
    }
  };

  const value = {
    notificacoesTarefas,
    notificacoesAniversariantes,
    notificacoesContasPagar,
    refreshNotifications
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

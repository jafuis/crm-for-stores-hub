
import { useState, useEffect } from "react";
import { parseISO, isBefore } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ContaPagar {
  id: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  status: string;
  importante: boolean;
  categoria: string;
}

export function useContasPagar() {
  const [contas, setContas] = useState<ContaPagar[]>([]);
  const [contasArquivadas, setContasArquivadas] = useState<ContaPagar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [contaEditando, setContaEditando] = useState<ContaPagar | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const fetchContas = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Para contas ativas (pendentes ou vencidas)
      const { data: ativas, error: errorAtivas } = await supabase
        .from('financas')
        .select('*')
        .eq('owner_id', user.id)
        .eq('tipo', 'despesa')
        .neq('status', 'arquivada')
        .neq('status', 'paga')
        .order('data_vencimento', { ascending: true });
        
      if (errorAtivas) throw errorAtivas;
      
      // Para contas arquivadas ou pagas
      const { data: arquivadas, error: errorArquivadas } = await supabase
        .from('financas')
        .select('*')
        .eq('owner_id', user.id)
        .eq('tipo', 'despesa')
        .or('status.eq.arquivada,status.eq.paga')
        .order('data_vencimento', { ascending: false });
      
      if (errorArquivadas) throw errorArquivadas;
      
      // Verificar e atualizar contas vencidas
      const contasAtualizadas = ativas?.map(conta => {
        const dataVencimento = parseISO(conta.data_vencimento);
        let status = conta.status;
        
        // Atualiza o status para "vencida" se passou da data de vencimento
        if (status === 'pendente' && isBefore(dataVencimento, hoje)) {
          status = 'vencida';
          // Atualizar o status no banco de dados
          try {
            // Using a Promise without catch - fixing this
            (async () => {
              try {
                await supabase
                  .from('financas')
                  .update({ status: 'vencida' })
                  .eq('id', conta.id);
                
                console.log("Status atualizado para vencido");
              } catch (err) {
                console.error("Erro ao atualizar status:", err);
              }
            })();
          } catch (err) {
            console.error("Erro ao atualizar status:", err);
          }
        }
        
        return {
          id: conta.id,
          descricao: conta.descricao,
          valor: conta.valor,
          data_vencimento: conta.data_vencimento,
          status: status,
          importante: conta.importante || false,
          categoria: conta.categoria
        };
      }) || [];
      
      const contasArquivadasFormatadas = arquivadas?.map(conta => ({
        id: conta.id,
        descricao: conta.descricao,
        valor: conta.valor,
        data_vencimento: conta.data_vencimento,
        status: conta.status,
        importante: conta.importante || false,
        categoria: conta.categoria
      })) || [];
      
      setContas(contasAtualizadas);
      setContasArquivadas(contasArquivadasFormatadas);
    } catch (error) {
      console.error("Erro ao buscar contas:", error);
      toast({
        title: "Erro ao buscar contas",
        description: "Não foi possível carregar as contas a pagar. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarcarComoPaga = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('financas')
        .update({ status: 'paga' })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Conta paga",
        description: "A conta foi marcada como paga."
      });
      
      fetchContas();
    } catch (error) {
      console.error("Erro ao marcar como paga:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o status da conta.",
        variant: "destructive"
      });
    }
  };

  const handleArquivarConta = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('financas')
        .update({ status: 'arquivada' })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Conta arquivada",
        description: "A conta foi arquivada com sucesso."
      });
      
      fetchContas();
    } catch (error) {
      console.error("Erro ao arquivar conta:", error);
      toast({
        title: "Erro ao arquivar",
        description: "Não foi possível arquivar a conta.",
        variant: "destructive"
      });
    }
  };

  const handleRestaurarConta = async (id: string) => {
    if (!user) return;
    
    try {
      const conta = contasArquivadas.find(c => c.id === id);
      
      if (!conta) {
        throw new Error("Conta não encontrada");
      }
      
      // Determinar o status correto para restauração
      const dataVencimento = parseISO(conta.data_vencimento);
      const novoStatus = isBefore(dataVencimento, hoje) ? 'vencida' : 'pendente';
      
      const { error } = await supabase
        .from('financas')
        .update({ status: novoStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Conta restaurada",
        description: "A conta foi restaurada com sucesso."
      });
      
      fetchContas();
    } catch (error) {
      console.error("Erro ao restaurar conta:", error);
      toast({
        title: "Erro ao restaurar",
        description: "Não foi possível restaurar a conta.",
        variant: "destructive"
      });
    }
  };

  const handleToggleImportante = async (id: string, atual: boolean) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('financas')
        .update({ importante: !atual })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: atual ? "Prioridade removida" : "Marcada como importante",
        description: atual 
          ? "A conta não está mais marcada como importante." 
          : "A conta foi marcada como importante e será exibida no topo."
      });
      
      fetchContas();
    } catch (error) {
      console.error("Erro ao atualizar prioridade:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar a prioridade da conta.",
        variant: "destructive"
      });
    }
  };

  const handleExcluirConta = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('financas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Conta excluída",
        description: "A conta foi excluída permanentemente."
      });
      
      fetchContas();
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a conta.",
        variant: "destructive"
      });
    }
  };

  return {
    contas,
    contasArquivadas,
    isLoading,
    contaEditando,
    setContaEditando,
    fetchContas,
    handleMarcarComoPaga,
    handleArquivarConta,
    handleRestaurarConta,
    handleToggleImportante,
    handleExcluirConta
  };
}

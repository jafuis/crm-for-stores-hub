
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Cake, Trash2, Bell, CheckSquare, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  aniversario: string;
}

interface Tarefa {
  id: string;
  titulo: string;
  concluida: boolean;
  dataVencimento: string;
}

export default function Notificacoes() {
  const [aniversariantes, setAniversariantes] = useState<Cliente[]>([]);
  const [tarefasPendentes, setTarefasPendentes] = useState<Tarefa[]>([]);
  const [notificacoesAcknowledged, setNotificacoesAcknowledged] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carregar notificações reconhecidas do localStorage
    const acknowledged = localStorage.getItem('notificacoesAcknowledged') || '[]';
    setNotificacoesAcknowledged(JSON.parse(acknowledged));
    
    if (user) {
      fetchAniversariantes();
      fetchTarefasPendentes();
    } else {
      setLoading(false);
    }
  }, [user]);
  
  async function fetchAniversariantes() {
    try {
      const hoje = new Date();
      const mesAtual = hoje.getMonth() + 1; // getMonth retorna 0-11
      const diaAtual = hoje.getDate();
      
      // Buscar clientes do banco de dados
      const { data, error } = await supabase
        .from('customers')
        .select('*');

      if (error) {
        throw error;
      }

      // Filtrar aniversariantes de hoje
      const aniversariantesHoje = data
        .filter(cliente => {
          if (!cliente.birthday) return false;
          
          try {
            const aniversario = parseISO(cliente.birthday);
            if (!isValid(aniversario)) return false;
            
            const mesAniversario = aniversario.getMonth() + 1;
            const diaAniversario = aniversario.getDate();
            
            return diaAniversario === diaAtual && mesAniversario === mesAtual;
          } catch (error) {
            console.error("Erro ao verificar aniversário:", error);
            return false;
          }
        })
        .map(cliente => ({
          id: cliente.id,
          nome: cliente.name,
          telefone: cliente.phone || '',
          aniversario: cliente.birthday
        }));
      
      setAniversariantes(aniversariantesHoje);
    } catch (error) {
      console.error("Erro ao buscar aniversariantes:", error);
    }
  }
  
  async function fetchTarefasPendentes() {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'pending');

      if (error) {
        throw error;
      }

      // Transformar os dados do banco para o formato que usamos na interface
      const tarefasFormatadas = data.map(task => ({
        id: task.id,
        titulo: task.title,
        concluida: false,
        dataVencimento: task.due_date || new Date().toISOString().split('T')[0]
      }));

      setTarefasPendentes(tarefasFormatadas);
    } catch (error) {
      console.error("Erro ao buscar tarefas pendentes:", error);
    } finally {
      setLoading(false);
    }
  }
  
  const handleRemoveAniversariante = (id: string) => {
    const updatedAcknowledged = [...notificacoesAcknowledged, id];
    setNotificacoesAcknowledged(updatedAcknowledged);
    
    // Only update the notifications acknowledged in localStorage - won't affect Aniversariantes page
    localStorage.setItem('notificacoesAcknowledged', JSON.stringify(updatedAcknowledged));
    
    toast({
      title: "Notificação removida",
      description: "Notificação de aniversário removida com sucesso.",
    });
  };
  
  const aniversariantesFiltrados = aniversariantes.filter(
    aniversariante => !notificacoesAcknowledged.includes(aniversariante.id)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9b87f5]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Notificações</h1>
          <p className="text-muted-foreground">
            Acompanhe tarefas pendentes e aniversários de clientes
          </p>
        </div>
      </div>
      
      <div className="grid gap-6">
        {aniversariantesFiltrados.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Cake className="w-5 h-5 text-pink-500" />
              <h2 className="text-lg font-semibold">Aniversariantes de Hoje</h2>
            </div>
            <div className="space-y-4">
              {aniversariantesFiltrados.map((cliente) => (
                <div
                  key={cliente.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                      <Cake className="w-5 h-5 text-pink-500" />
                    </div>
                    <div>
                      <p className="font-medium">{cliente.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        Aniversário hoje
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveAniversariante(cliente.id)}
                  >
                    <Trash2 className="w-4 h-4 text-gray-500" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}
        
        {tarefasPendentes.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckSquare className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold">Tarefas Pendentes</h2>
            </div>
            <div className="space-y-4">
              {tarefasPendentes.map((tarefa) => (
                <div
                  key={tarefa.id}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-5 h-5 text-blue-500" />
                      <p className="font-medium">{tarefa.titulo}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {tarefa.dataVencimento ? format(parseISO(tarefa.dataVencimento), "dd/MM/yyyy", { locale: ptBR }) : "Sem data"}
                    </p>
                  </div>
                  <Progress 
                    value={0} 
                    className="h-2 bg-gray-100" 
                  />
                </div>
              ))}
            </div>
          </Card>
        )}
        
        {aniversariantesFiltrados.length === 0 && tarefasPendentes.length === 0 && (
          <Card className="p-6 flex flex-col items-center justify-center text-center">
            <Bell className="w-12 h-12 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Nenhuma notificação</h2>
            <p className="text-muted-foreground">
              Você não tem tarefas pendentes ou aniversários para hoje
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

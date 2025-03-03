
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Cake, Trash2, Bell, CheckSquare, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

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
  const [aniversariantesAcknowledged, setAniversariantesAcknowledged] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Carregar clientes e verificar aniversários
    const clientesSalvos = localStorage.getItem('clientes');
    const tarefasSalvas = localStorage.getItem('tarefas');
    const acknowledged = localStorage.getItem('aniversariantesAcknowledged') || '[]';
    
    setAniversariantesAcknowledged(JSON.parse(acknowledged));
    
    if (clientesSalvos) {
      const clientes: Cliente[] = JSON.parse(clientesSalvos);
      const aniversariantesHoje = clientes.filter(cliente => {
        try {
          if (!cliente.aniversario) return false;
          
          const aniversario = parseISO(cliente.aniversario);
          if (!isValid(aniversario)) return false;
          
          const hoje = new Date();
          return aniversario.getDate() === hoje.getDate() && 
                 aniversario.getMonth() === hoje.getMonth();
        } catch (error) {
          console.error("Erro ao verificar aniversário:", error);
          return false;
        }
      });
      
      setAniversariantes(aniversariantesHoje);
    }
    
    if (tarefasSalvas) {
      const tarefas: Tarefa[] = JSON.parse(tarefasSalvas);
      const pendentes = tarefas.filter(tarefa => !tarefa.concluida);
      setTarefasPendentes(pendentes);
    }
    
    // Verificar aniversários a cada minuto
    const interval = setInterval(() => {
      const clientesSalvosUpdate = localStorage.getItem('clientes');
      const tarefasSalvasUpdate = localStorage.getItem('tarefas');
      
      if (clientesSalvosUpdate) {
        const clientes: Cliente[] = JSON.parse(clientesSalvosUpdate);
        const aniversariantesHoje = clientes.filter(cliente => {
          try {
            if (!cliente.aniversario) return false;
            
            const aniversario = parseISO(cliente.aniversario);
            if (!isValid(aniversario)) return false;
            
            const hoje = new Date();
            return aniversario.getDate() === hoje.getDate() && 
                   aniversario.getMonth() === hoje.getMonth();
          } catch (error) {
            return false;
          }
        });
        
        setAniversariantes(aniversariantesHoje);
      }
      
      if (tarefasSalvasUpdate) {
        const tarefas: Tarefa[] = JSON.parse(tarefasSalvasUpdate);
        const pendentes = tarefas.filter(tarefa => !tarefa.concluida);
        setTarefasPendentes(pendentes);
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleRemoveAniversariante = (id: string) => {
    // Adicionar ID do aniversariante à lista de reconhecidos
    const updatedAcknowledged = [...aniversariantesAcknowledged, id];
    setAniversariantesAcknowledged(updatedAcknowledged);
    
    // Salvar no localStorage
    localStorage.setItem('aniversariantesAcknowledged', JSON.stringify(updatedAcknowledged));
    
    toast({
      title: "Notificação removida",
      description: "Notificação de aniversário removida com sucesso.",
    });
  };
  
  // Filtrar aniversariantes reconhecidos
  const aniversariantesFiltrados = aniversariantes.filter(
    aniversariante => !aniversariantesAcknowledged.includes(aniversariante.id)
  );

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
                    indicatorClassName="bg-blue-500" 
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

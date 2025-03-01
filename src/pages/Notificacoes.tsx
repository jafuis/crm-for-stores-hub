import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, CheckSquare, AlertCircle, Trash2, Trash } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  aniversario: string;
  acknowledged?: boolean;
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
  const [acknowledgedBirthdays, setAcknowledgedBirthdays] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Função aprimorada para verificar se é aniversário hoje
  const isAniversarioHoje = (dataAniversario: string): boolean => {
    try {
      // Se a data não estiver definida, retorna falso
      if (!dataAniversario) return false;
      
      // Converter a string para objeto Date
      const aniversario = parseISO(dataAniversario);
      
      // Verificar se a data é válida
      if (!isValid(aniversario)) {
        console.log("Data inválida:", dataAniversario);
        return false;
      }
      
      // Obter a data atual no fuso horário local (Brasil)
      const hoje = new Date();
      
      // Comparação apenas por mês e dia, considerando o fuso horário correto
      return aniversario.getMonth() === hoje.getMonth() && 
             aniversario.getDate() === hoje.getDate();
    } catch (error) {
      console.error("Erro ao processar data:", dataAniversario, error);
      return false;
    }
  };

  const carregarDados = () => {
    // Carregar clientes do localStorage
    const clientesSalvos = localStorage.getItem('clientes');
    const clientes = clientesSalvos ? JSON.parse(clientesSalvos) : [];
    
    console.log("Total de clientes carregados:", clientes.length);
    
    // Filtrar aniversariantes do dia usando a função aprimorada
    const aniversariantesHoje = clientes.filter((cliente: Cliente) => {
      const resultado = isAniversarioHoje(cliente.aniversario);
      if (resultado) {
        console.log("Aniversariante encontrado:", cliente.nome, cliente.aniversario);
      }
      return resultado;
    });
    
    console.log("Aniversariantes hoje:", aniversariantesHoje.length);
    
    // Carregar acknowledegments
    const savedAcknowledgments = localStorage.getItem('acknowledgedBirthdays');
    const acknowledgments = savedAcknowledgments ? JSON.parse(savedAcknowledgments) : {};
    setAcknowledgedBirthdays(acknowledgments);
    
    // Aplicar os acknowledgments aos aniversariantes
    const aniversariantesComStatus = aniversariantesHoje.map(aniversariante => ({
      ...aniversariante,
      acknowledged: acknowledgments[aniversariante.id] || false
    }));
    
    setAniversariantes(aniversariantesComStatus);

    // Carregar tarefas do localStorage
    const tarefasSalvas = localStorage.getItem('tarefas');
    const tarefas = tarefasSalvas ? JSON.parse(tarefasSalvas) : [];
    
    // Filtrar tarefas pendentes
    const tarefasPendentes = tarefas.filter((tarefa: Tarefa) => !tarefa.concluida);
    setTarefasPendentes(tarefasPendentes);
  };

  useEffect(() => {
    carregarDados();
    
    // Adiciona evento para atualizar quando o localStorage for modificado
    window.addEventListener('storage', carregarDados);
    
    // Limpeza
    return () => {
      window.removeEventListener('storage', carregarDados);
    };
  }, []);

  const enviarMensagemWhatsApp = (telefone: string, nome: string) => {
    const telefoneFormatado = telefone.replace(/\D/g, '');
    const mensagem = `Feliz aniversário, ${nome}! 🎉`;
    const url = `https://wa.me/55${telefoneFormatado}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
    
    toast({
      title: "Mensagem preparada",
      description: "WhatsApp foi aberto com a mensagem de parabéns!",
    });
  };

  const handleRemoveBirthday = (clienteId: string) => {
    const newAcknowledgments = {
      ...acknowledgedBirthdays,
      [clienteId]: true
    };
    
    setAcknowledgedBirthdays(newAcknowledgments);
    localStorage.setItem('acknowledgedBirthdays', JSON.stringify(newAcknowledgments));
    
    // Atualizar o estado dos aniversariantes
    setAniversariantes(prev => 
      prev.filter(cliente => cliente.id !== clienteId)
    );
    
    toast({
      title: "Notificação removida",
      description: "A notificação foi removida com sucesso.",
    });
  };

  const handleRemoveAllBirthdays = () => {
    // Marcar todos os aniversariantes como acknowledged
    const newAcknowledgments = { ...acknowledgedBirthdays };
    aniversariantes.forEach(aniversariante => {
      newAcknowledgments[aniversariante.id] = true;
    });
    
    setAcknowledgedBirthdays(newAcknowledgments);
    localStorage.setItem('acknowledgedBirthdays', JSON.stringify(newAcknowledgments));
    
    // Limpar a lista de aniversariantes
    setAniversariantes([]);
    
    toast({
      title: "Notificações removidas",
      description: "Todas as notificações de aniversário foram removidas.",
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn px-4 md:px-0">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notificações</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={carregarDados}>
            Atualizar
          </Button>
          {(aniversariantes.length > 0) && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50">
                  <Trash className="w-4 h-4 mr-2" />
                  Limpar Todas
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remover todas as notificações?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Todas as notificações de aniversário serão removidas.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRemoveAllBirthdays} className="bg-red-500 hover:bg-red-600">
                    Remover Todas
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        {aniversariantes.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-pink-500" />
              Aniversários Hoje ({aniversariantes.length})
            </h2>
            <div className="space-y-4">
              {aniversariantes.map((aniversariante) => (
                <div key={aniversariante.id} className="flex flex-col p-4 border rounded-lg bg-pink-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-4 mb-3">
                      <Gift className="w-6 h-6 text-pink-500 shrink-0" />
                      <div>
                        <h3 className="font-medium">{aniversariante.nome}</h3>
                        <p className="text-sm text-gray-500">Aniversário hoje!</p>
                        {aniversariante.telefone && (
                          <p className="text-xs text-gray-600 flex items-center cursor-pointer hover:text-pink-600" 
                             onClick={() => enviarMensagemWhatsApp(aniversariante.telefone, aniversariante.nome)}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                              <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                              <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                              <path d="M9.5 13.5c.5 1 1.5 1 2 1s2.5 0 3.5-1.5" />
                            </svg>
                            {aniversariante.telefone}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveBirthday(aniversariante.id)}
                      className="text-red-600 hover:bg-red-100 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {tarefasPendentes.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Tarefas Pendentes ({tarefasPendentes.length})
            </h2>
            <div className="space-y-4">
              {tarefasPendentes.map((tarefa) => (
                <div key={tarefa.id} className="flex items-center gap-4 p-4 border rounded-lg bg-red-50">
                  <CheckSquare className="w-6 h-6 text-red-500" />
                  <div>
                    <h3 className="font-medium text-red-700">{tarefa.titulo}</h3>
                    <p className="text-sm text-red-500">Pendente</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {aniversariantes.length === 0 && tarefasPendentes.length === 0 && (
          <Card className="p-6">
            <div className="text-center text-gray-500">
              <p>Nenhuma notificação no momento.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

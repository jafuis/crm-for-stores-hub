
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, CheckSquare, MessageSquare, AlertCircle, Check, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

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

interface NotificacaoOculta {
  id: string;
  tipo: 'aniversario' | 'tarefa';
  data: string; // Data em que foi ocultada
}

export default function Notificacoes() {
  const [aniversariantes, setAniversariantes] = useState<Cliente[]>([]);
  const [tarefasPendentes, setTarefasPendentes] = useState<Tarefa[]>([]);
  const [notificacoesOcultas, setNotificacoesOcultas] = useState<NotificacaoOculta[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Carregar notificações ocultas
    const ocultasSalvas = localStorage.getItem('notificacoesOcultas');
    if (ocultasSalvas) {
      setNotificacoesOcultas(JSON.parse(ocultasSalvas));
    }

    // Carregar clientes do localStorage
    const clientesSalvos = localStorage.getItem('clientes');
    const clientes = clientesSalvos ? JSON.parse(clientesSalvos) : [];
    
    // Filtrar aniversariantes do dia
    const hoje = format(new Date(), 'MM-dd');
    const aniversariantesHoje = clientes.filter((cliente: Cliente) => {
      if (!cliente.aniversario) return false;
      
      // Verificar se essa notificação está oculta
      const estaOculta = notificacoesOcultas.some(
        not => not.tipo === 'aniversario' && not.id === cliente.id && 
        format(new Date(not.data), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
      );
      
      if (estaOculta) return false;
      
      try {
        const aniversario = new Date(cliente.aniversario);
        return format(aniversario, 'MM-dd') === hoje;
      } catch (e) {
        console.error("Erro ao processar data de aniversário:", e);
        return false;
      }
    });
    
    setAniversariantes(aniversariantesHoje);

    // Carregar tarefas pendentes
    const tarefasSalvas = localStorage.getItem('tarefas');
    const tarefas = tarefasSalvas ? JSON.parse(tarefasSalvas) : [];
    
    // Filtrar tarefas pendentes que não estão ocultas
    const pendentes = tarefas.filter((tarefa: Tarefa) => {
      if (tarefa.concluida) return false;
      
      // Verificar se essa notificação está oculta
      const estaOculta = notificacoesOcultas.some(
        not => not.tipo === 'tarefa' && not.id === tarefa.id &&
        format(new Date(not.data), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
      );
      
      return !estaOculta;
    });
    
    setTarefasPendentes(pendentes);
  }, [notificacoesOcultas]);

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

  const ocultarNotificacao = (id: string, tipo: 'aniversario' | 'tarefa') => {
    const novasOcultas = [
      ...notificacoesOcultas,
      { id, tipo, data: new Date().toISOString() }
    ];
    
    setNotificacoesOcultas(novasOcultas);
    localStorage.setItem('notificacoesOcultas', JSON.stringify(novasOcultas));
    
    toast({
      title: "Notificação ocultada",
      description: "Esta notificação não será exibida hoje.",
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notificações</h1>
      </div>

      <div className="grid gap-6">
        {aniversariantes.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-pink-500" />
              Aniversários Hoje
            </h2>
            <div className="space-y-4">
              {aniversariantes.map((aniversariante) => (
                <div key={aniversariante.id} className="flex items-center justify-between p-4 border rounded-lg bg-pink-50">
                  <div className="flex items-center gap-4">
                    <Gift className="w-6 h-6 text-pink-500" />
                    <div>
                      <h3 className="font-medium">{aniversariante.nome}</h3>
                      <p className="text-sm text-gray-500">Aniversário hoje!</p>
                      {aniversariante.telefone && (
                        <p className="text-sm text-gray-500">{aniversariante.telefone}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => ocultarNotificacao(aniversariante.id, 'aniversario')}
                      className="h-7 w-7 text-gray-500 hover:text-red-500 hover:bg-transparent"
                      title="Ocultar notificação"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    {aniversariante.telefone && (
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => enviarMensagemWhatsApp(aniversariante.telefone, aniversariante.nome)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Enviar Mensagem
                      </Button>
                    )}
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
              Tarefas Pendentes
            </h2>
            <div className="space-y-4">
              {tarefasPendentes.map((tarefa) => (
                <div key={tarefa.id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                  <div className="flex items-center gap-4">
                    <CheckSquare className="w-6 h-6 text-red-500" />
                    <div>
                      <h3 className="font-medium text-red-700">{tarefa.titulo}</h3>
                      <p className="text-sm text-red-500">Pendente</p>
                      {tarefa.dataVencimento && (
                        <p className="text-sm text-red-500">
                          Vencimento: {format(new Date(tarefa.dataVencimento), 'dd/MM/yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => ocultarNotificacao(tarefa.id, 'tarefa')}
                      className="h-7 w-7 text-gray-500 hover:text-red-500 hover:bg-transparent"
                      title="Ocultar notificação"
                    >
                      <X className="w-4 h-4" />
                    </Button>
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

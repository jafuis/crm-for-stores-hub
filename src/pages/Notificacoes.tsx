
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, CheckSquare, MessageSquare, AlertCircle, Check } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

  useEffect(() => {
    // Carregar clientes do localStorage
    const clientesSalvos = localStorage.getItem('clientes');
    const clientes = clientesSalvos ? JSON.parse(clientesSalvos) : [];
    
    // Filtrar aniversariantes do dia
    const hoje = format(new Date(), 'MM-dd');
    const aniversariantesHoje = clientes.filter((cliente: Cliente) => {
      const aniversario = new Date(cliente.aniversario);
      return format(aniversario, 'MM-dd') === hoje;
    });
    
    // Carregar acknowlegments
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
  }, []);

  const enviarMensagemWhatsApp = (telefone: string, nome: string) => {
    const mensagem = `Feliz aniversário, ${nome}! 🎉`;
    const url = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  const handleAcknowledgeBirthday = (clienteId: string) => {
    const newAcknowledgments = {
      ...acknowledgedBirthdays,
      [clienteId]: true
    };
    
    setAcknowledgedBirthdays(newAcknowledgments);
    localStorage.setItem('acknowledgedBirthdays', JSON.stringify(newAcknowledgments));
    
    // Atualizar o estado dos aniversariantes
    setAniversariantes(prev => 
      prev.map(cliente => 
        cliente.id === clienteId 
          ? { ...cliente, acknowledged: true } 
          : cliente
      )
    );
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
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {aniversariante.acknowledged ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <Check className="w-4 h-4" /> OK
                      </span>
                    ) : (
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleAcknowledgeBirthday(aniversariante.id)}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        OK
                      </Button>
                    )}
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => enviarMensagemWhatsApp(aniversariante.telefone, aniversariante.nome)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Enviar Mensagem
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
              Tarefas Pendentes
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

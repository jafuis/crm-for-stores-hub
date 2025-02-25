
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, CheckSquare, MessageSquare } from "lucide-react";
import { format, isToday } from "date-fns";

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  aniversario: string;
  classificacao: number;
}

interface Tarefa {
  id: string;
  titulo: string;
  concluida: boolean;
}

export default function Notificacoes() {
  const [aniversariantes, setAniversariantes] = useState<Cliente[]>([]);
  const [tarefasPendentes, setTarefasPendentes] = useState<Tarefa[]>([]);

  useEffect(() => {
    // Carregar clientes e verificar aniversariantes
    const clientesSalvos = localStorage.getItem('clientes');
    if (clientesSalvos) {
      const clientes: Cliente[] = JSON.parse(clientesSalvos);
      const hoje = new Date();
      const aniversariantesHoje = clientes.filter(cliente => {
        if (!cliente.aniversario) return false;
        const dataAniversario = new Date(cliente.aniversario);
        return dataAniversario.getDate() === hoje.getDate() &&
               dataAniversario.getMonth() === hoje.getMonth();
      });
      setAniversariantes(aniversariantesHoje);
    }

    // Carregar tarefas pendentes
    const tarefasSalvas = localStorage.getItem('tarefas');
    if (tarefasSalvas) {
      const tarefas: Tarefa[] = JSON.parse(tarefasSalvas);
      const pendentes = tarefas.filter(tarefa => !tarefa.concluida);
      setTarefasPendentes(pendentes);
    }
  }, []);

  const enviarMensagemWhatsApp = (telefone: string, nome: string) => {
    const mensagem = `Feliz aniversário, ${nome}! 🎉`;
    const url = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notificações</h1>
      </div>

      <div className="grid gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Aniversários</h2>
          <div className="space-y-4">
            {aniversariantes.length === 0 ? (
              <p className="text-gray-500">Nenhum aniversariante hoje!</p>
            ) : (
              aniversariantes.map((aniversariante) => (
                <div key={aniversariante.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Gift className="w-6 h-6 text-pink-500" />
                    <div>
                      <h3 className="font-medium">{aniversariante.nome}</h3>
                      <p className="text-sm text-gray-500">Aniversário hoje!</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => enviarMensagemWhatsApp(aniversariante.telefone, aniversariante.nome)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Enviar Mensagem
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Tarefas Pendentes</h2>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {tarefasPendentes.length === 0 ? (
              <p className="text-gray-500">Nenhuma tarefa pendente!</p>
            ) : (
              tarefasPendentes.map((tarefa) => (
                <div key={tarefa.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <CheckSquare className="w-6 h-6 text-yellow-500" />
                  <div>
                    <h3 className="font-medium">{tarefa.titulo}</h3>
                    <p className="text-sm text-gray-500">Tarefa pendente</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

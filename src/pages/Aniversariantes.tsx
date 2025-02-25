
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  aniversario: string;
}

export default function Aniversariantes() {
  const [aniversariantes, setAniversariantes] = useState<Cliente[]>([]);

  useEffect(() => {
    const clientesSalvos = localStorage.getItem('clientes');
    const clientes = clientesSalvos ? JSON.parse(clientesSalvos) : [];
    
    const hoje = format(new Date(), 'MM-dd');
    const aniversariantesHoje = clientes.filter((cliente: Cliente) => {
      const aniversario = new Date(cliente.aniversario);
      return format(aniversario, 'MM-dd') === hoje;
    });
    
    setAniversariantes(aniversariantesHoje);
  }, []);

  const enviarMensagemWhatsApp = (telefone: string, nome: string) => {
    const mensagem = `Feliz aniversário, ${nome}! 🎉`;
    const url = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Aniversariantes do Dia</h1>
          <p className="text-muted-foreground">Celebre com seus clientes!</p>
        </div>
      </div>

      {aniversariantes.length > 0 ? (
        <div className="grid gap-4">
          {aniversariantes.map((aniversariante) => (
            <Card key={aniversariante.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                    <Gift className="w-6 h-6 text-pink-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{aniversariante.nome}</h3>
                    <p className="text-sm text-gray-500">{aniversariante.telefone}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => enviarMensagemWhatsApp(aniversariante.telefone, aniversariante.nome)}
                  className="text-pink-500 border-pink-200 hover:bg-pink-50"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Enviar Mensagem
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6">
          <div className="text-center text-gray-500">
            <Gift className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Nenhum aniversariante hoje!</p>
          </div>
        </Card>
      )}
    </div>
  );
}

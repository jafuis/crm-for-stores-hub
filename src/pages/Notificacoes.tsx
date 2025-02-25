
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, CheckSquare, MessageSquare } from "lucide-react";

interface Aniversariante {
  nome: string;
  telefone: string;
}

export default function Notificacoes() {
  const aniversariantes: Aniversariante[] = [
    {
      nome: "João Silva",
      telefone: "11999999999",
    }
  ];

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
            {aniversariantes.map((aniversariante, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
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
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Tarefas Pendentes</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <CheckSquare className="w-6 h-6 text-yellow-500" />
              <div>
                <h3 className="font-medium">Contatar cliente X</h3>
                <p className="text-sm text-gray-500">Vence hoje</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

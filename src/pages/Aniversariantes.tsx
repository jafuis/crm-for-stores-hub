
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  aniversario: string;
}

export default function Aniversariantes() {
  const [aniversariantes, setAniversariantes] = useState<Cliente[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const carregarAniversariantes = () => {
      const clientesSalvos = localStorage.getItem('clientes');
      const clientes = clientesSalvos ? JSON.parse(clientesSalvos) : [];
      
      const hoje = format(new Date(), 'MM-dd');
      const aniversariantesHoje = clientes.filter((cliente: Cliente) => {
        if (!cliente.aniversario) return false;
        const aniversario = new Date(cliente.aniversario);
        return format(aniversario, 'MM-dd') === hoje;
      });
      
      setAniversariantes(aniversariantesHoje);
    };

    carregarAniversariantes();

    // Adiciona um event listener para atualizar a lista quando os clientes forem alterados
    window.addEventListener('storage', carregarAniversariantes);

    return () => {
      window.removeEventListener('storage', carregarAniversariantes);
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

  const formatarData = (data: string) => {
    return format(new Date(data), "dd 'de' MMMM", { locale: ptBR });
  };

  return (
    <div className="space-y-6 animate-fadeIn pt-16">
      <div>
        <h1 className="text-2xl font-bold">Aniversariantes do Dia</h1>
        <p className="text-muted-foreground">Celebre com seus clientes!</p>
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
                    <p className="text-sm text-gray-500">{formatarData(aniversariante.aniversario)}</p>
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

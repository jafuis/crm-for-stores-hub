
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, MessageSquare, SortAsc, SortDesc } from "lucide-react";
import { format, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  aniversario: string;
}

export default function Aniversariantes() {
  const [aniversariantes, setAniversariantes] = useState<Cliente[]>([]);
  const [ordenacao, setOrdenacao] = useState<'asc' | 'desc'>('asc');
  const { toast } = useToast();

  useEffect(() => {
    const carregarAniversariantes = () => {
      const clientesSalvos = localStorage.getItem('clientes');
      const clientes = clientesSalvos ? JSON.parse(clientesSalvos) : [];
      
      // Obter data atual no fuso horário brasileiro
      const hoje = new Date();
      const aniversariantesHoje = clientes.filter((cliente: Cliente) => {
        if (!cliente.aniversario) return false;
        
        // Converter a string de data para objeto Date
        const aniversario = parseISO(cliente.aniversario);
        
        // Comparar apenas o dia e mês, ignorando o ano
        return isSameDay(
          new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()),
          new Date(hoje.getFullYear(), aniversario.getMonth(), aniversario.getDate())
        );
      });
      
      const aniversariantesOrdenados = [...aniversariantesHoje].sort((a, b) => {
        if (ordenacao === 'asc') {
          return a.nome.localeCompare(b.nome, 'pt-BR');
        } else {
          return b.nome.localeCompare(a.nome, 'pt-BR');
        }
      });
      
      setAniversariantes(aniversariantesOrdenados);
    };

    carregarAniversariantes();

    window.addEventListener('storage', carregarAniversariantes);

    return () => {
      window.removeEventListener('storage', carregarAniversariantes);
    };
  }, [ordenacao]);

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

  return (
    <div className="space-y-6 animate-fadeIn px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Aniversariantes do Dia</h1>
          <p className="text-muted-foreground">Celebre com seus clientes!</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setOrdenacao(prev => prev === 'asc' ? 'desc' : 'asc')}
          className="flex items-center gap-2 w-full md:w-auto"
        >
          {ordenacao === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
          Ordenar por nome
        </Button>
      </div>

      {aniversariantes.length > 0 ? (
        <div className="grid gap-4">
          {aniversariantes.map((aniversariante) => (
            <Card key={aniversariante.id} className="p-4 md:p-6 border-l-4 border-l-pink-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center animate-bounce shrink-0">
                    <Gift className="w-6 h-6 text-pink-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{aniversariante.nome}</h3>
                    <p className="text-sm font-bold text-pink-500">HOJE!🎉</p>
                    {aniversariante.telefone && (
                      <p className="text-sm text-gray-500 break-words">{aniversariante.telefone}</p>
                    )}
                  </div>
                </div>
                {aniversariante.telefone && (
                  <Button
                    variant="outline"
                    onClick={() => enviarMensagemWhatsApp(aniversariante.telefone, aniversariante.nome)}
                    className="text-pink-500 border-pink-200 hover:bg-pink-50 w-full md:w-auto"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Enviar Mensagem
                  </Button>
                )}
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

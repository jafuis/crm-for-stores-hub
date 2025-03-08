
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, MessageSquare, SortAsc, SortDesc } from "lucide-react";
import { format, isSameDay, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const carregarAniversariantes = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Fetch customers from Supabase
        const { data, error } = await supabase
          .from('customers')
          .select('id, name, phone, email, birthday');
          
        if (error) throw error;
        
        // Filter birthday matches and map to our format
        const hoje = new Date();
        const aniversariantesHoje = data
          .filter(cliente => {
            if (!cliente.birthday) return false;
            
            try {
              const aniversario = parseISO(cliente.birthday);
              if (!isValid(aniversario)) return false;
              
              return isSameDay(
                new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()),
                new Date(hoje.getFullYear(), aniversario.getMonth(), aniversario.getDate())
              );
            } catch (error) {
              console.error("Erro ao processar data de aniversário:", error);
              return false;
            }
          })
          .map(cliente => ({
            id: cliente.id,
            nome: cliente.name,
            telefone: cliente.phone || '',
            email: cliente.email || '',
            aniversario: cliente.birthday || ''
          }));
        
        // Sort aniversariantes
        const aniversariantesOrdenados = [...aniversariantesHoje].sort((a, b) => {
          if (ordenacao === 'asc') {
            return a.nome.localeCompare(b.nome, 'pt-BR');
          } else {
            return b.nome.localeCompare(a.nome, 'pt-BR');
          }
        });
        
        setAniversariantes(aniversariantesOrdenados);
      } catch (error) {
        console.error('Error fetching aniversariantes:', error);
        toast({
          title: "Erro ao carregar aniversariantes",
          description: "Não foi possível carregar os aniversariantes de hoje.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    carregarAniversariantes();

    // Set up a real-time subscription for live updates
    const channel = supabase
      .channel('public:customers')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'customers' },
        payload => {
          carregarAniversariantes();
        }
      )
      .subscribe();
    
    // Check aniversariantes periodically (hourly)
    const intervalId = setInterval(carregarAniversariantes, 3600000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(intervalId);
    };
  }, [user, ordenacao, toast]);

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

      {isLoading ? (
        <div className="flex justify-center p-8">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : aniversariantes.length > 0 ? (
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

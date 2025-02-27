
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
  email?: string;
}

export default function Aniversariantes() {
  const [aniversariantes, setAniversariantes] = useState<Cliente[]>([]);

  useEffect(() => {
    // Carregar clientes do localStorage
    const clientesSalvos = localStorage.getItem('clientes');
    const clientes = clientesSalvos ? JSON.parse(clientesSalvos) : [];
    
    // Filtrar aniversariantes do dia
    const hoje = format(new Date(), 'MM-dd');
    const aniversariantesHoje = clientes.filter((cliente: Cliente) => {
      if (!cliente.aniversario) return false;
      try {
        const aniversario = new Date(cliente.aniversario);
        return format(aniversario, 'MM-dd') === hoje;
      } catch (e) {
        console.error("Erro ao processar data de aniversário:", e);
        return false;
      }
    });
    
    setAniversariantes(aniversariantesHoje);
  }, []);

  const enviarMensagemWhatsApp = (telefone: string, nome: string) => {
    const mensagem = `Feliz aniversário, ${nome}! 🎉`;
    const url = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  const formatarDataAniversario = (data: string): string => {
    try {
      const aniversario = new Date(data);
      return format(aniversario, "dd 'de' MMMM", { locale: ptBR });
    } catch (e) {
      console.error("Erro ao formatar data:", e);
      return data;
    }
  };

  const calcularIdade = (data: string): number | null => {
    try {
      const aniversario = new Date(data);
      const hoje = new Date();
      let idade = hoje.getFullYear() - aniversario.getFullYear();
      
      const mesmoMes = hoje.getMonth() === aniversario.getMonth();
      const mesmoDia = hoje.getDate() === aniversario.getDate();
      
      // Se ainda não chegou o aniversário deste ano, diminui 1
      if (!mesmoMes || (mesmoMes && !mesmoDia && hoje.getDate() < aniversario.getDate())) {
        idade--;
      }
      
      return idade;
    } catch (e) {
      console.error("Erro ao calcular idade:", e);
      return null;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pt-16">
      <div>
        <h1 className="text-2xl font-bold">Aniversariantes do Dia</h1>
        <p className="text-muted-foreground">Clientes que fazem aniversário hoje</p>
      </div>

      <div className="grid gap-6">
        {aniversariantes.length > 0 ? (
          aniversariantes.map((aniversariante) => (
            <Card key={aniversariante.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-pink-100">
                    <Gift className="w-6 h-6 text-pink-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{aniversariante.nome}</h3>
                    <p className="text-sm text-gray-500">
                      {formatarDataAniversario(aniversariante.aniversario)}
                      {calcularIdade(aniversariante.aniversario) !== null && (
                        <span> • {calcularIdade(aniversariante.aniversario)} anos</span>
                      )}
                    </p>
                    {aniversariante.email && (
                      <p className="text-sm text-gray-500">{aniversariante.email}</p>
                    )}
                    <p className="text-sm text-gray-500">{aniversariante.telefone}</p>
                  </div>
                </div>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => enviarMensagemWhatsApp(aniversariante.telefone, aniversariante.nome)}
                  className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Enviar mensagem
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-6">
            <div className="text-center text-gray-500">
              <p>Nenhum cliente fazendo aniversário hoje.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

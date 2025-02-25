
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { ptBR } from "date-fns/locale";
import { Target } from "lucide-react";

// Import interfaces from other components to ensure type safety
interface Venda {
  id: string;
  valor: number;
  data: string;
  arquivada?: boolean;
}

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  aniversario: string;
  classificacao: number;
}

export default function Dashboard() {
  const currentDate = new Date();
  const currentMonth = format(currentDate, 'MMMM yyyy', { locale: ptBR });
  
  const [metaDiaria, setMetaDiaria] = useState<number>(5000);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  
  // Calcular vendas do dia
  const vendasDoDia = vendas
    .filter(venda => {
      const dataVenda = new Date(venda.data);
      return format(dataVenda, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    })
    .reduce((total, venda) => total + venda.valor, 0);

  // Calcular vendas do mês
  const vendasDoMes = vendas
    .filter(venda => {
      const dataVenda = new Date(venda.data);
      return isWithinInterval(dataVenda, {
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
      });
    })
    .reduce((total, venda) => total + venda.valor, 0);

  // Total de clientes
  const totalClientes = clientes.length;

  // Calcular progresso da meta
  const progress = metaDiaria > 0 ? (vendasDoDia / metaDiaria) * 100 : 0;

  const handleDefinirMeta = (valor: number) => {
    if (valor > 0) {
      setMetaDiaria(valor);
    }
  };

  // Carregar dados do localStorage
  useEffect(() => {
    const vendasSalvas = localStorage.getItem('vendas');
    const clientesSalvos = localStorage.getItem('clientes');

    if (vendasSalvas) {
      setVendas(JSON.parse(vendasSalvas));
    }

    if (clientesSalvos) {
      setClientes(JSON.parse(clientesSalvos));
    }
  }, []); // Executa apenas uma vez ao montar o componente

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{currentMonth}</h1>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Total de Vendas</h2>
          <div className="text-3xl font-bold">
            {vendasDoDia.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Meta Diária</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
            <Progress value={progress} />
            <div className="flex justify-between text-sm">
              <span>R$ {vendasDoDia.toLocaleString()}</span>
              <span>R$ {metaDiaria.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex gap-4">
            <Input
              type="number"
              min="0"
              placeholder="Definir meta diária"
              className="w-40"
              onChange={(e) => handleDefinirMeta(Number(e.target.value))}
            />
            <Button className="bg-[#9b87f5] hover:bg-[#7e69ab]">
              <Target className="w-4 h-4 mr-2" />
              Definir Meta
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Total de Clientes</h3>
          <p className="text-2xl font-bold mt-2">{totalClientes}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Vendas do Mês</h3>
          <p className="text-2xl font-bold mt-2">
            {vendasDoMes.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
          </p>
          <p className="text-sm text-gray-500 mt-1">{currentMonth}</p>
        </Card>
      </div>
    </div>
  );
}

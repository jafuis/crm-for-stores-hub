
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, startOfDay, endOfDay, subDays } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { ptBR } from "date-fns/locale";
import { Target, DollarSign, Users, Calendar, ChevronDown, Bell, Gift } from "lucide-react";

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

interface Tarefa {
  id: string;
  titulo: string;
  concluida: boolean;
  dataVencimento: string;
}

export default function Dashboard() {
  const currentDate = new Date();
  const currentMonth = format(currentDate, 'MMMM yyyy', { locale: ptBR });
  const currentDayFormatted = format(currentDate, 'dd/MM/yyyy');
  
  const [metaDiaria, setMetaDiaria] = useState<number>(5000);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [aniversariantes, setAniversariantes] = useState<Cliente[]>([]);
  const [tarefasPendentes, setTarefasPendentes] = useState<Tarefa[]>([]);
  const [lastCheckedDay, setLastCheckedDay] = useState<string>('');
  const [vendasDiaAnterior, setVendasDiaAnterior] = useState<number>(0);
  
  const isAniversarioHoje = (dataAniversario: string): boolean => {
    if (!dataAniversario) return false;
    
    try {
      const aniversario = parseISO(dataAniversario);
      const hoje = new Date();
      return aniversario.getMonth() === hoje.getMonth() && 
             aniversario.getDate() === hoje.getDate();
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    const vendasSalvas = localStorage.getItem('vendas');
    const clientesSalvos = localStorage.getItem('clientes');
    const tarefasSalvas = localStorage.getItem('tarefas');
    const metaSalva = localStorage.getItem('metaDiaria');
    const ultimaVerificacao = localStorage.getItem('ultimaVerificacaoMes');
    const ultimoDiaVerificado = localStorage.getItem('ultimoDiaVerificado');

    setLastCheckedDay(ultimoDiaVerificado || '');
    
    if (vendasSalvas) {
      const todasVendas = JSON.parse(vendasSalvas);
      
      // Verifica se mudou o mês desde a última verificação
      const mesAtual = format(new Date(), 'yyyy-MM');
      if (!ultimaVerificacao || ultimaVerificacao !== mesAtual) {
        // Arquiva vendas do mês anterior
        const vendasAtualizadas = todasVendas.map((venda: Venda) => {
          const dataVenda = parseISO(venda.data);
          const mesVenda = format(dataVenda, 'yyyy-MM');
          
          if (mesVenda !== mesAtual && !venda.arquivada) {
            return { ...venda, arquivada: true };
          }
          return venda;
        });
        
        setVendas(vendasAtualizadas);
        localStorage.setItem('vendas', JSON.stringify(vendasAtualizadas));
        localStorage.setItem('ultimaVerificacaoMes', mesAtual);
      } else {
        setVendas(todasVendas);
      }
      
      // Verificar se mudou o dia - para resetar contadores diários
      const diaAtual = format(new Date(), 'yyyy-MM-dd');
      if (!ultimoDiaVerificado || ultimoDiaVerificado !== diaAtual) {
        localStorage.setItem('ultimoDiaVerificado', diaAtual);
        setLastCheckedDay(diaAtual);
      }

      // Calcular vendas do dia anterior
      const ontem = subDays(new Date(), 1);
      const vendasDiaAnterior = todasVendas
        .filter((venda: Venda) => {
          const dataVenda = parseISO(venda.data);
          return isWithinInterval(dataVenda, {
            start: startOfDay(ontem),
            end: endOfDay(ontem)
          }) && !venda.arquivada;
        })
        .reduce((total: number, venda: Venda) => total + venda.valor, 0);
      
      setVendasDiaAnterior(vendasDiaAnterior);
    }

    if (clientesSalvos) {
      const clientes = JSON.parse(clientesSalvos);
      setClientes(clientes);
      
      // Verificar aniversariantes
      const aniversariantesHoje = clientes.filter((cliente: Cliente) => 
        isAniversarioHoje(cliente.aniversario)
      );
      setAniversariantes(aniversariantesHoje);
    }
    
    if (tarefasSalvas) {
      const tarefas = JSON.parse(tarefasSalvas);
      const pendentes = tarefas.filter((tarefa: Tarefa) => !tarefa.concluida);
      setTarefasPendentes(pendentes);
    }

    if (metaSalva) {
      setMetaDiaria(Number(metaSalva));
    }
    
    // Verificar se é um novo dia a cada minuto
    const intervalId = setInterval(() => {
      const diaAtual = format(new Date(), 'yyyy-MM-dd');
      if (lastCheckedDay && lastCheckedDay !== diaAtual) {
        localStorage.setItem('ultimoDiaVerificado', diaAtual);
        setLastCheckedDay(diaAtual);
        window.location.reload(); // Recarregar para atualizar dados diários
      }
    }, 60000);

    return () => clearInterval(intervalId);
  }, [lastCheckedDay]);

  // Calcular vendas do dia (apenas não arquivadas)
  const vendasDoDia = vendas
    .filter(venda => {
      const dataVenda = parseISO(venda.data);
      return isWithinInterval(dataVenda, {
        start: startOfDay(new Date()),
        end: endOfDay(new Date())
      }) && !venda.arquivada;
    })
    .reduce((total, venda) => total + venda.valor, 0);

  // Calcular vendas do mês (apenas não arquivadas)
  const vendasDoMes = vendas
    .filter(venda => {
      const dataVenda = parseISO(venda.data);
      return isWithinInterval(dataVenda, {
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
      }) && !venda.arquivada;
    })
    .reduce((total, venda) => total + venda.valor, 0);

  // Total de clientes
  const totalClientes = clientes.length;

  // Calcular progresso da meta
  const progress = metaDiaria > 0 ? (vendasDoDia / metaDiaria) * 100 : 0;

  const handleDefinirMeta = (valor: number) => {
    if (valor > 0) {
      setMetaDiaria(valor);
      localStorage.setItem('metaDiaria', valor.toString());
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{currentMonth}</h1>
        <div className="text-sm text-muted-foreground">
          Hoje: {currentDayFormatted}
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-[#9b87f5]" />
            <h2 className="text-lg font-semibold">Total de Vendas do Dia</h2>
          </div>
          <div className="text-3xl font-bold">
            {vendasDoDia.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
          </div>
          {/* Adicionando total de vendas do dia anterior */}
          <div className="text-sm text-muted-foreground">
            Total de vendas do dia anterior: {vendasDiaAnterior.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Meta Diária</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
            <Progress value={progress} className="bg-gray-200" />
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
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-[#9b87f5]" />
            <h3 className="text-sm font-medium text-gray-500">Total de Clientes</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{totalClientes}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-[#9b87f5]" />
            <h3 className="text-sm font-medium text-gray-500">Vendas do Mês</h3>
          </div>
          <p className="text-2xl font-bold mt-2">
            {vendasDoMes.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
          </p>
          <p className="text-sm text-gray-500 mt-1">{currentMonth}</p>
        </Card>

        {/* Nova card para notificações */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-[#9b87f5]" />
            <h3 className="text-sm font-medium text-gray-500">Notificações</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Tarefas Pendentes</span>
              <span className="text-xl font-semibold">{tarefasPendentes.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center">
                <Gift className="w-4 h-4 mr-1 text-pink-500" />
                Aniversariantes Hoje
              </span>
              <span className="text-xl font-semibold">{aniversariantes.length}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

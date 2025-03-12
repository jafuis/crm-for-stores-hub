
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, startOfDay, endOfDay, subDays } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { ptBR } from "date-fns/locale";
import { Target, DollarSign, Users, Calendar, ArrowUp, ArrowDown, Bell, Gift, CheckSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'receita' | 'despesa';
  date: string;
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
  const [vendasDiaAnterior, setVendasDiaAnterior] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [newTransaction, setNewTransaction] = useState<{
    description: string;
    amount: string;
    type: 'receita' | 'despesa';
  }>({
    description: '',
    amount: '',
    type: 'receita'
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    // Setup real-time subscription for sales updates
    const salesChannel = supabase
      .channel('public:sales')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sales'
      }, () => {
        fetchData(); // Refresh data when sales change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(salesChannel);
    };
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Fetch sales data from Supabase
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (salesError) throw salesError;
      
      const vendasFormatadas = salesData.map(sale => ({
        id: sale.id,
        valor: sale.total_amount,
        data: sale.created_at,
        arquivada: sale.status === 'archived'
      }));
      
      setVendas(vendasFormatadas);
      
      // Fetch clients data
      const { data: clientsData, error: clientsError } = await supabase
        .from('customers')
        .select('*')
        .eq('owner_id', user.id);
        
      if (clientsError) throw clientsError;
      
      const clientesFormatados = clientsData.map(client => ({
        id: client.id,
        nome: client.name,
        telefone: client.phone || '',
        email: client.email || '',
        aniversario: client.birthday || '',
        classificacao: client.classification || 0
      }));
      
      setClientes(clientesFormatados);
      
      // Fetch tasks data
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('owner_id', user.id)
        .eq('status', 'pending');
        
      if (tasksError) throw tasksError;
      
      const tarefasFormatadas = tasksData.map(task => ({
        id: task.id,
        titulo: task.title,
        concluida: task.status === 'completed',
        dataVencimento: task.due_date || ''
      }));
      
      setTarefasPendentes(tarefasFormatadas);
      
      // Load saved meta diária from localStorage
      const metaSalva = localStorage.getItem('metaDiaria');
      if (metaSalva) {
        setMetaDiaria(Number(metaSalva));
      }
      
      // Check for birthday clients today
      const aniversariantesHoje = clientesFormatados.filter(cliente => 
        isAniversarioHoje(cliente.aniversario)
      );
      setAniversariantes(aniversariantesHoje);
      
      // Calculate previous day sales
      const ontem = subDays(new Date(), 1);
      const vendasDiaAnteriorTotal = vendasFormatadas
        .filter(venda => {
          const dataVenda = parseISO(venda.data);
          return isWithinInterval(dataVenda, {
            start: startOfDay(ontem),
            end: endOfDay(ontem)
          }) && !venda.arquivada;
        })
        .reduce((total, venda) => total + venda.valor, 0);
      
      setVendasDiaAnterior(vendasDiaAnteriorTotal);
      
      // Load transactions from localStorage
      const transactionsSaved = localStorage.getItem(`transactions_${user.id}`);
      if (transactionsSaved) {
        setTransactions(JSON.parse(transactionsSaved));
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar seus dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const vendasDoDia = vendas
    .filter(venda => {
      const dataVenda = parseISO(venda.data);
      return isWithinInterval(dataVenda, {
        start: startOfDay(new Date()),
        end: endOfDay(new Date())
      }) && !venda.arquivada;
    })
    .reduce((total, venda) => total + venda.valor, 0);

  const vendasDoMes = vendas
    .filter(venda => {
      const dataVenda = parseISO(venda.data);
      return isWithinInterval(dataVenda, {
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
      }) && !venda.arquivada;
    })
    .reduce((total, venda) => total + venda.valor, 0);

  const totalClientes = clientes.length;

  const progress = metaDiaria > 0 ? (vendasDoDia / metaDiaria) * 100 : 0;

  const handleDefinirMeta = (valor: number) => {
    if (valor > 0) {
      setMetaDiaria(valor);
      localStorage.setItem('metaDiaria', valor.toString());
    }
  };
  
  const handleAddTransaction = () => {
    if (!newTransaction.description || !newTransaction.amount || !user) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }
    
    const amount = parseFloat(newTransaction.amount);
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Valor inválido",
        description: "Insira um valor positivo",
        variant: "destructive",
      });
      return;
    }
    
    const novaTransacao: Transaction = {
      id: crypto.randomUUID(),
      description: newTransaction.description,
      amount,
      type: newTransaction.type,
      date: new Date().toISOString()
    };
    
    const transacoesAtualizadas = [...transactions, novaTransacao];
    setTransactions(transacoesAtualizadas);
    
    // Salvar no localStorage
    localStorage.setItem(`transactions_${user.id}`, JSON.stringify(transacoesAtualizadas));
    
    // Limpar campos
    setNewTransaction({
      description: '',
      amount: '',
      type: 'receita'
    });
    
    toast({
      title: "Transação registrada",
      description: `${newTransaction.type === 'receita' ? 'Receita' : 'Despesa'} adicionada com sucesso!`,
    });
  };
  
  const totalReceitas = transactions
    .filter(transaction => transaction.type === 'receita')
    .reduce((total, transaction) => total + transaction.amount, 0);
    
  const totalDespesas = transactions
    .filter(transaction => transaction.type === 'despesa')
    .reduce((total, transaction) => total + transaction.amount, 0);
    
  const saldoAtual = totalReceitas - totalDespesas;
  
  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{currentMonth}</h1>
        <div className="text-sm text-muted-foreground">
          Hoje: {currentDayFormatted}
        </div>
      </div>

      <Tabs defaultValue="vendas" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vendas">Vendas e Metas</TabsTrigger>
          <TabsTrigger value="financeiro">Receitas e Despesas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="vendas" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-[#9b87f5]" />
                <h2 className="text-lg font-semibold">Total de Vendas do Dia</h2>
              </div>
              <div className="text-3xl font-bold">
                {formatarValor(vendasDoDia)}
              </div>
              <div className="text-sm text-muted-foreground">
                Total de vendas do dia anterior: {formatarValor(vendasDiaAnterior)}
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

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 date-icon" />
                <h3 className="text-sm font-medium text-gray-500">Vendas do Mês</h3>
              </div>
              <p className="text-2xl font-bold mt-2">
                {formatarValor(vendasDoMes)}
              </p>
              <p className="text-sm text-gray-500 mt-1">{currentMonth}</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Gift className="w-5 h-5 text-pink-500" />
                <h3 className="text-sm font-medium text-gray-500">Notificações</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center">
                    <Gift className="w-4 h-4 mr-1 text-blue-500" />
                    Aniversariantes Hoje
                  </span>
                  <span className="text-xl font-semibold">{aniversariantes.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center">
                    <CheckSquare className="w-4 h-4 mr-1 text-[#9b87f5]" />
                    Tarefas Pendentes
                  </span>
                  <span className="text-xl font-semibold">{tarefasPendentes.length}</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="financeiro" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUp className="h-5 w-5 text-green-500" />
                  Total de Receitas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{formatarValor(totalReceitas)}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowDown className="h-5 w-5 text-red-500" />
                  Total de Despesas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">{formatarValor(totalDespesas)}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-500" />
                  Saldo Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatarValor(saldoAtual)}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Registrar Nova Transação</h2>
            <div className="grid gap-4">
              <Input
                placeholder="Descrição"
                value={newTransaction.description}
                onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
              />
              
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Valor"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
              />
              
              <div className="flex gap-4">
                <Button 
                  variant={newTransaction.type === 'receita' ? 'default' : 'outline'}
                  className={newTransaction.type === 'receita' ? 'bg-green-600 hover:bg-green-700' : ''}
                  onClick={() => setNewTransaction({...newTransaction, type: 'receita'})}
                >
                  <ArrowUp className="h-4 w-4 mr-2" />
                  Receita
                </Button>
                <Button 
                  variant={newTransaction.type === 'despesa' ? 'default' : 'outline'}
                  className={newTransaction.type === 'despesa' ? 'bg-red-600 hover:bg-red-700' : ''}
                  onClick={() => setNewTransaction({...newTransaction, type: 'despesa'})}
                >
                  <ArrowDown className="h-4 w-4 mr-2" />
                  Despesa
                </Button>
              </div>
              
              <Button onClick={handleAddTransaction} className="w-full">
                Registrar Transação
              </Button>
            </div>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Últimas Transações</h2>
            <div className="space-y-4">
              {transactions.length > 0 ? (
                transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 5)
                  .map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'receita' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'receita' ? (
                            <ArrowUp className={`w-5 h-5 text-green-600`} />
                          ) : (
                            <ArrowDown className={`w-5 h-5 text-red-600`} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(parseISO(transaction.date), "dd/MM/yyyy HH:mm")}
                          </p>
                        </div>
                      </div>
                      <span className={`font-semibold ${
                        transaction.type === 'receita' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'receita' ? '+' : '-'} {formatarValor(transaction.amount)}
                      </span>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma transação registrada ainda.
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

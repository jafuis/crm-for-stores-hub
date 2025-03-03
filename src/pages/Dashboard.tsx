
import { Card } from "@/components/ui/card";
import { Users, ShoppingCart, Package, CheckSquare, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

// Definindo a tipagem para vendas
interface Venda {
  id: string;
  cliente: string;
  valor: number;
  data: string;
  produtos: Array<{
    id: string;
    nome: string;
    quantidade: number;
    preco: number;
  }>;
  status: "pendente" | "concluida" | "cancelada";
}

// Definindo a tipagem para clientes
interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  aniversario: string;
}

// Definindo a tipagem para produtos
interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  categoria: string;
  fornecedor: string;
}

// Definindo a tipagem para tarefas
interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  concluida: boolean;
  dataVencimento: string;
}

export default function Dashboard() {
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalVendasDia, setTotalVendasDia] = useState(0);
  const [totalVendasDiaAnterior, setTotalVendasDiaAnterior] = useState(0);
  const [totalProdutos, setTotalProdutos] = useState(0);
  const [tarefasPendentes, setTarefasPendentes] = useState(0);
  const [vendasRecentes, setVendasRecentes] = useState<Venda[]>([]);
  const [clientesRecentes, setClientesRecentes] = useState<Cliente[]>([]);
  const [hoje] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [ontem] = useState(format(subDays(new Date(), 1), 'yyyy-MM-dd'));

  useEffect(() => {
    // Carregar dados do localStorage
    const carregarDados = () => {
      // Clientes
      const clientesSalvos = localStorage.getItem('clientes');
      const clientes = clientesSalvos ? JSON.parse(clientesSalvos) : [];
      setTotalClientes(clientes.length);
      setClientesRecentes(clientes.slice(0, 5));

      // Vendas
      const vendasSalvas = localStorage.getItem('vendas');
      const vendas = vendasSalvas ? JSON.parse(vendasSalvas) : [];
      
      // Filtrar e calcular vendas do dia atual
      const vendasHoje = vendas.filter((venda: Venda) => 
        venda.data.startsWith(hoje) && venda.status === "concluida"
      );
      const totalHoje = vendasHoje.reduce((acc: number, venda: Venda) => acc + venda.valor, 0);
      setTotalVendasDia(totalHoje);
      
      // Filtrar e calcular vendas do dia anterior
      const vendasOntem = vendas.filter((venda: Venda) => 
        venda.data.startsWith(ontem) && venda.status === "concluida"
      );
      const totalOntem = vendasOntem.reduce((acc: number, venda: Venda) => acc + venda.valor, 0);
      setTotalVendasDiaAnterior(totalOntem);
      
      setVendasRecentes(vendas.slice(0, 5));

      // Produtos
      const produtosSalvos = localStorage.getItem('produtos');
      const produtos = produtosSalvos ? JSON.parse(produtosSalvos) : [];
      setTotalProdutos(produtos.length);

      // Tarefas
      const tarefasSalvas = localStorage.getItem('tarefas');
      const tarefas = tarefasSalvas ? JSON.parse(tarefasSalvas) : [];
      const pendentes = tarefas.filter((tarefa: Tarefa) => !tarefa.concluida);
      setTarefasPendentes(pendentes.length);
    };

    carregarDados();

    // Adicionar listener para atualizar dados quando o localStorage mudar
    window.addEventListener('storage', carregarDados);

    // Limpar o listener quando o componente for desmontado
    return () => {
      window.removeEventListener('storage', carregarDados);
    };
  }, [hoje, ontem]);

  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatarData = (data: string) => {
    const dataObj = new Date(data);
    return format(dataObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  return (
    <div className="space-y-6 animate-fadeIn px-4 md:px-0">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Total de Clientes</p>
              <h2 className="text-2xl font-bold">{totalClientes}</h2>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Total de Vendas do Dia</p>
              <h2 className="text-2xl font-bold">{formatarValor(totalVendasDia)}</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Dia anterior: {formatarValor(totalVendasDiaAnterior)}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Total de Produtos</p>
              <h2 className="text-2xl font-bold">{totalProdutos}</h2>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Tarefas Pendentes</p>
              <h2 className="text-2xl font-bold">{tarefasPendentes}</h2>
            </div>
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-amber-500" />
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Vendas Recentes</h3>
          </div>
          <div className="p-0">
            {vendasRecentes.length > 0 ? (
              <ul className="divide-y">
                {vendasRecentes.map((venda) => (
                  <li key={venda.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{venda.cliente}</p>
                        <p className="text-sm text-muted-foreground">{formatarData(venda.data)}</p>
                      </div>
                      <p className={`font-semibold ${venda.status === 'concluida' ? 'text-green-600' : venda.status === 'cancelada' ? 'text-red-600' : 'text-amber-600'}`}>
                        {formatarValor(venda.valor)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                Nenhuma venda registrada
              </div>
            )}
          </div>
        </Card>
        
        <Card className="shadow-md">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Clientes Recentes</h3>
          </div>
          <div className="p-0">
            {clientesRecentes.length > 0 ? (
              <ul className="divide-y">
                {clientesRecentes.map((cliente) => (
                  <li key={cliente.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{cliente.nome}</p>
                        <p className="text-sm text-muted-foreground">{cliente.telefone}</p>
                      </div>
                      {cliente.aniversario && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3 mr-1" />
                          {format(new Date(cliente.aniversario), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                Nenhum cliente registrado
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

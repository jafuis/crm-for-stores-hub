import { useState, useEffect } from "react";
import {
  Calculator,
  CalendarRange,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Gauge,
  ListTodo,
  Mail,
  Menu,
  Package,
  Phone,
  Settings,
  ShoppingCart,
  Star,
  UserRound,
  Users,
  Wallet,
  BellRing,
  CakeIcon,
  BarChart4,
  Clock,
  DollarSign,
  Home,
  Search,
  CircleOff,
  BellOff,
  WalletCards,
  Rocket,
  FolderArchive
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Tarefa {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  priority: string | null;
  due_date: string | null;
  owner_id: string | null;
}

interface ContaPagar {
  id: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  status: string;
  importante: boolean;
}

interface Cliente {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  birthday: string | null;
}

export default function AppSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const [isAccountSubmenuOpen, setIsAccountSubmenuOpen] = useState(false);
  const [notificacoesTarefas, setNotificacoesTarefas] = useState<number>(0);
  const [notificacoesAniversariantes, setNotificacoesAniversariantes] = useState<number>(0);
  const [notificacoesContasPagar, setNotificacoesContasPagar] = useState<number>(0);
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  // Process notifications
  useEffect(() => {
    if (user) {
      buscarTarefasVencidas();
      buscarAniversariantes();
      buscarContasVencidas();
    }
  }, [user]);

  const buscarTarefasVencidas = async () => {
    if (!user) return;
    
    try {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('owner_id', user.id)
        .eq('status', 'pending')
        .lte('due_date', hoje.toISOString());
      
      if (error) throw error;
      
      if (data) {
        setNotificacoesTarefas(data.length);
      }
    } catch (error) {
      console.error("Erro ao buscar tarefas vencidas:", error);
    }
  };

  const buscarAniversariantes = async () => {
    if (!user) return;
    
    try {
      const hoje = new Date();
      const diaHoje = hoje.getDate();
      const mesHoje = hoje.getMonth() + 1;
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('owner_id', user.id);
      
      if (error) throw error;
      
      if (data) {
        const aniversariantes = data.filter(cliente => {
          if (cliente.birthday) {
            const [ano, mes, dia] = cliente.birthday.split('-');
            return parseInt(dia) === diaHoje && parseInt(mes) === mesHoje;
          }
          return false;
        });
        
        setNotificacoesAniversariantes(aniversariantes.length);
      }
    } catch (error) {
      console.error("Erro ao buscar aniversariantes:", error);
    }
  };

  const buscarContasVencidas = async () => {
    if (!user) return;
    
    try {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('financas')
        .select('*')
        .eq('owner_id', user.id)
        .eq('tipo', 'despesa')
        .or(`status.eq.pendente,status.eq.vencida`)
        .order('data_vencimento', { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        // Filtrar contas vencidas
        const contasVencidas = data.filter(conta => {
          if (conta.data_vencimento) {
            const dataVencimento = new Date(conta.data_vencimento);
            dataVencimento.setHours(0, 0, 0, 0);
            return dataVencimento < hoje && (conta.status === 'pendente' || conta.status === 'vencida');
          }
          return false;
        });
        
        // Atualizar status das contas vencidas se necessário
        const atualizacoes = contasVencidas
          .filter(conta => conta.status === 'pendente')
          .map(async (conta) => {
            try {
              const { error: updateError } = await supabase
                .from('financas')
                .update({ status: 'vencida' })
                .eq('id', conta.id);
              
              if (updateError) {
                console.error("Erro ao atualizar status da conta:", updateError);
              }
            } catch (err) {
              console.error("Erro ao atualizar status da conta:", err);
            }
          });
        
        // Formatando as contas vencidas
        const contasFormatadas = contasVencidas.map(conta => {
          const dataVencimento = new Date(conta.data_vencimento);
          const status = dataVencimento < hoje ? 'vencida' : conta.status;
          
          return {
            id: conta.id,
            descricao: conta.descricao,
            data_vencimento: conta.data_vencimento,
            valor: conta.valor,
            status: status,
            importante: conta.importante || false
          };
        });
        
        setNotificacoesContasPagar(contasFormatadas.length);
      }
    } catch (error) {
      console.error("Erro ao buscar contas vencidas:", error);
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleSubmenu = () => {
    setIsSubmenuOpen(!isSubmenuOpen);
  };

  const toggleAccountSubmenu = () => {
    setIsAccountSubmenuOpen(!isAccountSubmenuOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const renderSidebarLinks = () => (
    <div className="space-y-2">
      <Link to="/dashboard" className={`flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${isActivePath('/dashboard') ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>
        <Home className="w-4 h-4 mr-2" />
        Dashboard
      </Link>

      <Link to="/tarefas" className={`flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${isActivePath('/tarefas') ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>
        <ListTodo className="w-4 h-4 mr-2" />
        Tarefas
        {notificacoesTarefas > 0 && (
          <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full bg-red-500 text-white">
            {notificacoesTarefas}
          </span>
        )}
      </Link>

      <Link to="/clientes" className={`flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${isActivePath('/clientes') ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>
        <Users className="w-4 h-4 mr-2" />
        Clientes
        {notificacoesAniversariantes > 0 && (
          <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full bg-red-500 text-white">
            {notificacoesAniversariantes}
          </span>
        )}
      </Link>

      <Link to="/produtos" className={`flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${isActivePath('/produtos') ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>
        <Package className="w-4 h-4 mr-2" />
        Produtos
      </Link>

      <Link to="/fornecedores" className={`flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${isActivePath('/fornecedores') ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>
        <Rocket className="w-4 h-4 mr-2" />
        Fornecedores
      </Link>

      <Link to="/pedidos" className={`flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${isActivePath('/pedidos') ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>
        <ShoppingCart className="w-4 h-4 mr-2" />
        Pedidos
      </Link>

      <Link to="/orcamentos" className={`flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${isActivePath('/orcamentos') ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>
        <Calculator className="w-4 h-4 mr-2" />
        Orçamentos
      </Link>

      <Link to="/financas" className={`flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${isActivePath('/financas') ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>
        <WalletCards className="w-4 h-4 mr-2" />
        Finanças
      </Link>

      <Link to="/contas-pagar" className={`flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${isActivePath('/contas-pagar') ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>
        <DollarSign className="w-4 h-4 mr-2" />
        Contas a Pagar
        {notificacoesContasPagar > 0 && (
          <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full bg-red-500 text-white">
            {notificacoesContasPagar}
          </span>
        )}
      </Link>

      <Link to="/relatorios" className={`flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${isActivePath('/relatorios') ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>
        <BarChart4 className="w-4 h-4 mr-2" />
        Relatórios
      </Link>

      <Link to="/projetos" className={`flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${isActivePath('/projetos') ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>
        <FolderArchive className="w-4 h-4 mr-2" />
        Projetos
      </Link>

      <div>
        <Button
          variant="ghost"
          className="justify-start px-2 w-full hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={toggleSubmenu}
        >
          <Settings className="w-4 h-4 mr-2" />
          <span>Configurações</span>
          {isSubmenuOpen ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
        </Button>
        {isSubmenuOpen && (
          <div className="pl-4 space-y-2">
            <Link to="/configuracoes/usuarios" className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
              <Users className="w-4 h-4 mr-2" />
              Usuários
            </Link>
            <Link to="/configuracoes/notificacoes" className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
              <BellRing className="w-4 h-4 mr-2" />
              Notificações
            </Link>
          </div>
        )}
      </div>

      <div>
        <Button
          variant="ghost"
          className="justify-start px-2 w-full hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={toggleAccountSubmenu}
        >
          <UserRound className="w-4 h-4 mr-2" />
          <span>Conta</span>
          {isAccountSubmenuOpen ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
        </Button>
        {isAccountSubmenuOpen && (
          <div className="pl-4 space-y-2">
            <Link to="/minha-conta" className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
              <UserRound className="w-4 h-4 mr-2" />
              Minha Conta
            </Link>
            <Link to="/logout" className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
              <CircleOff className="w-4 h-4 mr-2" />
              Logout
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  const renderMobileNav = () => (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-64">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="font-bold">
              Super CRM
            </Link>
            <Button variant="ghost" size="icon" onClick={closeSidebar}>
              <CircleOff className="w-5 h-5" />
            </Button>
          </div>
          {user && (
            <div className="flex items-center space-x-2 mb-4">
              <Avatar>
                <AvatarFallback>{user?.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">{user.email}</p>
                <p className="text-xs text-muted-foreground">
                  {user.id}
                </p>
              </div>
            </div>
          )}
          {renderSidebarLinks()}
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <>
      {renderMobileNav()}

      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:h-screen md:border-r md:dark:border-gray-700">
        <div className="flex items-center justify-between h-16 px-4 border-b dark:border-gray-700">
          <Link to="/" className="font-bold">
            Super CRM
          </Link>
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        {user && (
          <div className="flex items-center space-x-2 px-4 py-3 border-b dark:border-gray-700">
            <Avatar>
              <AvatarFallback>{user?.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <p className="text-sm font-medium leading-none">{user.email}</p>
              <p className="text-xs text-muted-foreground">
                {user.id}
              </p>
            </div>
          </div>
        )}

        <div className="flex-grow p-4 overflow-y-auto">
          {renderSidebarLinks()}
        </div>
      </div>
    </>
  );
}

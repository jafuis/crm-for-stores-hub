import {
  Users,
  ShoppingCart,
  Package,
  Truck,
  CheckSquare,
  Settings,
  Home,
  Menu,
  Gift,
  MessageSquare,
  PartyPopper,
  FileText,
  Lightbulb,
  User,
  Calendar,
  Mail,
  DollarSign
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { format, parseISO, isValid, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Tarefa {
  id: string;
  titulo: string;
  concluida: boolean;
  dataVencimento: string;
}

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  aniversario: string;
  classificacao: number;
}

const menuItems = [
  { title: "Dashboard", icon: Home, path: "/" },
  { title: "Clientes", icon: Users, path: "/clientes" },
  { title: "Pedidos", icon: Package, path: "/pedidos" },
  { title: "Vendas", icon: ShoppingCart, path: "/vendas" },
  { title: "Estoque", icon: Package, path: "/estoque" },
  { title: "Fornecedores", icon: Truck, path: "/fornecedores" },
  { title: "Finanças", icon: DollarSign, path: "/financas" },
  { title: "Tarefas", icon: CheckSquare, path: "/tarefas" },
  { title: "Aniversariantes", icon: Gift, path: "/aniversariantes" },
  { title: "Relatórios", icon: FileText, path: "/relatorios" },
  { title: "Novos Projetos", icon: Lightbulb, path: "/novos-projetos" },
  { title: "Configurações", icon: Settings, path: "/configuracoes" },
  { title: "Minha Conta", icon: User, path: "/minha-conta" },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { openMobile, setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();
  const [tarefasPendentes, setTarefasPendentes] = useState<Tarefa[]>([]);
  const [aniversariantes, setAniversariantes] = useState<Cliente[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchTarefasPendentes();
    fetchAniversariantes();

    const taskChannel = supabase
      .channel('public:tasks')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'tasks'
      }, fetchTarefasPendentes)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'tasks'
      }, fetchTarefasPendentes)
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'tasks'
      }, fetchTarefasPendentes)
      .subscribe();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('clientDataChanged', fetchAniversariantes);

    return () => {
      supabase.removeChannel(taskChannel);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('clientDataChanged', fetchAniversariantes);
    };
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchAniversariantes();
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'clientes') {
      fetchAniversariantes();
    }
  };

  const fetchTarefasPendentes = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'pending')
        .eq('owner_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) {
        throw error;
      }

      const tarefasFormatadas = data?.map(task => ({
        id: task.id,
        titulo: task.title,
        concluida: false,
        dataVencimento: task.due_date || new Date().toISOString().split('T')[0]
      })) || [];

      setTarefasPendentes(tarefasFormatadas);
    } catch (error) {
      console.error("Erro ao buscar tarefas pendentes:", error);
    }
  };

  const fetchAniversariantes = async () => {
    try {
      const clientesSalvos = localStorage.getItem('clientes');
      if (clientesSalvos) {
        const clientes = JSON.parse(clientesSalvos);
        const hoje = new Date();
        
        const aniversariantesHoje = clientes.filter((cliente: Cliente) => {
          if (!cliente.aniversario) return false;
          
          try {
            const aniversario = parseISO(cliente.aniversario);
            if (!isValid(aniversario)) return false;
            
            return (
              aniversario.getDate() === hoje.getDate() && 
              aniversario.getMonth() === hoje.getMonth()
            );
          } catch (error) {
            console.error("Erro ao processar aniversário:", error);
            return false;
          }
        });
        
        setAniversariantes(aniversariantesHoje);
        console.log("Aniversariantes hoje:", aniversariantesHoje.length);
        
        if (aniversariantesHoje.length > 0 && location.pathname !== "/aniversariantes") {
          toast({
            title: "Aniversariantes hoje!",
            description: `Há ${aniversariantesHoje.length} cliente(s) fazendo aniversário hoje.`,
          });
        }
      } else {
        setAniversariantes([]);
      }
    } catch (error) {
      console.error("Erro ao buscar aniversariantes:", error);
      setAniversariantes([]);
    }
  };

  const toggleMobileMenu = () => {
    setOpenMobile(!openMobile);
  };
  
  const hasActiveBirthdays = aniversariantes.length > 0;
  const hasPendingTasks = tarefasPendentes.length > 0;

  const renderSidebarContent = () => (
    <SidebarContent className="bg-white dark:bg-gray-800 h-full">
      <div className="px-3 py-4 border-b dark:border-gray-700">
        <h1 className="text-xl font-bold text-primary dark:text-white">CRM PARA LOJAS</h1>
      </div>
      <SidebarGroup>
        <SidebarGroupLabel className="dark:text-gray-300">Menu</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) {
                      setOpenMobile(false);
                    }
                  }}
                  className={`text-base md:text-base ${isMobile ? 'text-lg' : ''} dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white ${location.pathname === item.path ? "bg-secondary dark:bg-gray-700 dark:text-white" : ""}`}
                >
                  <div className="relative">
                    {item.title === "Aniversariantes" ? (
                      <div className={`${hasActiveBirthdays ? 'animate-pulse' : ''}`}>
                        <Gift className={`${isMobile ? 'w-6 h-6' : 'w-5 h-5'} ${hasActiveBirthdays ? 'text-blue-500' : ''}`} />
                      </div>
                    ) : item.title === "Tarefas" ? (
                      <div className={`${hasPendingTasks ? 'animate-pulse' : ''}`}>
                        <CheckSquare className={`${isMobile ? 'w-6 h-6' : 'w-5 h-5'} ${hasPendingTasks ? 'text-blue-500' : ''}`} />
                      </div>
                    ) : (
                      <item.icon className={`${isMobile ? 'w-6 h-6' : 'w-5 h-5'}`} />
                    )}
                    
                    {(item.path === "/aniversariantes" && hasActiveBirthdays) && (
                      <>
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
                      </>
                    )}

                    {(item.path === "/tarefas" && hasPendingTasks && location.pathname !== "/tarefas") && (
                      <>
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
                      </>
                    )}
                  </div>
                  <span className={`${item.title === "Aniversariantes" && hasActiveBirthdays ? 'text-blue-500 font-medium' : ''} ${item.title === "Tarefas" && hasPendingTasks ? 'text-blue-500 font-medium' : ''}`}>
                    {item.title}
                  </span>
                  
                  {item.title === "Aniversariantes" && hasActiveBirthdays && (
                    <div className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                      {aniversariantes.length}
                    </div>
                  )}
                  
                  {item.title === "Tarefas" && hasPendingTasks && (
                    <div className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                      {tarefasPendentes.length}
                    </div>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 right-4 z-[100] md:hidden bg-white dark:bg-gray-700 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 dark:border-gray-600 shadow-md"
        onClick={toggleMobileMenu}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {isMobile ? (
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetContent 
            side="left" 
            className="w-[280px] p-0 bg-white dark:bg-gray-800 dark:border-gray-700"
          >
            {renderSidebarContent()}
          </SheetContent>
        </Sheet>
      ) : (
        <Sidebar className="hidden md:block">
          {renderSidebarContent()}
        </Sidebar>
      )}
    </>
  );
}

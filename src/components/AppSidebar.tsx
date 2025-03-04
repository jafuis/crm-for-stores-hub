
import {
  Users,
  ShoppingCart,
  Package,
  Truck,
  CheckSquare,
  Bell,
  Settings,
  Home,
  Menu,
  Gift,
  MessageSquare,
  PartyPopper,
  FileText,
  Lightbulb,
  User
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
import { format, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  aniversario: string;
}

interface Tarefa {
  id: string;
  titulo: string;
  concluida: boolean;
  dataVencimento: string;
}

const menuItems = [
  { title: "Dashboard", icon: Home, path: "/" },
  { title: "Clientes", icon: Users, path: "/clientes" },
  { title: "Vendas", icon: ShoppingCart, path: "/vendas" },
  { title: "Estoque", icon: Package, path: "/estoque" },
  { title: "Fornecedores", icon: Truck, path: "/fornecedores" },
  { title: "Tarefas", icon: CheckSquare, path: "/tarefas" },
  { title: "Notificações", icon: Bell, path: "/notificacoes" },
  { title: "Aniversariantes", icon: Gift, path: "/aniversariantes", extraIcon: PartyPopper },
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
  const [aniversariantes, setAniversariantes] = useState<Cliente[]>([]);
  const [tarefasPendentes, setTarefasPendentes] = useState<Tarefa[]>([]);
  const [notificacoesAcknowledged, setNotificacoesAcknowledged] = useState<string[]>([]);
  const { toast } = useToast();

  const isAniversarioHoje = (dataAniversario: string): boolean => {
    if (!dataAniversario) return false;
    
    try {
      const aniversario = parseISO(dataAniversario);
      
      if (!isValid(aniversario)) {
        return false;
      }
      
      const hoje = new Date();
      return aniversario.getMonth() === hoje.getMonth() && 
             aniversario.getDate() === hoje.getDate();
    } catch (error) {
      console.error("Erro ao verificar aniversário:", error);
      return false;
    }
  };

  const checkForBirthdaysAndTasks = () => {
    const clientesSalvos = localStorage.getItem('clientes');
    const clientes = clientesSalvos ? JSON.parse(clientesSalvos) : [];
    
    const aniversariantesHoje = clientes.filter((cliente: Cliente) => 
      isAniversarioHoje(cliente.aniversario)
    );
    
    setAniversariantes(aniversariantesHoje);

    const tarefasSalvas = localStorage.getItem('tarefas');
    const tarefas = tarefasSalvas ? JSON.parse(tarefasSalvas) : [];
    const pendentes = tarefas.filter((tarefa: Tarefa) => !tarefa.concluida);
    setTarefasPendentes(pendentes);
    
    // Get notifications acknowledged (only for notifications page)
    const acknowledged = localStorage.getItem('notificacoesAcknowledged') || '[]';
    setNotificacoesAcknowledged(JSON.parse(acknowledged));
  };

  useEffect(() => {
    checkForBirthdaysAndTasks();

    const interval = setInterval(checkForBirthdaysAndTasks, 1000);

    window.addEventListener('storage', checkForBirthdaysAndTasks);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkForBirthdaysAndTasks);
    };
  }, []);

  const toggleMobileMenu = () => {
    setOpenMobile(!openMobile);
  };
  
  // Filtered birthdays that haven't been acknowledged in notifications page
  const filteredNotificacoes = aniversariantes.filter(
    aniversariante => !notificacoesAcknowledged.includes(aniversariante.id)
  );

  // Check if we have active notifications (unacknowledged birthdays or pending tasks)
  const hasActiveNotifications = filteredNotificacoes.length > 0 || tarefasPendentes.length > 0;

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
                  className={`text-base dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white ${location.pathname === item.path ? "bg-secondary dark:bg-gray-700 dark:text-white" : ""}`}
                >
                  <div className="relative">
                    <item.icon className="w-5 h-5" />
                    {/* Only show notification indicator on the notifications page if there are active notifications */}
                    {(item.path === "/notificacoes" && hasActiveNotifications) && (
                      <>
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                      </>
                    )}
                    {/* Always show notification indicator for aniversariantes if there are any birthdays */}
                    {(item.path === "/aniversariantes" && aniversariantes.length > 0) && (
                      <>
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full animate-ping" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full" />
                      </>
                    )}
                  </div>
                  <span>{item.title}</span>
                  {item.path === "/aniversariantes" && aniversariantes.length > 0 && (
                    <div className="flex items-center gap-1">
                      <PartyPopper className="w-4 h-4 text-pink-500 animate-bounce" />
                      <span className="text-xs bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300 px-2 py-0.5 rounded-full">
                        {aniversariantes.length}
                      </span>
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

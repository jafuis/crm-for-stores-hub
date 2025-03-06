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
import { supabase } from "@/integrations/supabase/client";

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
  const { toast } = useToast();

  useEffect(() => {
    fetchTarefasPendentes();

    // Setup real-time subscription for task updates
    const channel = supabase
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTarefasPendentes = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'pending');

      if (error) {
        throw error;
      }

      // Transformar os dados do banco para o formato que usamos na interface
      const tarefasFormatadas = data.map(task => ({
        id: task.id,
        titulo: task.title,
        concluida: false,
        dataVencimento: task.due_date || new Date().toISOString().split('T')[0]
      }));

      setTarefasPendentes(tarefasFormatadas);
    } catch (error) {
      console.error("Erro ao buscar tarefas pendentes:", error);
    }
  };

  const toggleMobileMenu = () => {
    setOpenMobile(!openMobile);
  };
  
  // Check if we have active notifications (just pending tasks)
  const hasActiveNotifications = tarefasPendentes.length > 0;

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
                    <item.icon className={`${isMobile ? 'w-6 h-6' : 'w-5 h-5'}`} />
                    {/* Only show notification indicator on the notifications page if there are pending tasks 
                       AND we're not currently on the notifications page */}
                    {(item.path === "/notificacoes" && hasActiveNotifications && location.pathname !== "/notificacoes") && (
                      <>
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                      </>
                    )}
                  </div>
                  <span>{item.title}</span>
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

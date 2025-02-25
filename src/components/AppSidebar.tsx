
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
import { format } from "date-fns";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  aniversario: string;
}

const menuItems = [
  { title: "Dashboard", icon: Home, path: "/" },
  { title: "Clientes", icon: Users, path: "/clientes" },
  { title: "Vendas", icon: ShoppingCart, path: "/vendas" },
  { title: "Estoque", icon: Package, path: "/estoque" },
  { title: "Fornecedores", icon: Truck, path: "/fornecedores" },
  { title: "Tarefas", icon: CheckSquare, path: "/tarefas" },
  { title: "Notificações", icon: Bell, path: "/notificacoes" },
  { title: "Configurações", icon: Settings, path: "/configuracoes" },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { openMobile, setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();
  const [aniversariantes, setAniversariantes] = useState<Cliente[]>([]);

  useEffect(() => {
    // Carregar aniversariantes do dia
    const clientesSalvos = localStorage.getItem('clientes');
    const clientes = clientesSalvos ? JSON.parse(clientesSalvos) : [];
    
    const hoje = format(new Date(), 'MM-dd');
    const aniversariantesHoje = clientes.filter((cliente: Cliente) => {
      const aniversario = new Date(cliente.aniversario);
      return format(aniversario, 'MM-dd') === hoje;
    });
    
    setAniversariantes(aniversariantesHoje);
  }, []);

  const toggleMobileMenu = () => {
    setOpenMobile(!openMobile);
  };

  const enviarMensagemWhatsApp = (telefone: string, nome: string) => {
    const mensagem = `Feliz aniversário, ${nome}! 🎉`;
    const url = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  const renderSidebarContent = () => (
    <SidebarContent className="bg-white h-full">
      <div className="px-3 py-4 border-b">
        <h1 className="text-xl font-bold text-primary">CRM PARA LOJAS</h1>
      </div>
      <SidebarGroup>
        <SidebarGroupLabel>Menu</SidebarGroupLabel>
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
                  className={location.pathname === item.path ? "bg-secondary" : ""}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {aniversariantes.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel>Aniversários Hoje</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {aniversariantes.map((aniversariante) => (
                <SidebarMenuItem key={aniversariante.id}>
                  <SidebarMenuButton
                    onClick={() => enviarMensagemWhatsApp(aniversariante.telefone, aniversariante.nome)}
                  >
                    <Gift className="w-5 h-5 text-pink-500" />
                    <span>{aniversariante.nome}</span>
                    <MessageSquare className="w-4 h-4 ml-auto text-pink-500" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}
    </SidebarContent>
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-[100] md:hidden"
        onClick={toggleMobileMenu}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {isMobile ? (
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetContent 
            side="left" 
            className="w-[280px] p-0 bg-white"
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

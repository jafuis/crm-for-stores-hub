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
  PartyPopper
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

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
  { title: "Aniversariantes", icon: Gift, path: "/aniversariantes", extraIcon: PartyPopper },
  { title: "Configurações", icon: Settings, path: "/configuracoes" },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { openMobile, setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();
  const [aniversariantes, setAniversariantes] = useState<Cliente[]>([]);
  const { toast } = useToast();
  const { profile, signOut } = useAuth();

  useEffect(() => {
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

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/auth/signin");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: "Não foi possível fazer logout",
      });
    }
  };

  const renderSidebarContent = () => (
    <SidebarContent className="bg-white h-full flex flex-col">
      <div className="px-3 py-4 border-b">
        <h1 className="text-xl font-bold text-primary">CRM PARA LOJAS</h1>
        {profile && (
          <div className="mt-2 text-sm text-gray-600">
            <p className="font-medium">{profile.name}</p>
            <p className="text-xs">{profile.area}</p>
          </div>
        )}
      </div>
      <SidebarGroup className="flex-1">
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
                  {item.path === "/aniversariantes" && aniversariantes.length > 0 && (
                    <PartyPopper className="w-5 h-5 ml-2 text-pink-500 animate-bounce" />
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <div className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleLogout}
        >
          Sair
        </Button>
      </div>
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


import {
  Users,
  ShoppingCart,
  Package,
  Truck,
  CheckSquare,
  Bell,
  Settings,
  Home,
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
} from "@/components/ui/sidebar";
import { useNavigate, useLocation } from "react-router-dom";

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

  return (
    <Sidebar>
      <SidebarContent>
        <div className="px-3 py-4">
          <h1 className="text-xl font-bold text-primary">CRM PARA LOJAS</h1>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
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
      </SidebarContent>
    </Sidebar>
  );
}

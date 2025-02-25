
import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  ShoppingCart,
  Package,
  Truck,
  CheckSquare,
  Bell,
  Settings,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export function AppSidebar() {
  const { state, setOpen, openMobile, setOpenMobile } = useSidebar();
  const location = useLocation();
  const isMobile = useIsMobile();

  const isOpen = state === "expanded";

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Clientes", href: "/clientes", icon: Users },
    { name: "Vendas", href: "/vendas", icon: ShoppingCart },
    { name: "Estoque", href: "/estoque", icon: Package },
    { name: "Fornecedores", href: "/fornecedores", icon: Truck },
    { name: "Tarefas", href: "/tarefas", icon: CheckSquare },
    { name: "Notificações", href: "/notificacoes", icon: Bell },
    { name: "Configurações", href: "/configuracoes", icon: Settings },
  ];

  const sidebarClasses = `
    fixed top-0 left-0 z-40 h-screen 
    ${isOpen ? "w-64" : "w-16"} 
    bg-white border-r border-gray-200 
    transition-all duration-300 ease-in-out
    ${isMobile ? (openMobile ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}
  `;

  const overlayClasses = `
    fixed inset-0 bg-black bg-opacity-50 z-30
    transition-opacity duration-300 ease-in-out
    ${isMobile && openMobile ? "opacity-100 visible" : "opacity-0 invisible"}
  `;

  const toggleSidebar = () => {
    if (isMobile) {
      setOpenMobile(!openMobile);
    } else {
      setOpen(!isOpen);
    }
  };

  return (
    <>
      <div className={overlayClasses} onClick={() => setOpenMobile(false)} />
      <aside className={sidebarClasses}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4">
            <h1 className={`font-bold text-lg ${!isOpen && !isMobile ? "hidden" : ""}`}>
              CRM
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className={`${isMobile ? "block" : "hidden"}`}
            >
              {openMobile ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center px-2 py-2 text-sm font-medium rounded-md
                    transition-colors duration-200
                    ${isActive
                      ? "bg-[#9b87f5] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                    }
                  `}
                  onClick={() => isMobile && setOpenMobile(false)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span className={!isOpen && !isMobile ? "hidden" : ""}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {!isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="fixed left-4 bottom-4 z-50"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      )}
    </>
  );
}

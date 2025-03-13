
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  ListTodo,
  Users,
  Package,
  Rocket,
  ShoppingCart,
  Calculator,
  WalletCards,
  DollarSign,
  BarChart4,
  FolderArchive
} from "lucide-react";
import { useNotifications } from "@/contexts/NotificationsContext";

export default function SidebarLinks() {
  const { notificacoesTarefas, notificacoesAniversariantes, notificacoesContasPagar } = useNotifications();
  const location = useLocation();

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
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
    </div>
  );
}

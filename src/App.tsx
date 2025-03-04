
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import Clientes from "@/pages/Clientes";
import Vendas from "@/pages/Vendas";
import Estoque from "@/pages/Estoque";
import Fornecedores from "@/pages/Fornecedores";
import Tarefas from "@/pages/Tarefas";
import Notificacoes from "@/pages/Notificacoes";
import Aniversariantes from "@/pages/Aniversariantes";
import Relatorios from "@/pages/Relatorios";
import Configuracoes from "@/pages/Configuracoes";
import NovosProjetos from "@/pages/NovosProjetos";
import Auth from "@/pages/Auth";
import { Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";

function App() {
  return (
    <AuthProvider>
      <RouterProvider
        router={createBrowserRouter([
          {
            path: "/auth",
            element: <Auth />,
          },
          {
            path: "/",
            element: (
              <AuthGuard>
                <AppLayout><Outlet /></AppLayout>
              </AuthGuard>
            ),
            errorElement: <NotFound />,
            children: [
              { path: "/", element: <Dashboard /> },
              { path: "/clientes", element: <Clientes /> },
              { path: "/vendas", element: <Vendas /> },
              { path: "/estoque", element: <Estoque /> },
              { path: "/fornecedores", element: <Fornecedores /> },
              { path: "/tarefas", element: <Tarefas /> },
              { path: "/notificacoes", element: <Notificacoes /> },
              { path: "/aniversariantes", element: <Aniversariantes /> },
              { path: "/relatorios", element: <Relatorios /> },
              { path: "/configuracoes", element: <Configuracoes /> },
              { path: "/novos-projetos", element: <NovosProjetos /> },
            ],
          },
        ])}
      />
    </AuthProvider>
  );
}

export default App;

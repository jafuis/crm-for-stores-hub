import { RouterProvider, createBrowserRouter } from "react-router-dom";
import AppLayout from "@/layout/AppLayout";
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
// Add the new NovosProjetos import
import NovosProjetos from "@/pages/NovosProjetos";

function App() {
  return (
    <RouterProvider
      router={createBrowserRouter([
        {
          path: "/",
          element: <AppLayout />,
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
  );
}

export default App;

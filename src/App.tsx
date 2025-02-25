
import "./App.css";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Vendas from "./pages/Vendas";
import Estoque from "./pages/Estoque";
import Fornecedores from "./pages/Fornecedores";
import Tarefas from "./pages/Tarefas";
import NotFound from "./pages/NotFound";
import Notificacoes from "./pages/Notificacoes";
import Configuracoes from "./pages/Configuracoes";
import Aniversariantes from "./pages/Aniversariantes";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AppLayout>
        <Outlet />
      </AppLayout>
    ),
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "clientes",
        element: <Clientes />,
      },
      {
        path: "vendas",
        element: <Vendas />,
      },
      {
        path: "estoque",
        element: <Estoque />,
      },
      {
        path: "fornecedores",
        element: <Fornecedores />,
      },
      {
        path: "tarefas",
        element: <Tarefas />,
      },
      {
        path: "notificacoes",
        element: <Notificacoes />,
      },
      {
        path: "aniversariantes",
        element: <Aniversariantes />,
      },
      {
        path: "configuracoes",
        element: <Configuracoes />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;

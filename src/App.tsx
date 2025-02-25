
import "./App.css";
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthRequired } from "./components/AuthRequired";
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
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthRequired>
        <AppLayout>
          <Outlet />
        </AppLayout>
      </AuthRequired>
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
  {
    path: "auth",
    children: [
      {
        path: "signin",
        element: <SignIn />,
      },
      {
        path: "signup",
        element: <SignUp />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;


import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import { AppLayout } from "@/components/AppLayout";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import Clientes from "@/pages/Clientes";
import Vendas from "@/pages/Vendas";
import Fornecedores from "@/pages/Fornecedores";
import Tarefas from "@/pages/Tarefas";
import Notificacoes from "@/pages/Notificacoes";
import Aniversariantes from "@/pages/Aniversariantes";
import Estoque from "@/pages/Estoque";
import Relatorios from "@/pages/Relatorios";
import Configuracoes from "@/pages/Configuracoes";
import NovosProjetos from "@/pages/NovosProjetos";
import MinhaConta from "@/pages/MinhaConta";
import NotFound from "@/pages/NotFound";
import Financas from "@/pages/Financas";
import Pedidos from "@/pages/Pedidos";
import ContasPagar from "@/pages/ContasPagar";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route element={
            <AuthGuard>
              <AppLayout />
            </AuthGuard>
          }>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/vendas" element={<Vendas />} />
            <Route path="/estoque" element={<Estoque />} />
            <Route path="/fornecedores" element={<Fornecedores />} />
            <Route path="/tarefas" element={<Tarefas />} />
            <Route path="/notificacoes" element={<Notificacoes />} />
            <Route path="/aniversariantes" element={<Aniversariantes />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/novos-projetos" element={<NovosProjetos />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/minha-conta" element={<MinhaConta />} />
            <Route path="/financas" element={<Financas />} />
            <Route path="/pedidos" element={<Pedidos />} />
            <Route path="/contas-pagar" element={<ContasPagar />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

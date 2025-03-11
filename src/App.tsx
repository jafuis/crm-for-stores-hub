import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from './contexts/AuthContext';
import { AuthGuard } from './components/AuthGuard';
import { AppLayout } from './components/AppLayout';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Vendas from './pages/Vendas';
import Estoque from './pages/Estoque';
import Fornecedores from './pages/Fornecedores';
import Tarefas from './pages/Tarefas';
import Aniversariantes from './pages/Aniversariantes';
import Relatorios from './pages/Relatorios';
import NovosProjetos from './pages/NovosProjetos';
import Configuracoes from './pages/Configuracoes';
import MinhaConta from './pages/MinhaConta';
import Notificacoes from './pages/Notificacoes';
import NotFound from './pages/NotFound';
import { SidebarProvider } from './components/ui/sidebar';
import Financas from './pages/Financas';
import Pedidos from './pages/Pedidos';

function App() {
  return (
    <div>
      <BrowserRouter>
        <AuthProvider>
          <SidebarProvider>
            <AuthGuard>
              <Routes>
                <Route path="/" element={<AppLayout><Index /></AppLayout>} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
                <Route path="/clientes" element={<AppLayout><Clientes /></AppLayout>} />
                <Route path="/vendas" element={<AppLayout><Vendas /></AppLayout>} />
                <Route path="/financas" element={<AppLayout><Financas /></AppLayout>} />
                <Route path="/pedidos" element={<AppLayout><Pedidos /></AppLayout>} />
                <Route path="/estoque" element={<AppLayout><Estoque /></AppLayout>} />
                <Route path="/fornecedores" element={<AppLayout><Fornecedores /></AppLayout>} />
                <Route path="/tarefas" element={<AppLayout><Tarefas /></AppLayout>} />
                <Route path="/aniversariantes" element={<AppLayout><Aniversariantes /></AppLayout>} />
                <Route path="/relatorios" element={<AppLayout><Relatorios /></AppLayout>} />
                <Route path="/novos-projetos" element={<AppLayout><NovosProjetos /></AppLayout>} />
                <Route path="/configuracoes" element={<AppLayout><Configuracoes /></AppLayout>} />
                <Route path="/minha-conta" element={<AppLayout><MinhaConta /></AppLayout>} />
                <Route path="/notificacoes" element={<AppLayout><Notificacoes /></AppLayout>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthGuard>
            <Toaster />
          </SidebarProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;


import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from './contexts/AuthContext';
import { AuthGuard } from './components/AuthGuard';
import AppLayout from './components/AppLayout';
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
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/clientes" element={<Clientes />} />
                  <Route path="/vendas" element={<Vendas />} />
                  <Route path="/financas" element={<Financas />} />
                  <Route path="/pedidos" element={<Pedidos />} />
                  <Route path="/estoque" element={<Estoque />} />
                  <Route path="/fornecedores" element={<Fornecedores />} />
                  <Route path="/tarefas" element={<Tarefas />} />
                  <Route path="/aniversariantes" element={<Aniversariantes />} />
                  <Route path="/relatorios" element={<Relatorios />} />
                  <Route path="/novos-projetos" element={<NovosProjetos />} />
                  <Route path="/configuracoes" element={<Configuracoes />} />
                  <Route path="/minha-conta" element={<MinhaConta />} />
                  <Route path="/notificacoes" element={<Notificacoes />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppLayout>
            </AuthGuard>
            <Toaster />
          </SidebarProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;

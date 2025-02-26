
import { AppSidebar } from "./AppSidebar";
import { PropsWithChildren, useState, useEffect } from "react";
import { Outlet } from "react-router-dom";

export function AppLayout({ children }: PropsWithChildren) {
  const [hasNotifications, setHasNotifications] = useState(false);
  const [hasBirthdays, setHasBirthdays] = useState(false);

  useEffect(() => {
    const checkNotificationsAndBirthdays = () => {
      // Check for birthdays
      const clientesSalvos = localStorage.getItem('clientes');
      const clientes = clientesSalvos ? JSON.parse(clientesSalvos) : [];
      const hoje = new Date().toISOString().slice(5, 10); // MM-DD format
      const aniversariantes = clientes.filter((cliente: any) => {
        const aniversario = new Date(cliente.aniversario).toISOString().slice(5, 10);
        return aniversario === hoje;
      });
      
      // Check for pending tasks
      const tarefasSalvas = localStorage.getItem('tarefas');
      const tarefas = tarefasSalvas ? JSON.parse(tarefasSalvas) : [];
      const tarefasPendentes = tarefas.filter((tarefa: any) => !tarefa.concluida);

      setHasBirthdays(aniversariantes.length > 0);
      setHasNotifications(aniversariantes.length > 0 || tarefasPendentes.length > 0);
    };

    // Initial check
    checkNotificationsAndBirthdays();

    // Set up interval for real-time updates
    const interval = setInterval(checkNotificationsAndBirthdays, 1000);

    // Listen for storage changes
    window.addEventListener('storage', checkNotificationsAndBirthdays);

    // Clean up
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkNotificationsAndBirthdays);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">
          <Outlet />
          {children}
        </div>
        {hasNotifications && (
          <div className="fixed bottom-4 right-4 animate-bounce">
            <div className="bg-red-500 text-white px-4 py-2 rounded-full shadow-lg">
              🔔 Você tem notificações!
            </div>
          </div>
        )}
        {hasBirthdays && (
          <div className="fixed bottom-16 right-4 animate-bounce">
            <div className="bg-pink-500 text-white px-4 py-2 rounded-full shadow-lg">
              🎂 Aniversariantes hoje!
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

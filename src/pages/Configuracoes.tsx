import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  Sun, 
  Moon, 
  Bell, 
  Trash, 
  Info, 
  Database, 
  Lock, 
  UserX 
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Configuracoes() {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return newMode;
    });

    toast({
      title: isDarkMode ? "Modo claro ativado" : "Modo escuro ativado",
      description: "O tema foi alterado com sucesso",
    });
  };

  const handleClearData = () => {
    if (confirm("Tem certeza que deseja limpar todos os dados do aplicativo? Esta ação não pode ser desfeita.")) {
      const keysToPreserve = ["theme"];
      
      const allKeys = Object.keys(localStorage);
      
      allKeys.forEach(key => {
        if (!keysToPreserve.includes(key)) {
          localStorage.removeItem(key);
        }
      });
      
      toast({
        title: "Dados limpos",
        description: "Todos os dados do aplicativo foram removidos",
      });
    }
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(prev => !prev);
    toast({
      title: notificationsEnabled ? "Notificações desativadas" : "Notificações ativadas",
      description: notificationsEnabled ? "Você não receberá mais notificações" : "Você receberá notificações",
    });
  };

  const toggleAutoSave = () => {
    setAutoSaveEnabled(prev => !prev);
    toast({
      title: autoSaveEnabled ? "Salvamento automático desativado" : "Salvamento automático ativado",
      description: autoSaveEnabled ? "Os dados não serão salvos automaticamente" : "Os dados serão salvos automaticamente",
    });
  };

  const exportData = () => {
    try {
      const data: Record<string, any> = {};
      Object.keys(localStorage).forEach(key => {
        if (key !== "theme") {
          try {
            data[key] = JSON.parse(localStorage.getItem(key) || "null");
          } catch {
            data[key] = localStorage.getItem(key);
          }
        }
      });
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-dados-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Dados exportados",
        description: "Os dados foram exportados com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar dados",
        description: "Ocorreu um erro ao exportar os dados",
        variant: "destructive",
      });
      console.error("Erro ao exportar dados:", error);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.")) {
      try {
        const { error } = await supabase.rpc('delete_user');
        
        if (error) {
          throw error;
        }
        
        await supabase.auth.signOut();
        
        toast({
          title: "Conta excluída",
          description: "Sua conta foi excluída com sucesso",
        });
        
        navigate("/auth");
      } catch (error: any) {
        console.error("Erro ao excluir conta:", error);
        toast({
          title: "Erro ao excluir conta",
          description: "Ocorreu um erro ao tentar excluir sua conta",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6 dark:border-gray-700">
          <div className="flex items-center mb-4">
            {isDarkMode ? 
              <Moon className="w-5 h-5 mr-2 text-gray-900 dark:text-white" /> : 
              <Sun className="w-5 h-5 mr-2 text-gray-900" />
            }
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Aparência</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Modo escuro</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Alterne entre o modo claro e escuro
                </p>
              </div>
              <Switch 
                checked={isDarkMode} 
                onCheckedChange={toggleTheme} 
                aria-label="Alternar tema"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <Bell className="w-5 h-5 mr-2 text-gray-900 dark:text-white" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Notificações</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Ativar notificações</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receba alertas sobre eventos importantes
                </p>
              </div>
              <Switch 
                checked={notificationsEnabled} 
                onCheckedChange={toggleNotifications} 
                aria-label="Ativar notificações"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <Database className="w-5 h-5 mr-2 text-gray-900 dark:text-white" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Dados</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Salvamento automático</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Salvar alterações automaticamente
                </p>
              </div>
              <Switch 
                checked={autoSaveEnabled} 
                onCheckedChange={toggleAutoSave} 
                aria-label="Ativar salvamento automático"
              />
            </div>

            <Separator className="dark:bg-gray-700" />

            <div className="flex flex-col space-y-2">
              <Button 
                variant="outline" 
                onClick={exportData}
                className="w-full justify-start text-gray-900 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
              >
                <Database className="w-4 h-4 mr-2" />
                Exportar dados
              </Button>
              
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
                className="w-full justify-start"
              >
                <UserX className="w-4 h-4 mr-2" />
                Excluir minha conta
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <Info className="w-5 h-5 mr-2 text-gray-900 dark:text-white" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Sobre</h2>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm dark:text-gray-300">
              <span className="font-medium dark:text-white">Versão:</span> 1.0.0
            </p>
            <p className="text-sm dark:text-gray-300">
              <span className="font-medium dark:text-white">Atualizado em:</span> {new Date().toLocaleDateString('pt-BR')}
            </p>
            <Separator className="my-2 dark:bg-gray-700" />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Todos os direitos reservados garimpodeofertas © {new Date().getFullYear()}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

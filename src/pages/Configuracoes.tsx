
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
  Lock 
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export default function Configuracoes() {
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(true);

  // Load theme preference on component mount
  useEffect(() => {
    // Check if dark mode is already set in localStorage or if user prefers dark scheme
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

  // Toggle between dark and light mode
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
      // Keys to preserve (theme settings, etc)
      const keysToPreserve = ["theme"];
      
      // Get all keys from localStorage
      const allKeys = Object.keys(localStorage);
      
      // Remove all keys except those to preserve
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
      // Get all localStorage data except theme
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
      
      // Create a blob with the data
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      // Create a download link
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-dados-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
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

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Configurações</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Aparência */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            {isDarkMode ? <Moon className="w-5 h-5 mr-2" /> : <Sun className="w-5 h-5 mr-2" />}
            <h2 className="text-lg font-medium">Aparência</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Modo escuro</p>
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

        {/* Notificações */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Bell className="w-5 h-5 mr-2" />
            <h2 className="text-lg font-medium">Notificações</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Ativar notificações</p>
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

        {/* Dados */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Database className="w-5 h-5 mr-2" />
            <h2 className="text-lg font-medium">Dados</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Salvamento automático</p>
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

            <Separator />

            <div className="flex flex-col space-y-2">
              <Button 
                variant="outline" 
                onClick={exportData}
                className="w-full justify-start"
              >
                <Database className="w-4 h-4 mr-2" />
                Exportar dados
              </Button>
              
              <Button 
                variant="destructive" 
                onClick={handleClearData}
                className="w-full justify-start"
              >
                <Trash className="w-4 h-4 mr-2" />
                Limpar todos os dados
              </Button>
            </div>
          </div>
        </Card>

        {/* Sobre */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Info className="w-5 h-5 mr-2" />
            <h2 className="text-lg font-medium">Sobre</h2>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Versão:</span> 1.0.0
            </p>
            <p className="text-sm">
              <span className="font-medium">Atualizado em:</span> {new Date().toLocaleDateString('pt-BR')}
            </p>
            <Separator className="my-2" />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Todos os direitos reservados © {new Date().getFullYear()}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

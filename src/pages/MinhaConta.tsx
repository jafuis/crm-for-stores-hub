
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, User, Mail, Key, Save, Lock } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function MinhaConta() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      // Get user profile from profiles table
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
    } catch (error: any) {
      console.error("Erro ao carregar perfil:", error.message);
      toast({
        title: "Erro ao carregar perfil",
        description: "Não foi possível carregar suas informações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPassword(true);

    try {
      // First authenticate with current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword,
      });

      if (signInError) {
        toast({
          title: "Senha atual incorreta",
          description: "Por favor, verifique sua senha atual",
          variant: "destructive",
        });
        return;
      }

      // Then update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Senha atualizada",
        description: "Sua senha foi alterada com sucesso",
      });

      // Clear form
      setCurrentPassword("");
      setNewPassword("");
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error.message);
      let errorMessage = "Ocorreu um erro ao alterar sua senha";
      
      if (error.message.includes("password")) {
        errorMessage = "A nova senha deve ter pelo menos 6 caracteres";
      }
      
      toast({
        title: "Erro ao alterar senha",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Minha Conta</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 mr-2 text-gray-900 dark:text-white" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Informações Pessoais</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Nome</p>
              <div className="flex items-center p-3 bg-gray-100 dark:bg-gray-800 rounded">
                <User className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-white">{profile?.name || "Não informado"}</span>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</p>
              <div className="flex items-center p-3 bg-gray-100 dark:bg-gray-800 rounded">
                <Mail className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-white">{user?.email || "Não informado"}</span>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Área</p>
              <div className="flex items-center p-3 bg-gray-100 dark:bg-gray-800 rounded">
                <Key className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-white">{profile?.area || "Usuário"}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <Lock className="w-5 h-5 mr-2 text-gray-900 dark:text-white" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Alterar Senha</h2>
          </div>
          
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Senha atual"
                className="pl-10 pr-10"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={loadingPassword}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3"
                disabled={loadingPassword}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>

            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type={showNewPassword ? "text" : "password"}
                placeholder="Nova senha"
                className="pl-10 pr-10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loadingPassword}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-3"
                disabled={loadingPassword}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#9b87f5] hover:bg-[#7e69ab]"
              disabled={loadingPassword}
            >
              {loadingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Alterando senha...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar nova senha
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

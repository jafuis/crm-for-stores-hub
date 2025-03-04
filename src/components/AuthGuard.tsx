
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!loading) {
      // Usuário não está autenticado e não está na página de autenticação
      if (!user && location.pathname !== "/auth") {
        toast({
          title: "Acesso restrito",
          description: "Faça login para acessar esta área",
          variant: "destructive",
        });
        navigate("/auth");
      } 
      // Usuário está autenticado e está tentando acessar a página de autenticação
      else if (user && location.pathname === "/auth") {
        toast({
          title: "Você já está logado",
          description: "Redirecionando para a página inicial",
        });
        navigate("/");
      }
      else {
        setVerified(true);
      }
    }
  }, [user, loading, navigate, location.pathname, toast]);

  // Mostrar indicador de carregamento enquanto verifica ou redireciona
  if (loading || !verified) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Verificando autenticação...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

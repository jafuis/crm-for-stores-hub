
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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
        navigate("/");
      }
      else {
        setVerified(true);
      }
    }
  }, [user, loading, navigate, location.pathname, toast]);

  // Mostrar nada enquanto verifica ou redireciona
  if (loading || !verified) {
    return null;
  }

  return <>{children}</>;
}

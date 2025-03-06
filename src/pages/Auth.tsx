import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Auth() {
  // State to manage which form is displayed
  const [view, setView] = useState<"login" | "signup" | "forgotPassword">("login");

  // State for the login form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // State for the signup form
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  
  const { toast } = useToast();
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
      
      setView("login");
    } catch (error: any) {
      console.error("Erro ao solicitar redefinição de senha:", error);
      toast({
        title: "Erro ao solicitar redefinição de senha",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            full_name: signupName,
          },
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Cadastro bem-sucedido",
        description: "Verifique seu email para confirmar seu cadastro.",
      });
      
      setView("login");
    } catch (error: any) {
      console.error("Erro ao cadastrar:", error);
      toast({
        title: "Erro ao cadastrar",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setSignupLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Store auth session
      if (rememberMe) {
        localStorage.setItem("supabase.auth.token", JSON.stringify(data));
      }
      
      // Set user in context
      setUser(data.user);
      
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo de volta ao sistema!",
      });
      
      navigate("/");
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Verifique suas credenciais e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container relative flex h-[800px] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="mr-2 h-6 w-6"
          >
            <path
              fillRule="evenodd"
              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.38 8.41a1.5 1.5 0 002.76 0l.94 4.26a.75.75 0 01-.677.92h-2.553a.75.75 0 01-.677-.92l.94-4.26zM12 17.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
              clipRule="evenodd"
            />
          </svg>
          CRM PARA LOJAS
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Gerencie seus clientes, vendas e estoque em um só lugar.&rdquo;
            </p>
            <footer className="text-sm">Leonardo Oliveira</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {view === "login" && (
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold">Entrar</h1>
              <p className="text-sm text-muted-foreground">
                Entre com suas credenciais para acessar o sistema
              </p>
            </div>
          )}
          {view === "signup" && (
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold">Criar conta</h1>
              <p className="text-sm text-muted-foreground">
                Crie uma nova conta para começar a usar o sistema
              </p>
            </div>
          )}
          {view === "forgotPassword" && (
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold">Esqueceu sua senha?</h1>
              <p className="text-sm text-muted-foreground">
                Informe seu email para redefinir sua senha
              </p>
            </div>
          )}

          {view === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Senha</Label>
                  <Button variant="link" className="p-0 h-auto" onClick={() => setView("forgotPassword")}>
                    Esqueceu a senha?
                  </Button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="******"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="rememberMe" 
                  checked={rememberMe} 
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Permanecer conectado
                </label>
              </div>
              <Button type="submit" className="w-full bg-[#9b87f5] hover:bg-[#7e69ab]" disabled={loading}>
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="ml-2">Entrando...</span>
                  </div>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          )}

          {view === "signup" && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signupName">Nome Completo</Label>
                <Input
                  id="signupName"
                  type="text"
                  placeholder="Seu nome completo"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signupEmail">Email</Label>
                <Input
                  id="signupEmail"
                  type="email"
                  placeholder="seu@email.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signupPassword">Senha</Label>
                <Input
                  id="signupPassword"
                  type="password"
                  placeholder="******"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-[#9b87f5] hover:bg-[#7e69ab]" disabled={signupLoading}>
                {signupLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="ml-2">Cadastrando...</span>
                  </div>
                ) : (
                  "Criar conta"
                )}
              </Button>
            </form>
          )}

          {view === "forgotPassword" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-[#9b87f5] hover:bg-[#7e69ab]" disabled={loading}>
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="ml-2">Enviando...</span>
                  </div>
                ) : (
                  "Enviar email"
                )}
              </Button>
            </form>
          )}

          <div className="text-center">
            {view === "login" && (
              <Button variant="link" className="p-0 h-auto" onClick={() => setView("signup")}>
                Não tem uma conta? Crie uma
              </Button>
            )}
            {view === "signup" && (
              <Button variant="link" className="p-0 h-auto" onClick={() => setView("login")}>
                Já tem uma conta? Entrar
              </Button>
            )}
            {view === "forgotPassword" && (
              <Button variant="link" className="p-0 h-auto" onClick={() => setView("login")}>
                Voltar para login
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function Configuracoes() {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteAccount = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    
    try {
      // Call the RPC function to delete user data
      const { error: rpcError } = await supabase.rpc('delete_user');
      
      if (rpcError) throw rpcError;
      
      // Call Edge Function to delete auth user
      const { error: edgeFnError } = await supabase.functions.invoke('delete-user', {
        body: { userId: user.id }
      });
      
      if (edgeFnError) throw edgeFnError;
      
      // Sign out the user
      await signOut();
      
      toast({
        title: "Conta excluída",
        description: "Sua conta foi excluída com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir conta",
        description: error.message || "Ocorreu um erro ao excluir sua conta",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };

  const handleNotificationToggle = (value: boolean) => {
    toast({
      title: value ? "Notificações ativadas" : "Notificações desativadas",
      description: value ? "Você receberá notificações do sistema" : "Você não receberá mais notificações do sistema",
    });
  };

  const handleThemeToggle = (value: boolean) => {
    toast({
      title: value ? "Tema escuro ativado" : "Tema claro ativado",
      description: "A aparência do sistema foi alterada",
    });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>
      
      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="aparencia">Aparência</TabsTrigger>
          <TabsTrigger value="conta">Conta</TabsTrigger>
        </TabsList>
        
        <TabsContent value="geral">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>Gerencie as configurações gerais do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="idioma">Idioma</Label>
                <select id="idioma" className="border rounded p-2">
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es">Español</option>
                </select>
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="fuso-horario">Fuso Horário</Label>
                <select id="fuso-horario" className="border rounded p-2">
                  <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                  <option value="America/New_York">Nova York (GMT-5)</option>
                  <option value="Europe/London">Londres (GMT+0)</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notificacoes">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
              <CardDescription>Gerencie como você recebe notificações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="email-notif">Notificações por E-mail</Label>
                <Switch id="email-notif" onCheckedChange={handleNotificationToggle} />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="push-notif">Notificações Push</Label>
                <Switch id="push-notif" onCheckedChange={handleNotificationToggle} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="aparencia">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Aparência</CardTitle>
              <CardDescription>Personalize a aparência do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="tema-escuro">Tema Escuro</Label>
                <Switch id="tema-escuro" onCheckedChange={handleThemeToggle} />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="tamanho-fonte">Tamanho da Fonte</Label>
                <select id="tamanho-fonte" className="border rounded p-2">
                  <option value="small">Pequena</option>
                  <option value="medium">Média</option>
                  <option value="large">Grande</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="conta">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Conta</CardTitle>
              <CardDescription>Gerencie suas informações de conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium text-destructive">Zona de Perigo</h3>
                <p className="text-sm text-gray-500">
                  Atenção! As ações abaixo são irreversíveis.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isDeleting}>
                    {isDeleting ? "Excluindo..." : "Excluir Minha Conta"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta
                      e removerá seus dados de nossos servidores.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteAccount}>
                      Sim, excluir minha conta
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

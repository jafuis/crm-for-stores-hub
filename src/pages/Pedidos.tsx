
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ShoppingBag, 
  Plus, 
  Trash2, 
  CheckSquare, 
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Pedido {
  id: string;
  descricao: string;
  valor: number;
  status: string;
  created_at: string;
}

export default function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [novoPedido, setNovoPedido] = useState({
    descricao: "",
    valor: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchPedidos();
    }
  }, [user]);

  const fetchPedidos = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setPedidos(data || []);
    } catch (error: any) {
      console.error("Erro ao buscar pedidos:", error);
      toast({
        title: "Erro ao carregar pedidos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novoPedido.descricao || !novoPedido.valor || !user) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from("pedidos")
        .insert({
          descricao: novoPedido.descricao,
          valor: parseFloat(novoPedido.valor),
          owner_id: user.id,
        });

      if (error) throw error;
      
      toast({
        title: "Pedido adicionado",
        description: "O pedido foi registrado com sucesso!"
      });
      
      setNovoPedido({
        descricao: "",
        valor: "",
      });
      
      setIsOpen(false);
      fetchPedidos();
    } catch (error: any) {
      toast({
        title: "Erro ao criar pedido",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (id: string, novoStatus: string) => {
    try {
      const { error } = await supabase
        .from("pedidos")
        .update({ status: novoStatus })
        .eq("id", id);
      
      if (error) throw error;
      
      toast({
        title: `Pedido ${novoStatus === 'concluido' ? 'concluído' : 'atualizado'}`,
        description: `Status alterado com sucesso!`
      });
      
      fetchPedidos();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("pedidos")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      toast({
        title: "Pedido excluído",
        description: "O pedido foi removido com sucesso!"
      });
      
      fetchPedidos();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir pedido",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };
  
  const formatarData = (data: string) => {
    return format(new Date(data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  return (
    <div className="container mx-auto py-6 space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingBag className="h-6 w-6" /> Pedidos
        </h1>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="mr-2 h-4 w-4" /> Novo Pedido
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Pedido</DialogTitle>
              <DialogDescription>
                Preencha os dados do pedido abaixo.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Descrição do pedido"
                  value={novoPedido.descricao}
                  onChange={(e) => setNovoPedido({...novoPedido, descricao: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Valor (R$)"
                  value={novoPedido.valor}
                  onChange={(e) => setNovoPedido({...novoPedido, valor: e.target.value})}
                />
              </div>
              <DialogFooter>
                <Button type="submit">Salvar Pedido</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <RefreshCw className="animate-spin h-10 w-10 text-gray-400" />
          </div>
        ) : pedidos.length > 0 ? (
          pedidos.map((pedido) => (
            <Card key={pedido.id} className={`
              ${pedido.status === 'concluido' ? 'bg-green-50 border-green-200' : 
                pedido.status === 'pendente' ? 'bg-yellow-50 border-yellow-200' : ''}
            `}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-medium text-lg">{pedido.descricao}</h3>
                    <p className="text-sm text-gray-500">
                      Criado em: {formatarData(pedido.created_at)}
                    </p>
                    <p className="text-lg font-bold mt-2">{formatarValor(pedido.valor)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${pedido.status === 'concluido' ? 'bg-green-100 text-green-800' : 
                          'bg-yellow-100 text-yellow-800'}
                      `}>
                        {pedido.status === 'concluido' ? 'Concluído' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {pedido.status !== 'concluido' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-green-500 text-green-600 hover:bg-green-50"
                        onClick={() => handleStatusChange(pedido.id, 'concluido')}
                      >
                        <CheckSquare className="h-4 w-4 mr-1" /> Concluir
                      </Button>
                    )}
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-red-500 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Excluir
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmação</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(pedido.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center h-40">
              <AlertCircle className="h-10 w-10 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">Nenhum pedido encontrado.</p>
              <p className="text-gray-500 text-center">Clique em "Novo Pedido" para adicionar um pedido.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

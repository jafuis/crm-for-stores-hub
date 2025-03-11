
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, Check, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Pedido {
  id: string;
  descricao: string;
  valor: number;
  status: string;
  created_at: string;
  owner_id: string;
}

export default function Pedidos() {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [novoPedido, setNovoPedido] = useState<Partial<Pedido>>({
    descricao: "",
    valor: 0,
    status: "pendente"
  });

  useEffect(() => {
    if (user) {
      carregarPedidos();
    }
  }, [user]);

  const carregarPedidos = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('owner_id', user.id);
        
      if (error) throw error;
      
      setPedidos(data as Pedido[]);
    } catch (error: any) {
      console.error("Erro ao carregar pedidos:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao carregar pedidos",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validarPedido = () => {
    const erros = [];
    
    if (!novoPedido.descricao || novoPedido.descricao.trim() === '') {
      erros.push("Descrição é obrigatória");
    }
    
    if (!novoPedido.valor || novoPedido.valor <= 0) {
      erros.push("Valor deve ser maior que zero");
    }
    
    return erros;
  };

  const handleAddPedido = async () => {
    if (!user) return;
    
    const erros = validarPedido();
    if (erros.length > 0) {
      toast({
        variant: "destructive",
        title: "Campos inválidos",
        description: erros.join(', ')
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('pedidos')
        .insert({
          descricao: novoPedido.descricao,
          valor: novoPedido.valor,
          status: 'pendente',
          owner_id: user.id
        });
        
      if (error) throw error;
      
      toast({
        title: "Pedido adicionado",
        description: "O pedido foi adicionado com sucesso"
      });
      
      setNovoPedido({
        descricao: "",
        valor: 0,
        status: "pendente"
      });
      
      setDialogOpen(false);
      carregarPedidos();
    } catch (error: any) {
      console.error("Erro ao adicionar pedido:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar pedido",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const concluirPedido = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ status: 'concluido' })
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Pedido concluído",
        description: "O pedido foi marcado como concluído"
      });
      
      carregarPedidos();
    } catch (error: any) {
      console.error("Erro ao concluir pedido:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao concluir pedido",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const excluirPedido = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.")) {
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('pedidos')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Pedido excluído",
        description: "O pedido foi excluído com sucesso"
      });
      
      carregarPedidos();
    } catch (error: any) {
      console.error("Erro ao excluir pedido:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao excluir pedido",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" /> Novo Pedido
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Pedido</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={novoPedido.descricao}
                  onChange={(e) => setNovoPedido({...novoPedido, descricao: e.target.value})}
                  placeholder="Descrição do pedido"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="valor">Valor (R$)</Label>
                <Input
                  id="valor"
                  type="number"
                  value={novoPedido.valor || ""}
                  onChange={(e) => setNovoPedido({...novoPedido, valor: parseFloat(e.target.value)})}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddPedido} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {isLoading && !pedidos.length ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : pedidos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum pedido encontrado. Adicione seu primeiro pedido clicando no botão acima.
          </div>
        ) : (
          pedidos.map((pedido) => (
            <Card key={pedido.id} className={`overflow-hidden ${pedido.status === 'concluido' ? 'bg-gray-50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className={`font-medium ${pedido.status === 'concluido' ? 'line-through text-gray-500' : ''}`}>
                      {pedido.descricao}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(pedido.created_at).toLocaleDateString('pt-BR')}
                      {' • '}
                      <span className={`${pedido.status === 'pendente' ? 'text-yellow-500' : 'text-green-500'}`}>
                        {pedido.status === 'pendente' ? 'Pendente' : 'Concluído'}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">
                      {formatCurrency(pedido.valor)}
                    </span>
                    <div className="flex space-x-1">
                      {pedido.status === 'pendente' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => concluirPedido(pedido.id)}
                          title="Marcar como concluído"
                          className="text-green-500 hover:text-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => excluirPedido(pedido.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

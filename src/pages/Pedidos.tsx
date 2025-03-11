
import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Package, 
  Trash, 
  Archive, 
  Edit,
  Plus,
  Search
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";

interface Pedido {
  id: string;
  descricao: string;
  valor: number;
  status: string;
  created_at: string;
  codigo_rastreio?: string;
  cliente?: string;
}

const Pedidos = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cliente, setCliente] = useState<string>("");
  const [descricao, setDescricao] = useState<string>("");
  const [valor, setValor] = useState<string>("");
  const [status, setStatus] = useState<string>("pendente");
  const [codigoRastreio, setCodigoRastreio] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const { toast } = useToast();
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  useEffect(() => {
    fetchPedidos();

    // Set up realtime subscription
    const channel = supabase
      .channel('public:pedidos')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pedidos'
      }, () => {
        fetchPedidos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPedidos = async () => {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setPedidos(data || []);
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pedidos.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cliente || !descricao || !valor || !status) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      let result;
      if (isEditing && currentId) {
        // Update existing pedido
        result = await supabase
          .from('pedidos')
          .update({
            descricao,
            valor: parseFloat(valor),
            status,
            codigo_rastreio: codigoRastreio || null,
            cliente
          })
          .eq('id', currentId);
      } else {
        // Insert new pedido
        result = await supabase
          .from('pedidos')
          .insert([
            {
              descricao,
              valor: parseFloat(valor),
              status,
              codigo_rastreio: codigoRastreio || null,
              cliente
            }
          ]);
      }

      if (result.error) {
        throw result.error;
      }

      // Clear form
      setCliente("");
      setDescricao("");
      setValor("");
      setStatus("pendente");
      setCodigoRastreio("");
      setIsEditing(false);
      setCurrentId(null);
      setDialogOpen(false);

      toast({
        title: "Sucesso",
        description: isEditing ? "Pedido atualizado com sucesso" : "Pedido adicionado com sucesso",
      });

      await fetchPedidos();
    } catch (error) {
      console.error("Erro ao salvar pedido:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o pedido",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (pedido: Pedido) => {
    setCliente(pedido.cliente || "");
    setDescricao(pedido.descricao);
    setValor(pedido.valor.toString());
    setStatus(pedido.status);
    setCodigoRastreio(pedido.codigo_rastreio || "");
    setIsEditing(true);
    setCurrentId(pedido.id);
    setDialogOpen(true);
  };

  const handleArchive = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ status: 'arquivado' })
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Pedido arquivado com sucesso",
      });

      await fetchPedidos();
    } catch (error) {
      console.error("Erro ao arquivar pedido:", error);
      toast({
        title: "Erro",
        description: "Não foi possível arquivar o pedido",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Pedido excluído com sucesso",
      });

      await fetchPedidos();
    } catch (error) {
      console.error("Erro ao excluir pedido:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o pedido",
        variant: "destructive",
      });
    }
  };

  const getFilteredPedidos = () => {
    if (filtroStatus === "todos") {
      return pedidos;
    }
    return pedidos.filter(pedido => pedido.status === filtroStatus);
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "pendente":
        return "text-yellow-600 dark:text-yellow-400";
      case "enviado":
        return "text-blue-600 dark:text-blue-400";
      case "entregue":
        return "text-green-600 dark:text-green-400";
      case "cancelado":
        return "text-red-600 dark:text-red-400";
      case "arquivado":
        return "text-gray-600 dark:text-gray-400";
      default:
        return "";
    }
  };

  const rastrearEncomenda = (codigo: string) => {
    window.open(`https://www.linkcorreios.com.br/?id=${codigo}`, '_blank');
  };

  const handleAddNew = () => {
    setCliente("");
    setDescricao("");
    setValor("");
    setStatus("pendente");
    setCodigoRastreio("");
    setIsEditing(false);
    setCurrentId(null);
    setDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Pedidos</h1>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" /> Novo pedido
        </Button>
      </div>

      <div className="mb-6">
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="enviado">Enviado</SelectItem>
            <SelectItem value="entregue">Entregue</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
            <SelectItem value="arquivado">Arquivado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {getFilteredPedidos().map((pedido) => (
          <AccordionItem key={pedido.id} value={pedido.id}>
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">
                    {pedido.cliente ? `${pedido.cliente} - ` : ""} 
                    R$ {pedido.valor.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`capitalize font-semibold ${getStatusClass(pedido.status)}`}>
                    {pedido.status}
                  </span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Descrição</h4>
                  <p className="mt-1 whitespace-pre-line">{pedido.descricao}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Data do pedido</h4>
                    <p>{formatDate(pedido.created_at)}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Código de rastreio</h4>
                    {pedido.codigo_rastreio ? (
                      <div className="flex items-center">
                        <span>{pedido.codigo_rastreio}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="ml-2" 
                          onClick={() => rastrearEncomenda(pedido.codigo_rastreio || "")}
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-gray-400">Não informado</span>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(pedido)}>
                    <Edit className="h-4 w-4 mr-1" /> Editar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleArchive(pedido.id)}>
                    <Archive className="h-4 w-4 mr-1" /> Arquivar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(pedido.id)}>
                    <Trash className="h-4 w-4 mr-1" /> Excluir
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {getFilteredPedidos().length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">
            Nenhum pedido encontrado para o filtro selecionado.
          </p>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar pedido" : "Novo pedido"}</DialogTitle>
            <DialogDescription>
              Preencha os detalhes do pedido abaixo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cliente" className="text-right">
                  Cliente
                </Label>
                <Input
                  id="cliente"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  className="col-span-3"
                  placeholder="Nome do cliente"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="valor" className="text-right">
                  Valor
                </Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="col-span-3"
                  placeholder="0.00"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="enviado">Enviado</SelectItem>
                    <SelectItem value="entregue">Entregue</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="codigoRastreio" className="text-right">
                  Rastreio
                </Label>
                <Input
                  id="codigoRastreio"
                  value={codigoRastreio}
                  onChange={(e) => setCodigoRastreio(e.target.value)}
                  className="col-span-3"
                  placeholder="Código de rastreio (opcional)"
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <Label htmlFor="descricao" className="text-right pt-2">
                  Descrição
                </Label>
                <Textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="col-span-3 min-h-[100px]"
                  placeholder="Detalhes do pedido"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">{isEditing ? "Salvar alterações" : "Adicionar pedido"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pedidos;


import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, a
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
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Trash, 
  Archive, 
  Edit,
  Plus 
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Financa {
  id: string;
  descricao: string;
  valor: number;
  tipo: string;
  categoria: string;
  status: string;
  data_vencimento: string | null;
  created_at: string;
}

const categorias = {
  receita: ['Vendas', 'Serviços', 'Investimentos', 'Outros'],
  despesa: ['Materiais', 'Aluguel', 'Luz', 'Água', 'Internet', 'Telefone', 'Impostos', 'Salários', 'Outros'],
  fixa: ['Aluguel', 'Luz', 'Água', 'Internet', 'Telefone', 'Impostos', 'Salários', 'Outros']
};

const Financas = () => {
  const [financas, setFinancas] = useState<Financa[]>([]);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState<string>("receita");
  const [categoria, setCategoria] = useState<string>("");
  const [dataVencimento, setDataVencimento] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const { toast } = useToast();
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");

  useEffect(() => {
    fetchFinancas();

    // Set up realtime subscription
    const channel = supabase
      .channel('public:financas')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'financas'
      }, () => {
        fetchFinancas();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Reset categoria when tipo changes
  useEffect(() => {
    setCategoria("");
  }, [tipo]);

  const fetchFinancas = async () => {
    try {
      const { data, error } = await supabase
        .from('financas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setFinancas(data || []);
    } catch (error) {
      console.error("Erro ao buscar finanças:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados financeiros.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!descricao || !valor || !tipo || !categoria) {
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
        // Update existing finance
        result = await supabase
          .from('financas')
          .update({
            descricao,
            valor: parseFloat(valor),
            tipo,
            categoria,
            data_vencimento: dataVencimento || null
          })
          .eq('id', currentId);
      } else {
        // Insert new finance
        result = await supabase
          .from('financas')
          .insert([
            {
              descricao,
              valor: parseFloat(valor),
              tipo,
              categoria,
              data_vencimento: dataVencimento || null
            }
          ]);
      }

      if (result.error) {
        throw result.error;
      }

      // Clear form
      setDescricao("");
      setValor("");
      setTipo("receita");
      setCategoria("");
      setDataVencimento("");
      setIsEditing(false);
      setCurrentId(null);
      setDialogOpen(false);

      toast({
        title: "Sucesso",
        description: isEditing ? "Registro atualizado com sucesso" : "Registro adicionado com sucesso",
      });

      await fetchFinancas();
    } catch (error) {
      console.error("Erro ao salvar finança:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o registro financeiro",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (financa: Financa) => {
    setDescricao(financa.descricao);
    setValor(financa.valor.toString());
    setTipo(financa.tipo);
    setCategoria(financa.categoria);
    setDataVencimento(financa.data_vencimento || "");
    setIsEditing(true);
    setCurrentId(financa.id);
    setDialogOpen(true);
  };

  const handleArchive = async (id: string) => {
    try {
      const { error } = await supabase
        .from('financas')
        .update({ status: 'arquivado' })
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Registro arquivado com sucesso",
      });

      await fetchFinancas();
    } catch (error) {
      console.error("Erro ao arquivar finança:", error);
      toast({
        title: "Erro",
        description: "Não foi possível arquivar o registro",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('financas')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Registro excluído com sucesso",
      });

      await fetchFinancas();
    } catch (error) {
      console.error("Erro ao excluir finança:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o registro",
        variant: "destructive",
      });
    }
  };

  const getFilteredFinancas = () => {
    if (filtroTipo === "todos") {
      return financas;
    }
    return financas.filter(financa => financa.tipo === filtroTipo);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return format(parseISO(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "receita":
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case "despesa":
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      case "fixa":
        return <Wallet className="w-5 h-5 text-blue-500" />;
      default:
        return <DollarSign className="w-5 h-5" />;
    }
  };

  const getStatusClass = (tipo: string) => {
    switch (tipo) {
      case "receita":
        return "text-green-600 dark:text-green-400";
      case "despesa":
        return "text-red-600 dark:text-red-400";
      case "fixa":
        return "text-blue-600 dark:text-blue-400";
      default:
        return "";
    }
  };

  const handleAddNew = () => {
    setDescricao("");
    setValor("");
    setTipo("receita");
    setCategoria("");
    setDataVencimento("");
    setIsEditing(false);
    setCurrentId(null);
    setDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestão Financeira</h1>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" /> Novo lançamento
        </Button>
      </div>

      <div className="mb-6">
        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="receita">Receitas</SelectItem>
            <SelectItem value="despesa">Despesas</SelectItem>
            <SelectItem value="fixa">Fixas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {getFilteredFinancas().map((financa) => (
          <AccordionItem key={financa.id} value={financa.id}>
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  {getTipoIcon(financa.tipo)}
                  <span className="font-medium">{financa.descricao}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-semibold ${getStatusClass(financa.tipo)}`}>
                    R$ {financa.valor.toFixed(2)}
                  </span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Categoria</p>
                    <p>{financa.categoria}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                    <p className="capitalize">{financa.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Data de Criação</p>
                    <p>{formatDate(financa.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Vencimento</p>
                    <p>{financa.data_vencimento ? formatDate(financa.data_vencimento) : "N/A"}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(financa)}>
                    <Edit className="h-4 w-4 mr-1" /> Editar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleArchive(financa.id)}>
                    <Archive className="h-4 w-4 mr-1" /> Arquivar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(financa.id)}>
                    <Trash className="h-4 w-4 mr-1" /> Excluir
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {getFilteredFinancas().length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">
            Nenhum registro financeiro encontrado para o filtro selecionado.
          </p>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar lançamento" : "Novo lançamento"}</DialogTitle>
            <DialogDescription>
              Preencha os detalhes do lançamento financeiro abaixo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tipo" className="text-right">
                  Tipo
                </Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                    <SelectItem value="fixa">Fixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="descricao" className="text-right">
                  Descrição
                </Label>
                <Input
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="col-span-3"
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
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="categoria" className="text-right">
                  Categoria
                </Label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {tipo && categorias[tipo as keyof typeof categorias].map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dataVencimento" className="text-right">
                  Vencimento
                </Label>
                <Input
                  id="dataVencimento"
                  type="date"
                  value={dataVencimento}
                  onChange={(e) => setDataVencimento(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">{isEditing ? "Salvar alterações" : "Adicionar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Financas;

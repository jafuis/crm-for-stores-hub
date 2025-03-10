
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  Archive, 
  ArrowUp, 
  ArrowDown,
  RefreshCw,
  AlertCircle,
  FileText
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Transacao {
  id: string;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  categoria: 'fixa' | 'variavel';
  status: 'ativo' | 'arquivado';
  data_vencimento?: string;
  created_at: string;
}

export default function Financas() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [novaTransacao, setNovaTransacao] = useState({
    descricao: "",
    valor: "",
    tipo: "receita" as 'receita' | 'despesa',
    categoria: "variavel" as 'fixa' | 'variavel',
    data_vencimento: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("todas");
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchTransacoes();
    }
  }, [user, activeTab]);

  const fetchTransacoes = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from("financas")
        .select("*")
        .eq("owner_id", user.id);
      
      // Aplicar filtros com base na tab ativa
      if (activeTab === "receitas") {
        query = query.eq("tipo", "receita").eq("status", "ativo");
      } else if (activeTab === "despesas") {
        query = query.eq("tipo", "despesa").eq("status", "ativo");
      } else if (activeTab === "fixas") {
        query = query.eq("categoria", "fixa").eq("status", "ativo");
      } else if (activeTab === "arquivadas") {
        query = query.eq("status", "arquivado");
      } else {
        // Tab "todas" - mostrar apenas itens ativos
        query = query.eq("status", "ativo");
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      
      setTransacoes(data || []);
    } catch (error: any) {
      console.error("Erro ao buscar transações:", error);
      toast({
        title: "Erro ao carregar transações",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novaTransacao.descricao || !novaTransacao.valor || !user) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from("financas")
        .insert({
          descricao: novaTransacao.descricao,
          valor: parseFloat(novaTransacao.valor),
          tipo: novaTransacao.tipo,
          categoria: novaTransacao.categoria,
          data_vencimento: novaTransacao.data_vencimento || null,
          owner_id: user.id,
        });

      if (error) throw error;
      
      toast({
        title: "Transação adicionada",
        description: "A transação foi registrada com sucesso!"
      });
      
      setNovaTransacao({
        descricao: "",
        valor: "",
        tipo: "receita",
        categoria: "variavel",
        data_vencimento: ""
      });
      
      setIsOpen(false);
      fetchTransacoes();
    } catch (error: any) {
      toast({
        title: "Erro ao criar transação",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (id: string, novoStatus: 'ativo' | 'arquivado') => {
    try {
      const { error } = await supabase
        .from("financas")
        .update({ status: novoStatus })
        .eq("id", id);
      
      if (error) throw error;
      
      toast({
        title: novoStatus === 'arquivado' ? "Transação arquivada" : "Transação restaurada",
        description: `Status alterado com sucesso!`
      });
      
      fetchTransacoes();
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
        .from("financas")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      toast({
        title: "Transação excluída",
        description: "A transação foi removida com sucesso!"
      });
      
      fetchTransacoes();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir transação",
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
    return format(new Date(data), "dd/MM/yyyy", { locale: ptBR });
  };

  // Cálculos de totais
  const totalReceitas = transacoes
    .filter(t => t.tipo === 'receita' && t.status === 'ativo')
    .reduce((acc, t) => acc + t.valor, 0);
    
  const totalDespesas = transacoes
    .filter(t => t.tipo === 'despesa' && t.status === 'ativo')
    .reduce((acc, t) => acc + t.valor, 0);
    
  const saldo = totalReceitas - totalDespesas;

  return (
    <div className="container mx-auto py-6 space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <DollarSign className="h-6 w-6" /> Finanças
        </h1>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="mr-2 h-4 w-4" /> Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Transação</DialogTitle>
              <DialogDescription>
                Preencha os dados da transação abaixo.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Descrição da transação"
                  value={novaTransacao.descricao}
                  onChange={(e) => setNovaTransacao({...novaTransacao, descricao: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Valor (R$)"
                  value={novaTransacao.valor}
                  onChange={(e) => setNovaTransacao({...novaTransacao, valor: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Select 
                    value={novaTransacao.tipo} 
                    onValueChange={(value: 'receita' | 'despesa') => 
                      setNovaTransacao({...novaTransacao, tipo: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Tipo de Transação</SelectLabel>
                        <SelectItem value="receita">Receita</SelectItem>
                        <SelectItem value="despesa">Despesa</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select 
                    value={novaTransacao.categoria} 
                    onValueChange={(value: 'fixa' | 'variavel') => 
                      setNovaTransacao({...novaTransacao, categoria: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Categoria</SelectLabel>
                        <SelectItem value="fixa">Fixa</SelectItem>
                        <SelectItem value="variavel">Variável</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {novaTransacao.categoria === 'fixa' && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Data de Vencimento</p>
                  <Input
                    type="date"
                    value={novaTransacao.data_vencimento}
                    onChange={(e) => setNovaTransacao({...novaTransacao, data_vencimento: e.target.value})}
                  />
                </div>
              )}
              
              <DialogFooter>
                <Button type="submit">Salvar Transação</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-green-700 flex items-center gap-2">
              <ArrowUp className="h-4 w-4" /> Receitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-700">{formatarValor(totalReceitas)}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-red-700 flex items-center gap-2">
              <ArrowDown className="h-4 w-4" /> Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-700">{formatarValor(totalDespesas)}</p>
          </CardContent>
        </Card>
        
        <Card className={`${saldo >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-lg flex items-center gap-2 ${saldo >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
              <DollarSign className="h-4 w-4" /> Saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
              {formatarValor(saldo)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs e lista de transações */}
      <Tabs defaultValue="todas" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="receitas">Receitas</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
          <TabsTrigger value="fixas">Fixas</TabsTrigger>
          <TabsTrigger value="arquivadas">Arquivadas</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          <div className="grid gap-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <RefreshCw className="animate-spin h-10 w-10 text-gray-400" />
              </div>
            ) : transacoes.length > 0 ? (
              transacoes.map((transacao) => (
                <Card key={transacao.id} className={`
                  ${transacao.tipo === 'receita' ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'}
                  ${transacao.status === 'arquivado' ? 'opacity-70' : ''}
                `}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">{transacao.descricao}</h3>
                          {transacao.categoria === 'fixa' && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                              Fixa
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          Data: {formatarData(transacao.created_at)}
                        </p>
                        {transacao.data_vencimento && (
                          <p className="text-sm text-gray-500">
                            Vencimento: {formatarData(transacao.data_vencimento)}
                          </p>
                        )}
                        <p className={`text-lg font-bold mt-2 ${
                          transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transacao.tipo === 'receita' ? '+' : '-'} {formatarValor(transacao.valor)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {transacao.status === 'ativo' ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-gray-300 text-gray-600 hover:bg-gray-50"
                            onClick={() => handleStatusChange(transacao.id, 'arquivado')}
                          >
                            <Archive className="h-4 w-4 mr-1" /> Arquivar
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-blue-500 text-blue-600 hover:bg-blue-50"
                            onClick={() => handleStatusChange(transacao.id, 'ativo')}
                          >
                            <FileText className="h-4 w-4 mr-1" /> Restaurar
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
                                Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(transacao.id)}
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
                  <p className="text-gray-500 text-center">Nenhuma transação encontrada.</p>
                  <p className="text-gray-500 text-center">Clique em "Nova Transação" para adicionar.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, Archive, Trash2, Banknote, Receipt, PiggyBank, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

interface Transacao {
  id: string;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  categoria: 'fixa' | 'variavel';
  status: 'ativo' | 'arquivado';
  data_vencimento?: string;
  created_at: string;
  owner_id: string;
}

export default function Financas() {
  const { user } = useAuth();
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState("receitas");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [novaTransacao, setNovaTransacao] = useState<Partial<Transacao>>({
    descricao: "",
    valor: 0,
    tipo: "receita",
    categoria: "variavel",
    status: "ativo",
  });

  // Estatísticas
  const [totalReceitas, setTotalReceitas] = useState(0);
  const [totalDespesas, setTotalDespesas] = useState(0);
  const [saldo, setSaldo] = useState(0);

  useEffect(() => {
    if (user) {
      carregarTransacoes();
    }
  }, [user]);

  useEffect(() => {
    calcularEstatisticas();
  }, [transacoes]);

  const calcularEstatisticas = () => {
    const receitas = transacoes
      .filter(t => t.tipo === 'receita' && t.status === 'ativo')
      .reduce((acc, curr) => acc + Number(curr.valor), 0);
    
    const despesas = transacoes
      .filter(t => t.tipo === 'despesa' && t.status === 'ativo')
      .reduce((acc, curr) => acc + Number(curr.valor), 0);
    
    setTotalReceitas(receitas);
    setTotalDespesas(despesas);
    setSaldo(receitas - despesas);
  };

  const carregarTransacoes = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('financas')
        .select('*')
        .eq('owner_id', user.id);
        
      if (error) throw error;
      
      setTransacoes(data as Transacao[]);
    } catch (error: any) {
      console.error("Erro ao carregar transações:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao carregar transações",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTransacao = async () => {
    if (!user) return;
    
    if (!novaTransacao.descricao || !novaTransacao.valor) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha a descrição e o valor da transação"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('financas')
        .insert({
          descricao: novaTransacao.descricao,
          valor: novaTransacao.valor,
          tipo: novaTransacao.tipo,
          categoria: novaTransacao.categoria,
          status: 'ativo',
          data_vencimento: novaTransacao.data_vencimento,
          owner_id: user.id
        });
        
      if (error) throw error;
      
      toast({
        title: "Transação adicionada",
        description: "A transação foi adicionada com sucesso"
      });
      
      setNovaTransacao({
        descricao: "",
        valor: 0,
        tipo: currentTab === "receitas" ? "receita" : "despesa",
        categoria: "variavel",
        status: "ativo",
      });
      
      setDialogOpen(false);
      carregarTransacoes();
    } catch (error: any) {
      console.error("Erro ao adicionar transação:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar transação",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const arquivarTransacao = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('financas')
        .update({ status: 'arquivado' })
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Transação arquivada",
        description: "A transação foi arquivada com sucesso"
      });
      
      carregarTransacoes();
    } catch (error: any) {
      console.error("Erro ao arquivar transação:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao arquivar transação",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const excluirTransacao = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.")) {
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('financas')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Transação excluída",
        description: "A transação foi excluída com sucesso"
      });
      
      carregarTransacoes();
    } catch (error: any) {
      console.error("Erro ao excluir transação:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao excluir transação",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar transações baseado na aba atual
  const filtrarTransacoes = () => {
    let filtradas: Transacao[] = [];
    
    switch (currentTab) {
      case "receitas":
        filtradas = transacoes.filter(t => t.tipo === 'receita' && t.status === 'ativo');
        break;
      case "despesas":
        filtradas = transacoes.filter(t => t.tipo === 'despesa' && t.status === 'ativo');
        break;
      case "fixas":
        filtradas = transacoes.filter(t => t.categoria === 'fixa' && t.status === 'ativo');
        break;
      case "arquivadas":
        filtradas = transacoes.filter(t => t.status === 'arquivado');
        break;
      default:
        filtradas = transacoes;
    }
    
    return filtradas;
  };

  const getTransacaoIcon = (tipo: string) => {
    switch (tipo) {
      case 'receita':
        return <Banknote className="h-4 w-4 text-green-500" />;
      case 'despesa':
        return <Receipt className="h-4 w-4 text-red-500" />;
      default:
        return <Banknote className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Finanças</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" /> Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Transação</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={novaTransacao.descricao}
                  onChange={(e) => setNovaTransacao({...novaTransacao, descricao: e.target.value})}
                  placeholder="Descrição da transação"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="valor">Valor (R$)</Label>
                <Input
                  id="valor"
                  type="number"
                  value={novaTransacao.valor || ""}
                  onChange={(e) => setNovaTransacao({...novaTransacao, valor: parseFloat(e.target.value)})}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select 
                  value={novaTransacao.tipo} 
                  onValueChange={(value) => setNovaTransacao({...novaTransacao, tipo: value as 'receita' | 'despesa'})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select 
                  value={novaTransacao.categoria} 
                  onValueChange={(value) => setNovaTransacao({...novaTransacao, categoria: value as 'fixa' | 'variavel'})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixa">Fixa</SelectItem>
                    <SelectItem value="variavel">Variável</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="data_vencimento">Data de Vencimento (opcional)</Label>
                <Input
                  id="data_vencimento"
                  type="date"
                  value={novaTransacao.data_vencimento || ""}
                  onChange={(e) => setNovaTransacao({...novaTransacao, data_vencimento: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddTransacao} disabled={isLoading}>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Total de Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalReceitas)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Total de Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalDespesas)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(saldo)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="receitas" className="flex items-center">
            <Banknote className="h-4 w-4 mr-2" /> Receitas
          </TabsTrigger>
          <TabsTrigger value="despesas" className="flex items-center">
            <Receipt className="h-4 w-4 mr-2" /> Despesas
          </TabsTrigger>
          <TabsTrigger value="fixas" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" /> Fixas
          </TabsTrigger>
          <TabsTrigger value="arquivadas" className="flex items-center">
            <Archive className="h-4 w-4 mr-2" /> Arquivadas
          </TabsTrigger>
        </TabsList>

        {["receitas", "despesas", "fixas", "arquivadas"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filtrarTransacoes().length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma transação encontrada.
              </div>
            ) : (
              filtrarTransacoes().map((transacao) => (
                <Card key={transacao.id} className="overflow-hidden">
                  <div className="flex justify-between items-center p-4">
                    <div className="flex items-center">
                      {getTransacaoIcon(transacao.tipo)}
                      <div className="ml-3">
                        <h3 className="font-medium">{transacao.descricao}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transacao.created_at).toLocaleDateString('pt-BR')}
                          {transacao.data_vencimento && (
                            <span> • Vence: {new Date(transacao.data_vencimento).toLocaleDateString('pt-BR')}</span>
                          )}
                          <span> • {transacao.categoria === 'fixa' ? 'Fixa' : 'Variável'}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                        {transacao.tipo === 'receita' ? '+' : '-'} {formatCurrency(transacao.valor)}
                      </span>
                      <div className="flex space-x-1">
                        {transacao.status === 'ativo' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => arquivarTransacao(transacao.id)}
                            title="Arquivar"
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => excluirTransacao(transacao.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

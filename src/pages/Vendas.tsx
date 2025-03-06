
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format, parseISO, isAfter, startOfDay, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DollarSign, Calendar, FileText, Archive, Trash2, RefreshCcw, Edit2, ChevronDown, ChevronRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Venda {
  id: string;
  valor: number;
  data: string;
  arquivada?: boolean;
  dia?: string; // para agrupar por dia
}

export default function Vendas() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [mostrarArquivadas, setMostrarArquivadas] = useState(false);
  const [vendaSendoEditada, setVendaSendoEditada] = useState<Venda | null>(null);
  const [diasAbertos, setDiasAbertos] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Obter a data e hora atuais no formato ISO com ajuste para o fuso horário local
  const obterDataHoraAtual = () => {
    const agora = new Date();
    return format(agora, "yyyy-MM-dd'T'HH:mm");
  };

  const [novaVenda, setNovaVenda] = useState({
    valor: "",
    data: obterDataHoraAtual(),
  });

  useEffect(() => {
    const storedVendas = localStorage.getItem('vendas');
    if (storedVendas) {
      const todasVendas = JSON.parse(storedVendas);
      
      // Verificar se mudou o dia desde a última verificação
      const ultimoDia = localStorage.getItem('ultimoDiaVendas');
      const diaAtual = format(new Date(), 'yyyy-MM-dd');
      
      if (ultimoDia !== diaAtual) {
        // Arquivar vendas do dia anterior
        const vendasAtualizadas = todasVendas.map((venda: Venda) => {
          const dataVenda = parseISO(venda.data);
          if (isValid(dataVenda)) {
            const diaVenda = format(dataVenda, 'yyyy-MM-dd');
            if (diaVenda !== diaAtual && !venda.arquivada) {
              return { ...venda, arquivada: true };
            }
          }
          return venda;
        });
        
        setVendas(vendasAtualizadas);
        localStorage.setItem('vendas', JSON.stringify(vendasAtualizadas));
        localStorage.setItem('ultimoDiaVendas', diaAtual);
      } else {
        // Adicionar propriedade 'dia' para agrupar por dia nas vendas arquivadas
        const vendasComDia = todasVendas.map((venda: Venda) => {
          try {
            const dataVenda = parseISO(venda.data);
            if (isValid(dataVenda)) {
              return {
                ...venda,
                dia: format(dataVenda, 'yyyy-MM-dd')
              };
            }
          } catch (e) {
            console.error("Erro ao processar data de venda:", e);
          }
          return venda;
        });
        
        setVendas(vendasComDia);
      }
    }
    
    // Verificar mudança de dia a cada minuto
    const intervalId = setInterval(() => {
      const ultimoDia = localStorage.getItem('ultimoDiaVendas');
      const diaAtual = format(new Date(), 'yyyy-MM-dd');
      
      if (ultimoDia !== diaAtual) {
        localStorage.setItem('ultimoDiaVendas', diaAtual);
        window.location.reload(); // Recarregar para atualizar lista de vendas
      }
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const handleRegistrarVenda = () => {
    if (!novaVenda.valor) {
      toast({
        title: "Erro",
        description: "Por favor, insira um valor para a venda",
        variant: "destructive",
      });
      return;
    }

    const venda: Venda = {
      id: (vendas.length + 1).toString(),
      valor: parseFloat(novaVenda.valor),
      data: novaVenda.data,
      arquivada: false,
      dia: format(parseISO(novaVenda.data), 'yyyy-MM-dd')
    };

    const novasVendas = [venda, ...vendas];
    setVendas(novasVendas);
    localStorage.setItem('vendas', JSON.stringify(novasVendas));

    toast({
      title: "Venda registrada",
      description: `Venda de ${formatarValor(venda.valor)} registrada com sucesso!`,
    });

    setNovaVenda({
      valor: "",
      data: obterDataHoraAtual(),
    });
  };

  const handleArquivarVenda = (id: string) => {
    const vendasAtualizadas = vendas.map(venda => 
      venda.id === id 
        ? { ...venda, arquivada: !venda.arquivada }
        : venda
    );
    setVendas(vendasAtualizadas);
    localStorage.setItem('vendas', JSON.stringify(vendasAtualizadas));

    toast({
      title: "Venda atualizada",
      description: "Status da venda atualizado com sucesso!",
    });
  };

  const handleExcluirVenda = (id: string) => {
    const vendasAtualizadas = vendas.filter(venda => venda.id !== id);
    setVendas(vendasAtualizadas);
    localStorage.setItem('vendas', JSON.stringify(vendasAtualizadas));

    toast({
      title: "Venda excluída",
      description: "Venda removida com sucesso!",
    });
  };

  const handleSalvarEdicao = () => {
    if (!vendaSendoEditada) return;
    
    const vendasAtualizadas = vendas.map(venda => 
      venda.id === vendaSendoEditada.id 
        ? { ...vendaSendoEditada, dia: format(parseISO(vendaSendoEditada.data), 'yyyy-MM-dd') }
        : venda
    );
    
    setVendas(vendasAtualizadas);
    localStorage.setItem('vendas', JSON.stringify(vendasAtualizadas));
    
    toast({
      title: "Venda atualizada",
      description: "As informações da venda foram atualizadas com sucesso!",
    });
    
    setVendaSendoEditada(null);
  };

  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatarData = (data: string) => {
    // Usando a formatação com localização brasileira
    return format(parseISO(data), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
      locale: ptBR,
    });
  };

  const toggleDia = (dia: string) => {
    setDiasAbertos(prev => ({
      ...prev,
      [dia]: !prev[dia]
    }));
  };

  // Filtrar vendas por status (arquivadas/não arquivadas)
  const vendasFiltradas = vendas.filter(venda => venda.arquivada === mostrarArquivadas);

  // Agrupar vendas arquivadas por dia
  const agruparVendasPorDia = () => {
    if (!mostrarArquivadas) return {};
    
    return vendasFiltradas.reduce((grupos: Record<string, Venda[]>, venda) => {
      const dia = venda.dia || 'sem-data';
      if (!grupos[dia]) {
        grupos[dia] = [];
      }
      grupos[dia].push(venda);
      return grupos;
    }, {});
  };

  const vendasAgrupadasPorDia = agruparVendasPorDia();
  const diasOrdenados = Object.keys(vendasAgrupadasPorDia).sort((a, b) => {
    // Ordenar os dias em ordem decrescente (mais recente primeiro)
    return b.localeCompare(a);
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Controle de Vendas</h1>
        <p className="text-muted-foreground">
          Registre e gerencie suas vendas
        </p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="grid gap-4">
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Valor da venda"
              type="number"
              step="0.01"
              min="0"
              className="pl-10"
              value={novaVenda.valor}
              onChange={(e) => setNovaVenda({ ...novaVenda, valor: e.target.value })}
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              type="datetime-local"
              className="pl-10"
              value={novaVenda.data}
              onChange={(e) => setNovaVenda({ ...novaVenda, data: e.target.value })}
            />
          </div>
          <Button
            className="w-full bg-[#9b87f5] hover:bg-[#7e69ab]"
            onClick={handleRegistrarVenda}
          >
            <FileText className="w-4 h-4 mr-2" />
            Registrar Venda
          </Button>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setMostrarArquivadas(!mostrarArquivadas)}
        >
          {mostrarArquivadas ? (
            <>
              <RefreshCcw className="w-4 h-4 mr-2" />
              Mostrar Ativas
            </>
          ) : (
            <>
              <Archive className="w-4 h-4 mr-2" />
              Mostrar Arquivadas
            </>
          )}
        </Button>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">
          {mostrarArquivadas ? "Vendas Arquivadas" : "Vendas Recentes"}
        </h2>
        
        {/* Vendas não arquivadas (Recentes) */}
        {!mostrarArquivadas && (
          <div className="space-y-4">
            {vendasFiltradas.map((venda) => (
              <div
                key={venda.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{formatarValor(venda.valor)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatarData(venda.data)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setVendaSendoEditada(venda)}
                  >
                    <Edit2 className="w-4 h-4 text-blue-500" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleArquivarVenda(venda.id)}
                  >
                    <Archive className={`w-4 h-4 ${venda.arquivada ? "text-blue-500" : ""}`} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleExcluirVenda(venda.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
            
            {vendasFiltradas.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma venda ativa no momento.
              </div>
            )}
          </div>
        )}
        
        {/* Vendas arquivadas (agrupadas por dia) */}
        {mostrarArquivadas && (
          <div className="space-y-4">
            {diasOrdenados.map((dia) => (
              <Collapsible key={dia}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#9b87f5]" />
                      <h3 className="font-medium">
                        {format(parseISO(dia), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </h3>
                      <span className="text-sm text-muted-foreground">
                        ({vendasAgrupadasPorDia[dia].length} vendas)
                      </span>
                    </div>
                    {diasAbertos[dia] ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 space-y-2 mt-2">
                  {vendasAgrupadasPorDia[dia].map((venda) => (
                    <div
                      key={venda.id}
                      className="flex items-center justify-between p-4 border rounded-lg ml-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium">{formatarValor(venda.valor)}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(parseISO(venda.data), "HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setVendaSendoEditada(venda)}
                        >
                          <Edit2 className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleArquivarVenda(venda.id)}
                        >
                          <Archive className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleExcluirVenda(venda.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))}
            
            {diasOrdenados.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma venda arquivada no momento.
              </div>
            )}
          </div>
        )}
      </Card>
      
      {/* Dialog para editar venda */}
      <Dialog open={!!vendaSendoEditada} onOpenChange={(open) => !open && setVendaSendoEditada(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Venda</DialogTitle>
          </DialogHeader>
          {vendaSendoEditada && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="valor" className="text-sm font-medium">Valor</label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  value={vendaSendoEditada.valor}
                  onChange={(e) => setVendaSendoEditada({
                    ...vendaSendoEditada,
                    valor: parseFloat(e.target.value) || 0
                  })}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="data" className="text-sm font-medium">Data e Hora</label>
                <Input
                  id="data"
                  type="datetime-local"
                  value={vendaSendoEditada.data}
                  onChange={(e) => setVendaSendoEditada({
                    ...vendaSendoEditada,
                    data: e.target.value
                  })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleSalvarEdicao}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

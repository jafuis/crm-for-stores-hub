
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  PlusCircle, 
  Trash2, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  ChevronUp, 
  ChevronDown,
  Lightbulb,
  ListChecks,
  Clock
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Etapa {
  id: string;
  descricao: string;
  concluida: boolean;
}

interface Projeto {
  id: string;
  titulo: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  etapas: Etapa[];
  progresso: number;
}

export default function NovosProjetos() {
  const { toast } = useToast();
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [buscaProjeto, setBuscaProjeto] = useState("");
  const [novoProjeto, setNovoProjeto] = useState<Omit<Projeto, "id" | "progresso">>({
    titulo: "",
    descricao: "",
    dataInicio: "",
    dataFim: "",
    etapas: []
  });
  const [novaEtapa, setNovaEtapa] = useState<Omit<Etapa, "id" | "concluida">>({
    descricao: ""
  });
  
  const [projetoAtual, setProjetoAtual] = useState<string | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Carregar projetos do localStorage
  useEffect(() => {
    const projetosSalvos = localStorage.getItem('projetos');
    if (projetosSalvos) {
      setProjetos(JSON.parse(projetosSalvos));
    }
  }, []);

  // Salvar projetos no localStorage
  useEffect(() => {
    localStorage.setItem('projetos', JSON.stringify(projetos));
  }, [projetos]);

  // Função para calcular o progresso do projeto
  const calcularProgresso = (etapas: Etapa[]): number => {
    if (etapas.length === 0) return 0;
    const etapasConcluidas = etapas.filter(etapa => etapa.concluida).length;
    return Math.round((etapasConcluidas / etapas.length) * 100);
  };

  // Adicionar novo projeto
  const handleAdicionarProjeto = () => {
    if (!novoProjeto.titulo) {
      toast({
        title: "Erro",
        description: "O título do projeto é obrigatório",
        variant: "destructive",
      });
      return;
    }

    const novoId = Date.now().toString();
    
    if (modoEdicao && projetoAtual) {
      // Atualizar projeto existente
      const projetosAtualizados = projetos.map(projeto => {
        if (projeto.id === projetoAtual) {
          const etapasAtualizadas = [...novoProjeto.etapas];
          return {
            ...projeto,
            ...novoProjeto,
            etapas: etapasAtualizadas,
            progresso: calcularProgresso(etapasAtualizadas)
          };
        }
        return projeto;
      });
      
      setProjetos(projetosAtualizados);
      toast({
        title: "Projeto atualizado",
        description: "O projeto foi atualizado com sucesso",
      });
    } else {
      // Adicionar novo projeto
      const projeto: Projeto = {
        id: novoId,
        ...novoProjeto,
        progresso: 0
      };
      
      setProjetos([...projetos, projeto]);
      toast({
        title: "Projeto adicionado",
        description: "O projeto foi adicionado com sucesso",
      });
    }
    
    // Resetar formulário
    setNovoProjeto({
      titulo: "",
      descricao: "",
      dataInicio: "",
      dataFim: "",
      etapas: []
    });
    setModoEdicao(false);
    setProjetoAtual(null);
    setDialogOpen(false);
  };

  // Adicionar nova etapa ao projeto
  const handleAdicionarEtapa = () => {
    if (!novaEtapa.descricao) return;
    
    const etapa: Etapa = {
      id: Date.now().toString(),
      descricao: novaEtapa.descricao,
      concluida: false
    };
    
    setNovoProjeto({
      ...novoProjeto,
      etapas: [...novoProjeto.etapas, etapa]
    });
    
    setNovaEtapa({ descricao: "" });
  };

  // Remover etapa do projeto em edição
  const handleRemoverEtapa = (id: string) => {
    setNovoProjeto({
      ...novoProjeto,
      etapas: novoProjeto.etapas.filter(etapa => etapa.id !== id)
    });
  };

  // Excluir projeto
  const handleExcluirProjeto = (id: string) => {
    setProjetos(projetos.filter(projeto => projeto.id !== id));
    toast({
      title: "Projeto excluído",
      description: "O projeto foi excluído com sucesso",
    });
  };

  // Editar projeto
  const handleEditarProjeto = (projeto: Projeto) => {
    setNovoProjeto({
      titulo: projeto.titulo,
      descricao: projeto.descricao,
      dataInicio: projeto.dataInicio,
      dataFim: projeto.dataFim,
      etapas: projeto.etapas
    });
    setProjetoAtual(projeto.id);
    setModoEdicao(true);
    setDialogOpen(true);
  };

  // Atualizar status da etapa (concluída/não concluída)
  const handleToggleEtapa = (projetoId: string, etapaId: string) => {
    const projetosAtualizados = projetos.map(projeto => {
      if (projeto.id === projetoId) {
        const etapasAtualizadas = projeto.etapas.map(etapa => {
          if (etapa.id === etapaId) {
            return { ...etapa, concluida: !etapa.concluida };
          }
          return etapa;
        });
        
        return {
          ...projeto,
          etapas: etapasAtualizadas,
          progresso: calcularProgresso(etapasAtualizadas)
        };
      }
      return projeto;
    });
    
    setProjetos(projetosAtualizados);
  };

  // Filtrar projetos pela busca
  const projetosFiltrados = projetos.filter(projeto =>
    projeto.titulo.toLowerCase().includes(buscaProjeto.toLowerCase()) ||
    projeto.descricao.toLowerCase().includes(buscaProjeto.toLowerCase())
  );

  // Verificar status do projeto (no prazo, atrasado, pendente)
  const getStatusProjeto = (projeto: Projeto): { status: string; cor: string } => {
    const hoje = new Date();
    const dataInicio = new Date(projeto.dataInicio);
    const dataFim = new Date(projeto.dataFim);
    
    if (projeto.progresso === 100) {
      return { status: "Concluído", cor: "text-green-500" };
    } else if (!projeto.dataFim) {
      return { status: "Sem prazo", cor: "text-gray-500" };
    } else if (hoje > dataFim) {
      return { status: "Atrasado", cor: "text-red-500" };
    } else if (hoje < dataInicio) {
      return { status: "Não iniciado", cor: "text-blue-500" };
    } else {
      return { status: "Em andamento", cor: "text-yellow-500" };
    }
  };

  // Formatar data para exibição
  const formatarData = (dataString: string): string => {
    if (!dataString) return "Não definida";
    
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6 animate-fadeIn pt-16">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Novos Projetos</h1>
          <p className="text-muted-foreground">Gerencie suas ideias e projetos</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#9b87f5] hover:bg-[#7e69ab]">
              <PlusCircle className="w-4 h-4 mr-2" />
              Novo Projeto
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>{modoEdicao ? "Editar Projeto" : "Criar Novo Projeto"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Título</label>
                <Input
                  placeholder="Título do projeto"
                  value={novoProjeto.titulo}
                  onChange={(e) => setNovoProjeto({ ...novoProjeto, titulo: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Descrição</label>
                <Textarea
                  placeholder="Descreva seu projeto ou ideia"
                  value={novoProjeto.descricao}
                  onChange={(e) => setNovoProjeto({ ...novoProjeto, descricao: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Data de Início</label>
                  <Input
                    type="date"
                    value={novoProjeto.dataInicio}
                    onChange={(e) => setNovoProjeto({ ...novoProjeto, dataInicio: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Data de Conclusão</label>
                  <Input
                    type="date"
                    value={novoProjeto.dataFim}
                    onChange={(e) => setNovoProjeto({ ...novoProjeto, dataFim: e.target.value })}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div>
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Etapas</label>
                  <span className="text-xs text-gray-500">{novoProjeto.etapas.length} etapas</span>
                </div>
                
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Adicionar nova etapa"
                    value={novaEtapa.descricao}
                    onChange={(e) => setNovaEtapa({ descricao: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdicionarEtapa()}
                  />
                  <Button 
                    onClick={handleAdicionarEtapa}
                    size="icon"
                    variant="outline"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="mt-2 max-h-[200px] overflow-y-auto space-y-2">
                  {novoProjeto.etapas.map((etapa) => (
                    <div 
                      key={etapa.id} 
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => {
                            setNovoProjeto({
                              ...novoProjeto,
                              etapas: novoProjeto.etapas.map(e => 
                                e.id === etapa.id ? { ...e, concluida: !e.concluida } : e
                              )
                            });
                          }}
                        >
                          {etapa.concluida ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                        </Button>
                        <span className={etapa.concluida ? "line-through text-gray-400" : ""}>
                          {etapa.descricao}
                        </span>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemoverEtapa(etapa.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setNovoProjeto({
                      titulo: "",
                      descricao: "",
                      dataInicio: "",
                      dataFim: "",
                      etapas: []
                    });
                    setModoEdicao(false);
                    setProjetoAtual(null);
                    setDialogOpen(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  className="bg-[#9b87f5] hover:bg-[#7e69ab]"
                  onClick={handleAdicionarProjeto}
                >
                  {modoEdicao ? "Salvar Alterações" : "Criar Projeto"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="relative">
        <Input
          placeholder="Buscar projetos..."
          value={buscaProjeto}
          onChange={(e) => setBuscaProjeto(e.target.value)}
          className="w-full"
        />
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {projetosFiltrados.length === 0 ? (
          <Card className="p-8 text-center">
            <Lightbulb className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum projeto encontrado</h3>
            <p className="text-gray-500 mb-4">
              Comece criando seu primeiro projeto para organizar suas ideias
            </p>
            <Button 
              className="bg-[#9b87f5] hover:bg-[#7e69ab]"
              onClick={() => setDialogOpen(true)}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Criar Projeto
            </Button>
          </Card>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {projetosFiltrados.map((projeto) => {
              const status = getStatusProjeto(projeto);
              
              return (
                <AccordionItem 
                  key={projeto.id} 
                  value={projeto.id}
                  className="border rounded-lg mb-4 overflow-hidden"
                >
                  <div className="border-l-4 px-4 py-2" style={{ borderLeftColor: status.cor.replace('text-', '').replace('-500', '') === 'green' ? '#22c55e' : 
                                                                           status.cor.replace('text-', '').replace('-500', '') === 'red' ? '#ef4444' : 
                                                                           status.cor.replace('text-', '').replace('-500', '') === 'yellow' ? '#eab308' : 
                                                                           status.cor.replace('text-', '').replace('-500', '') === 'blue' ? '#3b82f6' : '#6b7280' }}>
                    <AccordionTrigger className="hover:no-underline py-2">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full pr-4">
                        <div className="flex flex-col items-start">
                          <h3 className="font-semibold text-left">{projeto.titulo}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs ${status.cor}`}>
                              {status.status}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatarData(projeto.dataInicio)} - {formatarData(projeto.dataFim)}
                            </span>
                          </div>
                        </div>
                        <div className="w-full md:w-1/3 mt-2 md:mt-0">
                          <div className="flex items-center gap-2">
                            <Progress value={projeto.progresso} className="h-2" />
                            <span className="text-xs font-medium w-8">{projeto.progresso}%</span>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                  </div>
                  
                  <AccordionContent className="px-4 py-2">
                    <div className="space-y-4">
                      <p className="text-gray-600 dark:text-gray-300">{projeto.descricao || "Sem descrição"}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700 dark:text-gray-300">Início: {formatarData(projeto.dataInicio)}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700 dark:text-gray-300">Término: {formatarData(projeto.dataFim)}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <ListChecks className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {projeto.etapas.filter(e => e.concluida).length} de {projeto.etapas.length} etapas concluídas
                          </span>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="font-medium mb-2">Etapas</h4>
                        {projeto.etapas.length === 0 ? (
                          <p className="text-gray-500 text-sm italic">Nenhuma etapa definida</p>
                        ) : (
                          <div className="space-y-2">
                            {projeto.etapas.map((etapa) => (
                              <div 
                                key={etapa.id} 
                                className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md"
                              >
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6"
                                  onClick={() => handleToggleEtapa(projeto.id, etapa.id)}
                                >
                                  {etapa.concluida ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Circle className="h-4 w-4" />
                                  )}
                                </Button>
                                <span className={etapa.concluida ? "line-through text-gray-400" : ""}>
                                  {etapa.descricao}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditarProjeto(projeto)}
                        >
                          Editar
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Deseja excluir este projeto? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleExcluirProjeto(projeto.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>
    </div>
  );
}

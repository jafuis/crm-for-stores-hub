
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, ChevronsUpDown, Plus, Trash2, FileEdit, Phone, Mail, MapPin, Search, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  aniversario: string;
  endereco: string;
}

export default function Clientes() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [novoCliente, setNovoCliente] = useState<Cliente>({
    id: "",
    nome: "",
    telefone: "",
    email: "",
    aniversario: "",
    endereco: ""
  });
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editDialogAberto, setEditDialogAberto] = useState(false);

  useEffect(() => {
    if (user) {
      fetchClientes();
    }
  }, [user]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setClientesFiltrados(clientes);
    } else {
      const filtered = clientes.filter(
        (cliente) =>
          cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cliente.telefone?.includes(searchTerm)
      );
      setClientesFiltrados(filtered);
    }
  }, [searchTerm, clientes]);

  const fetchClientes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('owner_id', user?.id);
      
      if (error) throw error;

      const clientesFormatados = data?.map(client => ({
        id: client.id,
        nome: client.name,
        telefone: client.phone || '',
        email: client.email || '',
        aniversario: client.birthday || '',
        endereco: client.address || ''
      })) || [];
      
      // Sort clients alphabetically by name
      const clientesOrdenados = clientesFormatados.sort((a, b) => 
        a.nome.localeCompare(b.nome, 'pt-BR')
      );
      
      setClientes(clientesOrdenados);
      setClientesFiltrados(clientesOrdenados);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast({
        title: "Erro ao carregar clientes",
        description: "Não foi possível carregar os clientes. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCliente = async () => {
    if (!novoCliente.nome || !novoCliente.email || !user) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e email são campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: novoCliente.nome,
          phone: novoCliente.telefone,
          email: novoCliente.email,
          birthday: novoCliente.aniversario,
          address: novoCliente.endereco,
          owner_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      const novoClienteFormatado: Cliente = {
        id: data.id,
        nome: data.name,
        telefone: data.phone || '',
        email: data.email || '',
        aniversario: data.birthday || '',
        endereco: data.address || ''
      };

      // Add new client and sort again
      const clientesAtualizados = [...clientes, novoClienteFormatado].sort((a, b) => 
        a.nome.localeCompare(b.nome, 'pt-BR')
      );
      
      setClientes(clientesAtualizados);
      setNovoCliente({
        id: "",
        nome: "",
        telefone: "",
        email: "",
        aniversario: "",
        endereco: ""
      });
      setDialogAberto(false);

      toast({
        title: "Cliente adicionado",
        description: "O cliente foi adicionado com sucesso.",
      });
      
      // Dispatch custom event to notify AppSidebar about client data change
      window.dispatchEvent(new Event('clientDataChanged'));
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      toast({
        title: "Erro ao adicionar cliente",
        description: "Não foi possível adicionar o cliente. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleEditarCliente = (cliente: Cliente) => {
    setClienteEditando(cliente);
    setEditDialogAberto(true);
  };

  const handleSalvarEdicao = async () => {
    if (!clienteEditando || !user) return;

    try {
      const { error } = await supabase
        .from('customers')
        .update({
          name: clienteEditando.nome,
          phone: clienteEditando.telefone,
          email: clienteEditando.email,
          birthday: clienteEditando.aniversario,
          address: clienteEditando.endereco
        })
        .eq('id', clienteEditando.id)
        .eq('owner_id', user.id);

      if (error) throw error;

      const clientesAtualizados = clientes.map(c => 
        c.id === clienteEditando.id ? clienteEditando : c
      ).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      
      setClientes(clientesAtualizados);
      setClienteEditando(null);
      setEditDialogAberto(false);

      toast({
        title: "Cliente atualizado",
        description: "As informações do cliente foram atualizadas com sucesso.",
      });
      
      // Dispatch custom event to notify AppSidebar about client data change
      window.dispatchEvent(new Event('clientDataChanged'));
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      toast({
        title: "Erro ao atualizar cliente",
        description: "Não foi possível atualizar o cliente. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleExcluirCliente = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('owner_id', user?.id);

      if (error) throw error;

      setClientes(clientes.filter(c => c.id !== id));
      toast({
        title: "Sucesso",
        description: "Cliente excluído com sucesso!",
      });
      
      // Dispatch custom event to notify AppSidebar about client data change
      window.dispatchEvent(new Event('clientDataChanged'));
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o cliente.",
        variant: "destructive"
      });
    }
  };

  const formatarTelefoneParaWhatsApp = (telefone: string) => {
    const numeroLimpo = telefone.replace(/\D/g, '');
    let numeroFormatado = numeroLimpo;
    if (!numeroLimpo.startsWith('55') && numeroLimpo.length > 8) {
      numeroFormatado = `55${numeroLimpo}`;
    }
    return `https://wa.me/${numeroFormatado}`;
  };

  const formatarEmailParaMailto = (email: string) => {
    return `mailto:${email}`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <div className="flex flex-col md:flex-row w-full md:w-auto gap-3">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              className="pl-10"
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
            <DialogTrigger asChild>
              <Button className="bg-[#9b87f5] hover:bg-[#7e69ab] w-full md:w-auto whitespace-nowrap">
                <Plus className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                <DialogDescription>
                  Preencha os dados do cliente abaixo.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="nome" className="text-sm font-medium">Nome*</label>
                  <Input
                    id="nome"
                    value={novoCliente.nome}
                    onChange={(e) => setNovoCliente({...novoCliente, nome: e.target.value})}
                    placeholder="Nome do cliente"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email*</label>
                  <Input
                    id="email"
                    type="email"
                    value={novoCliente.email}
                    onChange={(e) => setNovoCliente({...novoCliente, email: e.target.value})}
                    placeholder="Email do cliente"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="telefone" className="text-sm font-medium">Telefone</label>
                  <Input
                    id="telefone"
                    value={novoCliente.telefone}
                    onChange={(e) => setNovoCliente({...novoCliente, telefone: e.target.value})}
                    placeholder="Telefone do cliente"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="aniversario" className="text-sm font-medium">Aniversário</label>
                  <Input
                    id="aniversario"
                    type="date"
                    value={novoCliente.aniversario}
                    onChange={(e) => setNovoCliente({...novoCliente, aniversario: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="endereco" className="text-sm font-medium">Endereço</label>
                  <Input
                    id="endereco"
                    value={novoCliente.endereco}
                    onChange={(e) => setNovoCliente({...novoCliente, endereco: e.target.value})}
                    placeholder="Endereço do cliente"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogAberto(false)}>Cancelar</Button>
                <Button className="bg-[#9b87f5] hover:bg-[#7e69ab]" onClick={handleAddCliente}>
                  Adicionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9b87f5]"></div>
        </div>
      ) : (
        <div className="space-y-2">
          {clientesFiltrados.length === 0 ? (
            <Card className="p-8 text-center">
              <h3 className="text-lg font-medium text-gray-500">
                {searchTerm ? "Nenhum cliente encontrado para essa busca" : "Nenhum cliente encontrado"}
              </h3>
              <p className="text-gray-400 mt-2">
                {searchTerm ? "Tente outros termos de busca" : "Adicione clientes para começar"}
              </p>
            </Card>
          ) : (
            <Accordion type="multiple" className="w-full">
              {clientesFiltrados.map((cliente) => (
                <AccordionItem key={cliente.id} value={cliente.id} className="border p-2 rounded-md mb-2">
                  <div className="flex items-center justify-between">
                    <AccordionTrigger className="py-2 hover:no-underline">
                      <span className="font-medium">{cliente.nome}</span>
                    </AccordionTrigger>
                    <div className="flex gap-2 mr-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditarCliente(cliente);
                        }}
                      >
                        <FileEdit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir cliente</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleExcluirCliente(cliente.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <AccordionContent className="pl-4 pr-2 pb-2 pt-4">
                    <div className="space-y-2">
                      {cliente.email && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <a 
                            href={formatarEmailParaMailto(cliente.email)} 
                            className="text-gray-600 hover:text-blue-500 transition-colors"
                          >
                            {cliente.email}
                          </a>
                        </p>
                      )}
                      {cliente.telefone && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <Phone className="w-4 h-4" /> 
                          <a 
                            href={formatarTelefoneParaWhatsApp(cliente.telefone)} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-gray-600 hover:text-green-500 transition-colors"
                          >
                            {cliente.telefone}
                          </a>
                        </p>
                      )}
                      {cliente.aniversario && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {format(parseISO(cliente.aniversario), "dd 'de' MMMM", { locale: ptBR })}
                        </p>
                      )}
                      {cliente.endereco && (
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {cliente.endereco}
                        </p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      )}

      <Dialog open={editDialogAberto} onOpenChange={setEditDialogAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Atualize os dados do cliente abaixo.
            </DialogDescription>
          </DialogHeader>
          {clienteEditando && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="nome" className="text-sm font-medium">Nome*</label>
                <Input
                  id="nome"
                  value={clienteEditando.nome}
                  onChange={(e) => setClienteEditando({...clienteEditando, nome: e.target.value})}
                  placeholder="Nome do cliente"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email*</label>
                <Input
                  id="email"
                  type="email"
                  value={clienteEditando.email}
                  onChange={(e) => setClienteEditando({...clienteEditando, email: e.target.value})}
                  placeholder="Email do cliente"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="telefone" className="text-sm font-medium">Telefone</label>
                <Input
                  id="telefone"
                  value={clienteEditando.telefone}
                  onChange={(e) => setClienteEditando({...clienteEditando, telefone: e.target.value})}
                  placeholder="Telefone do cliente"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="aniversario" className="text-sm font-medium">Aniversário</label>
                <Input
                  id="aniversario"
                  type="date"
                  value={clienteEditando.aniversario}
                  onChange={(e) => setClienteEditando({...clienteEditando, aniversario: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="endereco" className="text-sm font-medium">Endereço</label>
                <Input
                  id="endereco"
                  value={clienteEditando.endereco}
                  onChange={(e) => setClienteEditando({...clienteEditando, endereco: e.target.value})}
                  placeholder="Endereço do cliente"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogAberto(false)}>Cancelar</Button>
            <Button className="bg-[#9b87f5] hover:bg-[#7e69ab]" onClick={handleSalvarEdicao}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

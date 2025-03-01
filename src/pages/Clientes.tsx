
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, Star, Trash2, Mail, Phone, Calendar, Edit2, ChevronDown, ChevronUp, Gift, MessageSquare } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { isSameDay } from "date-fns";
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

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  aniversario: string;
  classificacao: number;
}

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);
  const [novoCliente, setNovoCliente] = useState({
    nome: "",
    telefone: "",
    email: "",
    aniversario: "",
    classificacao: 1,
  });

  useEffect(() => {
    const clientesSalvos = localStorage.getItem('clientes');
    if (clientesSalvos) {
      setClientes(JSON.parse(clientesSalvos));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('clientes', JSON.stringify(clientes));
  }, [clientes]);

  const handleAdicionarCliente = () => {
    if (!novoCliente.nome || !novoCliente.telefone || !novoCliente.email) return;

    const cliente: Cliente = {
      id: editingClient ? editingClient.id : Date.now().toString(),
      ...novoCliente
    };

    let novosClientes;
    if (editingClient) {
      novosClientes = clientes.map(c => c.id === editingClient.id ? cliente : c);
    } else {
      novosClientes = [...clientes, cliente];
    }

    novosClientes.sort((a, b) => a.nome.localeCompare(b.nome));
    setClientes(novosClientes);
    setNovoCliente({
      nome: "",
      telefone: "",
      email: "",
      aniversario: "",
      classificacao: 1,
    });
    setEditingClient(null);
  };

  const handleExcluirCliente = (id: string) => {
    const novosClientes = clientes.filter(cliente => cliente.id !== id);
    setClientes(novosClientes);
  };

  const handleEditarCliente = (cliente: Cliente) => {
    setEditingClient(cliente);
    setNovoCliente({
      nome: cliente.nome,
      telefone: cliente.telefone,
      email: cliente.email,
      aniversario: cliente.aniversario,
      classificacao: cliente.classificacao,
    });
  };

  const handleStarClick = (clienteId: string, novaClassificacao: number) => {
    const novosClientes = clientes.map(cliente => {
      if (cliente.id === clienteId) {
        return { ...cliente, classificacao: novaClassificacao };
      }
      return cliente;
    });
    setClientes(novosClientes);
  };

  const clientesFiltrados = clientes
    .filter(cliente =>
      cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.email.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.telefone.includes(busca)
    )
    .sort((a, b) => a.nome.localeCompare(b.nome));

  const StarRating = ({ value, onChange, readOnly = false }: { value: number, onChange?: (rating: number) => void, readOnly?: boolean }) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${star <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
              ${!readOnly && "cursor-pointer hover:text-yellow-400"}`}
            onClick={() => !readOnly && onChange && onChange(star)}
          />
        ))}
      </div>
    );
  };

  const isAniversariante = (cliente: Cliente) => {
    if (!cliente.aniversario) return false;
    const hoje = new Date();
    const aniversario = new Date(cliente.aniversario);
    return isSameDay(
      new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()),
      new Date(hoje.getFullYear(), aniversario.getMonth(), aniversario.getDate())
    );
  };

  // Format phone number for WhatsApp link
  const formatWhatsAppNumber = (phone: string) => {
    // Remove non-digit characters
    return phone.replace(/\D/g, '');
  };

  return (
    <div className="space-y-6 animate-fadeIn pt-16">
      <div>
        <h1 className="text-2xl font-bold">Clientes</h1>
        <p className="text-muted-foreground">Gerencie seus clientes</p>
        <Sheet>
          <SheetTrigger asChild>
            <Button className="bg-[#9b87f5] hover:bg-[#7e69ab] mt-4">
              <UserPlus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-white">
            <SheetHeader>
              <SheetTitle>{editingClient ? "Editar Cliente" : "Adicionar Novo Cliente"}</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Input
                  placeholder="Nome"
                  value={novoCliente.nome}
                  onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })}
                />
              </div>
              <div>
                <Input
                  placeholder="Telefone"
                  value={novoCliente.telefone}
                  onChange={(e) => setNovoCliente({ ...novoCliente, telefone: e.target.value })}
                />
              </div>
              <div>
                <Input
                  placeholder="Email"
                  type="email"
                  value={novoCliente.email}
                  onChange={(e) => setNovoCliente({ ...novoCliente, email: e.target.value })}
                />
              </div>
              <div>
                <Input
                  type="date"
                  placeholder="Aniversário"
                  value={novoCliente.aniversario}
                  onChange={(e) => setNovoCliente({ ...novoCliente, aniversario: e.target.value })}
                />
              </div>
              <div>
                <p className="mb-2 text-sm text-gray-600">Classificação</p>
                <StarRating
                  value={novoCliente.classificacao}
                  onChange={(rating) => setNovoCliente({ ...novoCliente, classificacao: rating })}
                />
              </div>
              <Button 
                className="w-full bg-[#9b87f5] hover:bg-[#7e69ab]"
                onClick={handleAdicionarCliente}
              >
                {editingClient ? "Salvar Alterações" : "Adicionar Cliente"}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Buscar clientes..."
          className="pl-10 w-full"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <Accordion type="single" collapsible className="w-full space-y-2">
        {clientesFiltrados.map((cliente) => (
          <AccordionItem 
            key={cliente.id} 
            value={cliente.id} 
            className={`border rounded-lg p-2 ${isAniversariante(cliente) ? 'bg-pink-50 border-pink-200' : ''}`}
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex items-center gap-4">
                  <div className="font-semibold flex items-center gap-2">
                    {cliente.nome}
                    {isAniversariante(cliente) && (
                      <Gift className="w-4 h-4 text-pink-500 animate-bounce" />
                    )}
                  </div>
                  <StarRating 
                    value={cliente.classificacao} 
                    onChange={(rating) => handleStarClick(cliente.id, rating)}
                  />
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${cliente.email}`} className="hover:text-blue-500 transition-colors">
                    {cliente.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MessageSquare className="w-4 h-4 text-green-500" />
                  <a 
                    href={`https://wa.me/${formatWhatsAppNumber(cliente.telefone)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-green-500 transition-colors"
                  >
                    {cliente.telefone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  {cliente.aniversario}
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditarCliente(cliente)}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="bg-white">
                      <SheetHeader>
                        <SheetTitle>Editar Cliente</SheetTitle>
                      </SheetHeader>
                      <div className="space-y-4 mt-4">
                        <Input
                          placeholder="Nome"
                          value={novoCliente.nome}
                          onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })}
                        />
                        <Input
                          placeholder="Telefone"
                          value={novoCliente.telefone}
                          onChange={(e) => setNovoCliente({ ...novoCliente, telefone: e.target.value })}
                        />
                        <Input
                          placeholder="Email"
                          type="email"
                          value={novoCliente.email}
                          onChange={(e) => setNovoCliente({ ...novoCliente, email: e.target.value })}
                        />
                        <Input
                          type="date"
                          placeholder="Aniversário"
                          value={novoCliente.aniversario}
                          onChange={(e) => setNovoCliente({ ...novoCliente, aniversario: e.target.value })}
                        />
                        <div>
                          <p className="mb-2 text-sm text-gray-600">Classificação</p>
                          <StarRating
                            value={novoCliente.classificacao}
                            onChange={(rating) => setNovoCliente({ ...novoCliente, classificacao: rating })}
                          />
                        </div>
                        <Button 
                          className="w-full bg-[#9b87f5] hover:bg-[#7e69ab]"
                          onClick={handleAdicionarCliente}
                        >
                          Salvar Alterações
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>

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
                          Deseja excluir este cliente? Esta ação não pode ser desfeita.
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
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

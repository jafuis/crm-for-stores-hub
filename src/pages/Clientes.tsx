
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, Star, Trash2, Mail, Phone, Calendar, Edit2, ChevronDown, ChevronUp } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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

    // Ordenar por ordem alfabética
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

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Gerencie seus clientes</p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button className="bg-[#9b87f5] hover:bg-[#7e69ab]">
              <UserPlus className="w-4 h-4 mr-2" />
              {editingClient ? "Editar Cliente" : "Novo Cliente"}
            </Button>
          </SheetTrigger>
          <SheetContent>
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
          <AccordionItem key={cliente.id} value={cliente.id} className="border rounded-lg p-2">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex items-center gap-4">
                  <div className="font-semibold">{cliente.nome}</div>
                  <StarRating value={cliente.classificacao} readOnly />
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  {cliente.email}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  {cliente.telefone}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  {cliente.aniversario}
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditarCliente(cliente)}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleExcluirCliente(cliente.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

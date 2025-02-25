
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, Star, Trash2, Mail, Phone, Calendar } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

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
      id: (clientes.length + 1).toString(),
      ...novoCliente
    };

    const novosClientes = [...clientes, cliente];
    setClientes(novosClientes);
    localStorage.setItem('clientes', JSON.stringify(novosClientes));

    setNovoCliente({
      nome: "",
      telefone: "",
      email: "",
      aniversario: "",
      classificacao: 1,
    });
  };

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
    cliente.email.toLowerCase().includes(busca.toLowerCase()) ||
    cliente.telefone.includes(busca)
  );

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
              Novo Cliente
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Adicionar Novo Cliente</SheetTitle>
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
                <Input
                  type="number"
                  placeholder="Classificação (1-5)"
                  min="1"
                  max="5"
                  value={novoCliente.classificacao}
                  onChange={(e) => setNovoCliente({ ...novoCliente, classificacao: Number(e.target.value) })}
                />
              </div>
              <Button 
                className="w-full bg-[#9b87f5] hover:bg-[#7e69ab]"
                onClick={handleAdicionarCliente}
              >
                Adicionar Cliente
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar clientes..."
            className="pl-10 w-full"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientesFiltrados.map((cliente) => (
          <Card key={cliente.id} className="p-4">
            <div className="flex flex-col space-y-2">
              <div className="text-lg font-semibold">{cliente.nome}</div>
              <div className="text-sm text-gray-500">
                <Mail className="w-4 h-4 inline-block mr-1" />
                {cliente.email}
              </div>
              <div className="text-sm text-gray-500">
                <Phone className="w-4 h-4 inline-block mr-1" />
                {cliente.telefone}
              </div>
              <div className="text-sm text-gray-500">
                <Star className="w-4 h-4 inline-block mr-1" />
                Classificação: {cliente.classificacao}
              </div>
              <div className="text-sm text-gray-500">
                <Calendar className="w-4 h-4 inline-block mr-1" />
                Aniversário: {cliente.aniversario}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

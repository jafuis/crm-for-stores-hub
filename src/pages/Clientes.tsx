import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Star, Plus, Edit, Trash2, Phone, Mail, CalendarDays, ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  aniversario: string;
  classificacao: number;
}

const clientesIniciais: Cliente[] = [
  {
    id: "1",
    nome: "João Silva",
    telefone: "11999999999",
    email: "joao@email.com",
    aniversario: "1990-05-15",
    classificacao: 0,
  },
];

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>(clientesIniciais);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [novoCliente, setNovoCliente] = useState<Partial<Cliente>>({
    nome: "",
    telefone: "",
    email: "",
    aniversario: "",
    classificacao: 0,
  });

  const handleRating = (clienteId: string, rating: number) => {
    setClientes(clientes.map(cliente => 
      cliente.id === clienteId 
        ? { ...cliente, classificacao: rating }
        : cliente
    ));
  };

  const handleEdit = (cliente: Cliente) => {
    setClienteEditando(cliente);
  };

  const handleDelete = (clienteId: string) => {
    setClientes(clientes.filter(cliente => cliente.id !== clienteId));
  };

  const handleSaveEdit = () => {
    if (clienteEditando) {
      setClientes(clientes.map(cliente =>
        cliente.id === clienteEditando.id ? clienteEditando : cliente
      ));
      setClienteEditando(null);
    }
  };

  const handleAddNew = () => {
    const newId = (Math.max(...clientes.map(c => parseInt(c.id))) + 1).toString();
    setClientes([...clientes, { ...novoCliente as Cliente, id: newId }]);
    setNovoCliente({
      nome: "",
      telefone: "",
      email: "",
      aniversario: "",
      classificacao: 0,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() + timezoneOffset);
    return localDate.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <div className="flex gap-4">
          <Input
            type="search"
            placeholder="Buscar clientes..."
            className="max-w-xs"
          />
          <Sheet>
            <SheetTrigger asChild>
              <Button>
                <Plus className="w-4 h-4" />
                Novo Cliente
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Novo Cliente</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-4">
                <Input
                  placeholder="Nome"
                  value={novoCliente.nome}
                  onChange={e => setNovoCliente({ ...novoCliente, nome: e.target.value })}
                />
                <Input
                  placeholder="Telefone"
                  value={novoCliente.telefone}
                  onChange={e => setNovoCliente({ ...novoCliente, telefone: e.target.value })}
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={novoCliente.email}
                  onChange={e => setNovoCliente({ ...novoCliente, email: e.target.value })}
                />
                <Input
                  placeholder="Data de Aniversário"
                  type="date"
                  value={novoCliente.aniversario}
                  onChange={e => setNovoCliente({ ...novoCliente, aniversario: e.target.value })}
                />
                <Button onClick={handleAddNew} className="w-full">
                  Adicionar Cliente
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <Card className="p-6">
        <Accordion type="single" collapsible className="space-y-4">
          {clientes.map((cliente) => (
            <AccordionItem key={cliente.id} value={cliente.id} className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">{cliente.nome}</span>
                  <div className="flex items-center gap-6">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRating(cliente.id, star);
                          }}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= cliente.classificacao
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 py-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <a
                      href={`https://wa.me/55${cliente.telefone}`}
                      target="_blank"
                      className="text-primary hover:underline"
                    >
                      {cliente.telefone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <a
                      href={`mailto:${cliente.email}`}
                      className="text-primary hover:underline"
                    >
                      {cliente.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="w-4 h-4" />
                    <span>{formatDate(cliente.aniversario)}</span>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex gap-2">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(cliente)}
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </Button>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle>Editar Cliente</SheetTitle>
                        </SheetHeader>
                        {clienteEditando && (
                          <div className="space-y-4 mt-4">
                            <Input
                              placeholder="Nome"
                              value={clienteEditando.nome}
                              onChange={e => setClienteEditando({
                                ...clienteEditando,
                                nome: e.target.value
                              })}
                            />
                            <Input
                              placeholder="Telefone"
                              value={clienteEditando.telefone}
                              onChange={e => setClienteEditando({
                                ...clienteEditando,
                                telefone: e.target.value
                              })}
                            />
                            <Input
                              placeholder="Email"
                              type="email"
                              value={clienteEditando.email}
                              onChange={e => setClienteEditando({
                                ...clienteEditando,
                                email: e.target.value
                              })}
                            />
                            <Input
                              placeholder="Data de Aniversário"
                              type="date"
                              value={clienteEditando.aniversario}
                              onChange={e => setClienteEditando({
                                ...clienteEditando,
                                aniversario: e.target.value
                              })}
                            />
                            <Button onClick={handleSaveEdit} className="w-full">
                              Salvar Alterações
                            </Button>
                          </div>
                        )}
                      </SheetContent>
                    </Sheet>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(cliente.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
    </div>
  );
}

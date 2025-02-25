import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  aniversario: string;
}

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [novoCliente, setNovoCliente] = useState<Cliente>({
    id: '',
    nome: '',
    telefone: '',
    aniversario: '',
  });

  useEffect(() => {
    // Carregar clientes do localStorage ao montar o componente
    const clientesSalvos = localStorage.getItem('clientes');
    if (clientesSalvos) {
      setClientes(JSON.parse(clientesSalvos));
    }
  }, []);

  useEffect(() => {
    // Salvar clientes no localStorage sempre que a lista for atualizada
    localStorage.setItem('clientes', JSON.stringify(clientes));
  }, [clientes]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNovoCliente({
      ...novoCliente,
      [name]: value,
    });
  };

  const adicionarCliente = () => {
    if (novoCliente.nome && novoCliente.telefone && novoCliente.aniversario) {
      const novoId = Math.random().toString(36).substring(2, 15); // Gera um ID aleatório
      const clienteParaAdicionar: Cliente = {
        id: novoId,
        nome: novoCliente.nome,
        telefone: novoCliente.telefone,
        aniversario: novoCliente.aniversario,
      };
      setClientes([...clientes, clienteParaAdicionar]);
      setNovoCliente({ id: '', nome: '', telefone: '', aniversario: '' }); // Limpa o formulário
    } else {
      alert('Por favor, preencha todos os campos.');
    }
  };

  const removerCliente = (id: string) => {
    const novaListaDeClientes = clientes.filter((cliente) => cliente.id !== id);
    setClientes(novaListaDeClientes);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Novo Cliente</h2>
            <div>
              <Input
                type="text"
                name="nome"
                placeholder="Nome"
                value={novoCliente.nome}
                onChange={handleInputChange}
              />
              <Input
                type="tel"
                name="telefone"
                placeholder="Telefone"
                value={novoCliente.telefone}
                onChange={handleInputChange}
              />
              <Input
                type="date"
                name="aniversario"
                placeholder="Data de Aniversário"
                value={novoCliente.aniversario}
                onChange={handleInputChange}
              />
              <Button className="bg-[#9b87f5] hover:bg-[#7e69ab]" onClick={adicionarCliente}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Cliente
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {clientes.map((cliente) => (
          <Card key={cliente.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{cliente.nome}</h3>
                <p className="text-sm text-gray-500">Telefone: {cliente.telefone}</p>
                <p className="text-sm text-gray-500">
                  Aniversário: {format(new Date(cliente.aniversario), 'dd/MM/yyyy')}
                </p>
              </div>
              <Button variant="destructive" size="sm" onClick={() => removerCliente(cliente.id)}>
                Remover
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

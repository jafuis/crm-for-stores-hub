import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useState } from "react";

interface Fornecedor {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  categoria: string;
}

export default function Fornecedores() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>(() => {
    const fornecedoresSalvos = localStorage.getItem('fornecedores');
    return fornecedoresSalvos ? JSON.parse(fornecedoresSalvos) : [];
  });

  const handleAdicionarFornecedor = (novoFornecedor: Fornecedor) => {
    const fornecedoresAtualizados = [...fornecedores, novoFornecedor];
    setFornecedores(fornecedoresAtualizados);
    localStorage.setItem('fornecedores', JSON.stringify(fornecedoresAtualizados));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Fornecedores</h1>
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Novo Fornecedor</h2>
            <Button className="bg-[#9b87f5] hover:bg-[#7e69ab]">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Fornecedor
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid gap-4">
        {fornecedores.map((fornecedor) => (
          <Card key={fornecedor.id} className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{fornecedor.nome}</h3>
                <p className="text-sm text-gray-500">{fornecedor.categoria}</p>
              </div>
              <div className="text-sm text-right">
                <p>{fornecedor.telefone}</p>
                <p className="text-gray-500">{fornecedor.email}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

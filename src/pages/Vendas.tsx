
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DollarSign, Calendar, FileText, Archive, Trash2 } from "lucide-react";

interface Venda {
  id: string;
  valor: number;
  data: string;
}

export default function Vendas() {
  const [vendas, setVendas] = useState<Venda[]>([
    {
      id: "1",
      valor: 5000,
      data: "2024-02-24T09:03:00",
    },
  ]);

  const [novaVenda, setNovaVenda] = useState({
    valor: "",
    data: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  });

  const handleRegistrarVenda = () => {
    if (!novaVenda.valor) return;

    const venda: Venda = {
      id: (vendas.length + 1).toString(),
      valor: parseFloat(novaVenda.valor),
      data: novaVenda.data,
    };

    setVendas([venda, ...vendas]);
    setNovaVenda({
      valor: "",
      data: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    });
  };

  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatarData = (data: string) => {
    return format(new Date(data), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
      locale: ptBR,
    });
  };

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
        <Button variant="outline" size="sm">
          <Archive className="w-4 h-4 mr-2" />
          Mostrar Arquivadas
        </Button>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Vendas Recentes</h2>
        <div className="space-y-4">
          {vendas.map((venda) => (
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
                <Button variant="ghost" size="icon">
                  <Archive className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

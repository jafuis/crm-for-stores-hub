
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

export default function Vendas() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Vendas</h1>
        <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
          Nova Venda
        </button>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Data</th>
                <th className="text-left py-3 px-4">Valor</th>
                <th className="text-left py-3 px-4">Cliente</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3 px-4">{format(new Date(), 'dd/MM/yyyy')}</td>
                <td className="py-3 px-4">R$ 1.500,00</td>
                <td className="py-3 px-4">João Silva</td>
                <td className="py-3 px-4">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                    Concluída
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button className="text-primary hover:underline">Editar</button>
                    <button className="text-yellow-600 hover:underline">Arquivar</button>
                    <button className="text-red-500 hover:underline">Excluir</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

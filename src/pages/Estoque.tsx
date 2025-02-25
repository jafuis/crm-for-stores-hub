
import { Card } from "@/components/ui/card";

export default function Estoque() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Estoque</h1>
        <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
          Novo Produto
        </button>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Produto</th>
                <th className="text-left py-3 px-4">Quantidade</th>
                <th className="text-left py-3 px-4">Valor Unitário</th>
                <th className="text-left py-3 px-4">Valor Total</th>
                <th className="text-left py-3 px-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3 px-4">Produto A</td>
                <td className="py-3 px-4">50</td>
                <td className="py-3 px-4">R$ 100,00</td>
                <td className="py-3 px-4">R$ 5.000,00</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button className="text-primary hover:underline">Editar</button>
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

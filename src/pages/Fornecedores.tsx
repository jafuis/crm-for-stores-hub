
import { Card } from "@/components/ui/card";

export default function Fornecedores() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Fornecedores</h1>
        <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
          Novo Fornecedor
        </button>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Nome</th>
                <th className="text-left py-3 px-4">Telefone</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Produtos</th>
                <th className="text-left py-3 px-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3 px-4">Fornecedor A</td>
                <td className="py-3 px-4">
                  <a href="tel:1199999999" className="text-primary hover:underline">
                    (11) 99999-9999
                  </a>
                </td>
                <td className="py-3 px-4">
                  <a href="mailto:contato@fornecedor.com" className="text-primary hover:underline">
                    contato@fornecedor.com
                  </a>
                </td>
                <td className="py-3 px-4">Produto A, Produto B</td>
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

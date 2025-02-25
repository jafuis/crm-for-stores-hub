
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Star } from "lucide-react";

export default function Clientes() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Input
          type="search"
          placeholder="Buscar clientes..."
          className="max-w-xs"
        />
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Nome</th>
                <th className="text-left py-3 px-4">Telefone</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Aniversário</th>
                <th className="text-left py-3 px-4">Classificação</th>
                <th className="text-left py-3 px-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {/* Mock data */}
              <tr className="border-b">
                <td className="py-3 px-4">João Silva</td>
                <td className="py-3 px-4">
                  <a href="https://wa.me/5511999999999" target="_blank" className="text-primary hover:underline">
                    (11) 99999-9999
                  </a>
                </td>
                <td className="py-3 px-4">
                  <a href="mailto:joao@email.com" className="text-primary hover:underline">
                    joao@email.com
                  </a>
                </td>
                <td className="py-3 px-4">15/05/1990</td>
                <td className="py-3 px-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="w-4 h-4 text-yellow-400 fill-yellow-400"
                      />
                    ))}
                  </div>
                </td>
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


import { Card } from "@/components/ui/card";
import { Gift, CheckSquare } from "lucide-react";

export default function Notificacoes() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notificações</h1>
      </div>

      <div className="grid gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Aniversários</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <Gift className="w-6 h-6 text-pink-500" />
              <div>
                <h3 className="font-medium">João Silva</h3>
                <p className="text-sm text-gray-500">Aniversário hoje!</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Tarefas Pendentes</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <CheckSquare className="w-6 h-6 text-yellow-500" />
              <div>
                <h3 className="font-medium">Contatar cliente X</h3>
                <p className="text-sm text-gray-500">Vence hoje</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

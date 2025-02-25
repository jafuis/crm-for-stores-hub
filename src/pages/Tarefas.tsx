
import { Card } from "@/components/ui/card";
import { CheckSquare } from "lucide-react";

export default function Tarefas() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tarefas</h1>
        <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
          Nova Tarefa
        </button>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <button className="text-gray-400 hover:text-primary transition-colors">
              <CheckSquare className="w-6 h-6" />
            </button>
            <div>
              <h3 className="font-medium">Contatar cliente X</h3>
              <p className="text-sm text-gray-500">Vencimento: 20/04/2024</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

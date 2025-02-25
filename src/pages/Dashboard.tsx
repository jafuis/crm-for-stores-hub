
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const currentDate = new Date();
  const currentMonth = format(currentDate, 'MMMM yyyy', { locale: ptBR });
  
  // Mock data (will be replaced with real data later)
  const dailyTarget = 5000;
  const currentSales = 3750;
  const progress = (currentSales / dailyTarget) * 100;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{currentMonth}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Total de Vendas</h3>
          <p className="text-2xl font-bold mt-2">R$ {currentSales.toLocaleString()}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Meta Diária</h3>
          <Progress value={progress} className="mt-2" />
          <div className="flex justify-between mt-2 text-sm">
            <span>R$ {currentSales.toLocaleString()}</span>
            <span>R$ {dailyTarget.toLocaleString()}</span>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Total de Clientes</h3>
          <p className="text-2xl font-bold mt-2">156</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Vendas do Mês</h3>
          <p className="text-2xl font-bold mt-2">R$ 45.670</p>
          <p className="text-sm text-gray-500 mt-1">{currentMonth}</p>
        </Card>
      </div>
    </div>
  );
}

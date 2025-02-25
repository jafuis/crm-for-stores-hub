
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckSquare, Plus } from "lucide-react";

interface Tarefa {
  id: string;
  titulo: string;
  concluida: boolean;
}

export default function Tarefas() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [novaTarefa, setNovaTarefa] = useState({
    titulo: "",
  });

  useEffect(() => {
    const tarefasSalvas = localStorage.getItem('tarefas');
    if (tarefasSalvas) {
      setTarefas(JSON.parse(tarefasSalvas));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tarefas', JSON.stringify(tarefas));
  }, [tarefas]);

  const handleAdicionarTarefa = () => {
    if (!novaTarefa.titulo) return;

    const tarefa: Tarefa = {
      id: (tarefas.length + 1).toString(),
      titulo: novaTarefa.titulo,
      concluida: false,
    };

    const novasTarefas = [...tarefas, tarefa];
    setTarefas(novasTarefas);
    localStorage.setItem('tarefas', JSON.stringify(novasTarefas));
    setNovaTarefa({ titulo: "" });
  };

  const toggleTarefaConcluida = (id: string) => {
    const tarefasAtualizadas = tarefas.map(tarefa =>
      tarefa.id === id ? { ...tarefa, concluida: !tarefa.concluida } : tarefa
    );
    setTarefas(tarefasAtualizadas);
    localStorage.setItem('tarefas', JSON.stringify(tarefasAtualizadas));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tarefas</h1>
          <p className="text-muted-foreground">Gerencie suas tarefas</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Nova Tarefa</h2>
          <div className="flex gap-4">
            <Input
              placeholder="Título da tarefa"
              value={novaTarefa.titulo}
              onChange={(e) => setNovaTarefa({ ...novaTarefa, titulo: e.target.value })}
              className="flex-1"
            />
            <Button 
              className="bg-[#9b87f5] hover:bg-[#7e69ab]"
              onClick={handleAdicionarTarefa}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {tarefas.map((tarefa) => (
          <Card key={tarefa.id} className="p-4">
            <div className="flex items-center gap-4">
              <button 
                className={`text-2xl transition-colors ${tarefa.concluida ? 'text-green-500' : 'text-gray-400 hover:text-[#9b87f5]'}`}
                onClick={() => toggleTarefaConcluida(tarefa.id)}
              >
                <CheckSquare className="w-6 h-6" />
              </button>
              <div className={`flex-1 ${tarefa.concluida ? 'line-through text-gray-500' : ''}`}>
                <h3 className="font-medium">{tarefa.titulo}</h3>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

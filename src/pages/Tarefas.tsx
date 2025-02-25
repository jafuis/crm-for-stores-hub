
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckSquare, Plus, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Tarefa {
  id: string;
  titulo: string;
  concluida: boolean;
  dataVencimento: string;
}

export default function Tarefas() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [novaTarefa, setNovaTarefa] = useState({
    titulo: "",
    dataVencimento: new Date().toISOString().split('T')[0]
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
      id: Date.now().toString(),
      titulo: novaTarefa.titulo,
      concluida: false,
      dataVencimento: novaTarefa.dataVencimento
    };

    const novasTarefas = [...tarefas, tarefa];
    setTarefas(novasTarefas);
    setNovaTarefa({ titulo: "", dataVencimento: new Date().toISOString().split('T')[0] });
  };

  const toggleTarefaConcluida = (id: string) => {
    const tarefasAtualizadas = tarefas.map(tarefa =>
      tarefa.id === id ? { ...tarefa, concluida: !tarefa.concluida } : tarefa
    );
    setTarefas(tarefasAtualizadas);
  };

  const handleExcluirTarefa = (id: string) => {
    const tarefasAtualizadas = tarefas.filter(tarefa => tarefa.id !== id);
    setTarefas(tarefasAtualizadas);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tarefas</h1>
        <Button 
          className="bg-[#9b87f5] hover:bg-[#7e69ab]"
          onClick={() => document.getElementById('novaTarefaForm')?.focus()}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Nova Tarefa</h2>
          <div className="flex gap-4">
            <Input
              id="novaTarefaForm"
              placeholder="Título da tarefa"
              value={novaTarefa.titulo}
              onChange={(e) => setNovaTarefa({ ...novaTarefa, titulo: e.target.value })}
              className="flex-1"
            />
            <Input
              type="date"
              value={novaTarefa.dataVencimento}
              onChange={(e) => setNovaTarefa({ ...novaTarefa, dataVencimento: e.target.value })}
              className="w-auto"
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
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <button 
                  className={`text-2xl transition-colors ${tarefa.concluida ? 'text-green-500' : 'text-gray-400 hover:text-[#9b87f5]'}`}
                  onClick={() => toggleTarefaConcluida(tarefa.id)}
                >
                  <CheckSquare className="w-6 h-6" />
                </button>
                <div className={`flex-1 ${tarefa.concluida ? 'line-through text-gray-500' : ''}`}>
                  <h3 className="font-medium">{tarefa.titulo}</h3>
                  <p className="text-sm text-gray-500">Vence em: {tarefa.dataVencimento}</p>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir tarefa</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleExcluirTarefa(tarefa.id)}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

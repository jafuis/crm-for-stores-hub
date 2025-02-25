
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Users, DollarSign, Truck, CheckSquare } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Venda {
  id: string;
  valor: number;
  data: string;
  arquivada?: boolean;
}

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  aniversario: string;
  classificacao: number;
}

interface Fornecedor {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  endereco: string;
  produtos: string;
}

interface Tarefa {
  id: string;
  titulo: string;
  concluida: boolean;
  dataVencimento: string;
}

export default function Configuracoes() {
  const gerarRelatorioVendas = () => {
    const vendas: Venda[] = JSON.parse(localStorage.getItem('vendas') || '[]');
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.text("Relatório de Vendas", 14, 15);
    doc.setFont("helvetica", "normal");
    
    const vendasAtivas = vendas.filter(v => !v.arquivada);
    const totalVendas = vendasAtivas.reduce((acc, v) => acc + v.valor, 0);
    
    const dados = vendasAtivas.map(venda => [
      format(new Date(venda.data), "dd/MM/yyyy HH:mm", { locale: ptBR }),
      venda.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      venda.arquivada ? "Sim" : "Não"
    ]);

    autoTable(doc, {
      head: [["Data", "Valor", "Arquivada"]],
      body: dados,
      startY: 25,
    });

    doc.text(`Total de Vendas: ${totalVendas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 14, doc.lastAutoTable.finalY + 10);
    
    doc.save('relatorio-vendas.pdf');
  };

  const gerarRelatorioClientes = () => {
    const clientes: Cliente[] = JSON.parse(localStorage.getItem('clientes') || '[]');
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.text("Relatório de Clientes", 14, 15);
    doc.setFont("helvetica", "normal");
    
    const dados = clientes.map(cliente => [
      cliente.nome,
      cliente.telefone,
      cliente.email,
      format(new Date(cliente.aniversario), "dd/MM/yyyy", { locale: ptBR }),
      "⭐".repeat(cliente.classificacao)
    ]);

    autoTable(doc, {
      head: [["Nome", "Telefone", "Email", "Aniversário", "Classificação"]],
      body: dados,
      startY: 25,
    });
    
    doc.save('relatorio-clientes.pdf');
  };

  const gerarRelatorioFornecedores = () => {
    const fornecedores: Fornecedor[] = JSON.parse(localStorage.getItem('fornecedores') || '[]');
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.text("Relatório de Fornecedores", 14, 15);
    doc.setFont("helvetica", "normal");
    
    const dados = fornecedores.map(fornecedor => [
      fornecedor.nome,
      fornecedor.telefone,
      fornecedor.email,
      fornecedor.endereco,
      fornecedor.produtos
    ]);

    autoTable(doc, {
      head: [["Nome", "Telefone", "Email", "Endereço", "Produtos"]],
      body: dados,
      startY: 25,
    });
    
    doc.save('relatorio-fornecedores.pdf');
  };

  const gerarRelatorioTarefas = () => {
    const tarefas: Tarefa[] = JSON.parse(localStorage.getItem('tarefas') || '[]');
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.text("Relatório de Tarefas", 14, 15);
    doc.setFont("helvetica", "normal");
    
    const dados = tarefas.map(tarefa => [
      tarefa.titulo,
      format(new Date(tarefa.dataVencimento), "dd/MM/yyyy", { locale: ptBR }),
      tarefa.concluida ? "Concluída" : "Pendente"
    ]);

    autoTable(doc, {
      head: [["Título", "Data de Vencimento", "Status"]],
      body: dados,
      startY: 25,
    });
    
    doc.save('relatorio-tarefas.pdf');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Configurações</h1>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Relatórios</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Button
            variant="outline"
            className="flex items-center justify-start gap-2 h-auto py-4"
            onClick={gerarRelatorioVendas}
          >
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#9b87f5]" />
            </div>
            <div className="text-left">
              <div className="font-semibold">Relatório de Vendas</div>
              <div className="text-sm text-gray-500">Exportar histórico de vendas</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="flex items-center justify-start gap-2 h-auto py-4"
            onClick={gerarRelatorioClientes}
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-left">
              <div className="font-semibold">Relatório de Clientes</div>
              <div className="text-sm text-gray-500">Exportar lista de clientes</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="flex items-center justify-start gap-2 h-auto py-4"
            onClick={gerarRelatorioFornecedores}
          >
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Truck className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-left">
              <div className="font-semibold">Relatório de Fornecedores</div>
              <div className="text-sm text-gray-500">Exportar lista de fornecedores</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="flex items-center justify-start gap-2 h-auto py-4"
            onClick={gerarRelatorioTarefas}
          >
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-left">
              <div className="font-semibold">Relatório de Tarefas</div>
              <div className="text-sm text-gray-500">Exportar lista de tarefas</div>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );
}

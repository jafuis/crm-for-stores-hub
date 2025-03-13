
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { useContasPagar } from "@/hooks/useContasPagar";
import ContaForm from "@/components/contas-pagar/ContaForm";
import ContaList from "@/components/contas-pagar/ContaList";

interface ContaPagar {
  id: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  status: string;
  importante: boolean;
  categoria: string;
}

export default function ContasPagar() {
  const [busca, setBusca] = useState("");
  const [currentTab, setCurrentTab] = useState("ativas");
  const { 
    contas, 
    contasArquivadas, 
    isLoading, 
    contaEditando, 
    setContaEditando,
    fetchContas,
    handleMarcarComoPaga,
    handleArquivarConta,
    handleRestaurarConta,
    handleToggleImportante,
    handleExcluirConta
  } = useContasPagar();

  useEffect(() => {
    fetchContas();
  }, [currentTab]);

  const contasFiltradas = currentTab === "ativas" 
    ? contas.filter(conta => 
        conta.descricao.toLowerCase().includes(busca.toLowerCase()) ||
        conta.categoria.toLowerCase().includes(busca.toLowerCase()))
    : contasArquivadas.filter(conta => 
        conta.descricao.toLowerCase().includes(busca.toLowerCase()) ||
        conta.categoria.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Contas a Pagar</h1>
          <p className="text-muted-foreground">Gerencie suas despesas e pagamentos</p>
        </div>
        <ContaForm 
          contaEditando={contaEditando} 
          setContaEditando={setContaEditando}
          onSaveSuccess={fetchContas}
        />
      </div>

      <Tabs defaultValue="ativas" onValueChange={setCurrentTab}>
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="ativas" className="flex-1">Contas Ativas</TabsTrigger>
          <TabsTrigger value="arquivadas" className="flex-1">Arquivadas/Pagas</TabsTrigger>
        </TabsList>
        
        <div className="relative mt-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar contas..."
            className="pl-10 w-full"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <TabsContent value="ativas" className="mt-4">
          <ContaList
            contas={contasFiltradas}
            isLoading={isLoading}
            onMarcarComoPaga={handleMarcarComoPaga}
            onEditar={setContaEditando}
            onToggleImportante={handleToggleImportante}
            onArquivar={handleArquivarConta}
            onExcluir={handleExcluirConta}
          />
        </TabsContent>

        <TabsContent value="arquivadas" className="mt-4">
          <ContaList
            contas={contasFiltradas}
            isLoading={isLoading}
            arquivada={true}
            onMarcarComoPaga={handleMarcarComoPaga}
            onEditar={setContaEditando}
            onToggleImportante={handleToggleImportante}
            onArquivar={handleArquivarConta}
            onExcluir={handleExcluirConta}
            onRestaurar={handleRestaurarConta}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

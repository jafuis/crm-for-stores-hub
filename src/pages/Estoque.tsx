
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Package, Search, Edit, Trash2, Plus } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface Produto {
  id: string;
  nome: string;
  quantidade: number;
  valorUnitario: number;
}

export default function Estoque() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState("");
  const [novoProduto, setNovoProduto] = useState({
    nome: "",
    quantidade: "",
    valorUnitario: "",
  });
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);

  const handleAdicionarProduto = () => {
    if (!novoProduto.nome || !novoProduto.quantidade || !novoProduto.valorUnitario) return;

    const produto: Produto = {
      id: (produtos.length + 1).toString(),
      nome: novoProduto.nome,
      quantidade: Number(novoProduto.quantidade),
      valorUnitario: Number(novoProduto.valorUnitario),
    };

    setProdutos([...produtos, produto]);
    setNovoProduto({
      nome: "",
      quantidade: "",
      valorUnitario: "",
    });
  };

  const handleExcluirProduto = (id: string) => {
    setProdutos(produtos.filter(p => p.id !== id));
  };

  const handleSalvarEdicao = () => {
    if (!produtoEditando) return;

    setProdutos(produtos.map(p => 
      p.id === produtoEditando.id ? produtoEditando : p
    ));
    setProdutoEditando(null);
  };

  const produtosFiltrados = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const valorTotal = produtosFiltrados.reduce(
    (total, produto) => total + (produto.quantidade * produto.valorUnitario),
    0
  );

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Controle de Estoque</h1>
        <p className="text-muted-foreground">
          Gerencie seus produtos e estoque
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Novo Produto</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Nome do produto"
              value={novoProduto.nome}
              onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })}
            />
            <Input
              placeholder="Quantidade"
              type="number"
              min="0"
              value={novoProduto.quantidade}
              onChange={(e) => setNovoProduto({ ...novoProduto, quantidade: e.target.value })}
            />
            <Input
              placeholder="Valor unitário"
              type="number"
              min="0"
              step="0.01"
              value={novoProduto.valorUnitario}
              onChange={(e) => setNovoProduto({ ...novoProduto, valorUnitario: e.target.value })}
            />
          </div>
          <Button 
            className="bg-[#9b87f5] hover:bg-[#7e69ab] w-full md:w-auto"
            onClick={handleAdicionarProduto}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Produto
          </Button>
        </div>
      </Card>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative flex-1 w-full md:w-auto">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar produtos..."
            className="pl-10"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="text-lg font-semibold">
          Valor Total: {formatarMoeda(valorTotal)}
        </div>
      </div>

      <Card className="p-6">
        {produtos.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Nenhum produto cadastrado.
          </p>
        ) : (
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
                {produtosFiltrados.map((produto) => (
                  <tr key={produto.id} className="border-b">
                    <td className="py-3 px-4">{produto.nome}</td>
                    <td className="py-3 px-4">{produto.quantidade}</td>
                    <td className="py-3 px-4">{formatarMoeda(produto.valorUnitario)}</td>
                    <td className="py-3 px-4">
                      {formatarMoeda(produto.quantidade * produto.valorUnitario)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setProdutoEditando(produto)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </SheetTrigger>
                          <SheetContent>
                            <SheetHeader>
                              <SheetTitle>Editar Produto</SheetTitle>
                            </SheetHeader>
                            {produtoEditando && (
                              <div className="space-y-4 mt-4">
                                <Input
                                  placeholder="Nome do produto"
                                  value={produtoEditando.nome}
                                  onChange={e => setProdutoEditando({
                                    ...produtoEditando,
                                    nome: e.target.value
                                  })}
                                />
                                <Input
                                  placeholder="Quantidade"
                                  type="number"
                                  min="0"
                                  value={produtoEditando.quantidade}
                                  onChange={e => setProdutoEditando({
                                    ...produtoEditando,
                                    quantidade: Number(e.target.value)
                                  })}
                                />
                                <Input
                                  placeholder="Valor unitário"
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={produtoEditando.valorUnitario}
                                  onChange={e => setProdutoEditando({
                                    ...produtoEditando,
                                    valorUnitario: Number(e.target.value)
                                  })}
                                />
                                <Button onClick={handleSalvarEdicao} className="w-full">
                                  Salvar Alterações
                                </Button>
                              </div>
                            )}
                          </SheetContent>
                        </Sheet>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleExcluirProduto(produto.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

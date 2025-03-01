
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Truck, Search, MapPin, Phone, Mail, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Fornecedor {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  endereco: string;
  produtos: string;
}

export default function Fornecedores() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [busca, setBusca] = useState("");
  const [fornecedorEditando, setFornecedorEditando] = useState<Fornecedor | null>(null);
  const [novoFornecedor, setNovoFornecedor] = useState<Partial<Fornecedor>>({
    nome: "",
    telefone: "",
    email: "",
    endereco: "",
    produtos: "",
  });
  const { toast } = useToast();

  // Carregar fornecedores do localStorage ao iniciar
  useEffect(() => {
    const fornecedoresSalvos = localStorage.getItem('fornecedores');
    if (fornecedoresSalvos) {
      setFornecedores(JSON.parse(fornecedoresSalvos));
    }
  }, []);

  // Salvar fornecedores no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('fornecedores', JSON.stringify(fornecedores));
  }, [fornecedores]);

  const handleAddNovoFornecedor = () => {
    if (!novoFornecedor.nome || !novoFornecedor.produtos) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e produtos são campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const fornecedor: Fornecedor = {
      id: Date.now().toString(),
      nome: novoFornecedor.nome!,
      telefone: novoFornecedor.telefone || "",
      email: novoFornecedor.email || "",
      endereco: novoFornecedor.endereco || "",
      produtos: novoFornecedor.produtos!,
    };

    setFornecedores([...fornecedores, fornecedor]);
    setNovoFornecedor({
      nome: "",
      telefone: "",
      email: "",
      endereco: "",
      produtos: "",
    });
    
    toast({
      title: "Fornecedor adicionado",
      description: "O fornecedor foi adicionado com sucesso"
    });
  };

  const handleExcluirFornecedor = (id: string) => {
    setFornecedores(fornecedores.filter(f => f.id !== id));
    toast({
      title: "Fornecedor excluído",
      description: "O fornecedor foi excluído com sucesso"
    });
  };

  const handleSalvarEdicao = () => {
    if (!fornecedorEditando) return;

    setFornecedores(fornecedores.map(f => 
      f.id === fornecedorEditando.id ? fornecedorEditando : f
    ));
    setFornecedorEditando(null);
    
    toast({
      title: "Fornecedor atualizado",
      description: "As alterações foram salvas com sucesso"
    });
  };

  const fornecedoresFiltrados = fornecedores.filter(fornecedor =>
    fornecedor.nome.toLowerCase().includes(busca.toLowerCase()) ||
    fornecedor.produtos.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Fornecedores</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button className="bg-[#9b87f5] hover:bg-[#7e69ab] w-full md:w-auto">
              <Truck className="w-4 h-4 mr-2" />
              Adicionar Fornecedor
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Novo Fornecedor</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-4">
              <Input
                placeholder="Nome"
                value={novoFornecedor.nome}
                onChange={e => setNovoFornecedor({ ...novoFornecedor, nome: e.target.value })}
              />
              <Input
                placeholder="Telefone"
                value={novoFornecedor.telefone}
                onChange={e => setNovoFornecedor({ ...novoFornecedor, telefone: e.target.value })}
              />
              <Input
                placeholder="Email"
                type="email"
                value={novoFornecedor.email}
                onChange={e => setNovoFornecedor({ ...novoFornecedor, email: e.target.value })}
              />
              <Input
                placeholder="Endereço"
                value={novoFornecedor.endereco}
                onChange={e => setNovoFornecedor({ ...novoFornecedor, endereco: e.target.value })}
              />
              <Input
                placeholder="Produtos fornecidos"
                value={novoFornecedor.produtos}
                onChange={e => setNovoFornecedor({ ...novoFornecedor, produtos: e.target.value })}
              />
              <Button onClick={handleAddNovoFornecedor} className="w-full">
                Adicionar Fornecedor
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Buscar fornecedores..."
          className="pl-10"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <Card className="p-6">
        {fornecedoresFiltrados.length > 0 ? (
          <div className="space-y-4">
            {fornecedoresFiltrados.map((fornecedor) => (
              <div
                key={fornecedor.id}
                className="flex flex-col space-y-4 p-4 border rounded-lg"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div>
                    <h3 className="font-medium">{fornecedor.nome}</h3>
                    <p className="text-sm text-muted-foreground">
                      Produtos: {fornecedor.produtos}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setFornecedorEditando(fornecedor)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle>Editar Fornecedor</SheetTitle>
                        </SheetHeader>
                        {fornecedorEditando && (
                          <div className="space-y-4 mt-4">
                            <Input
                              placeholder="Nome"
                              value={fornecedorEditando.nome}
                              onChange={e => setFornecedorEditando({
                                ...fornecedorEditando,
                                nome: e.target.value
                              })}
                            />
                            <Input
                              placeholder="Telefone"
                              value={fornecedorEditando.telefone}
                              onChange={e => setFornecedorEditando({
                                ...fornecedorEditando,
                                telefone: e.target.value
                              })}
                            />
                            <Input
                              placeholder="Email"
                              type="email"
                              value={fornecedorEditando.email}
                              onChange={e => setFornecedorEditando({
                                ...fornecedorEditando,
                                email: e.target.value
                              })}
                            />
                            <Input
                              placeholder="Endereço"
                              value={fornecedorEditando.endereco}
                              onChange={e => setFornecedorEditando({
                                ...fornecedorEditando,
                                endereco: e.target.value
                              })}
                            />
                            <Input
                              placeholder="Produtos fornecidos"
                              value={fornecedorEditando.produtos}
                              onChange={e => setFornecedorEditando({
                                ...fornecedorEditando,
                                produtos: e.target.value
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
                      onClick={() => handleExcluirFornecedor(fornecedor.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col md:grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <a
                      href={`tel:${fornecedor.telefone}`}
                      className="hover:underline"
                    >
                      {fornecedor.telefone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <a
                      href={`mailto:${fornecedor.email}`}
                      className="hover:underline"
                    >
                      {fornecedor.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{fornecedor.endereco}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-6 text-gray-500">
            <Truck className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Nenhum fornecedor encontrado</p>
          </div>
        )}
      </Card>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Truck, Search, Edit, Trash2, Plus, Phone } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Fornecedor {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  products: string;
  owner_id?: string;
  created_at?: string;
}

export default function Fornecedores() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [busca, setBusca] = useState("");
  const [novoFornecedor, setNovoFornecedor] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    products: ""
  });
  const [fornecedorEditando, setFornecedorEditando] = useState<Fornecedor | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFornecedores();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchFornecedores = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      const fornecedoresData = data?.map(supplier => ({
        ...supplier,
        products: ""
      })) || [];
      
      setFornecedores(fornecedoresData);
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os fornecedores.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdicionarFornecedor = async () => {
    if (!novoFornecedor.name) {
      toast({
        title: "Erro",
        description: "O nome do fornecedor é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { products, ...fornecedorData } = novoFornecedor;
      
      const { data, error } = await supabase
        .from('suppliers')
        .insert([fornecedorData])
        .select()
        .single();

      if (error) throw error;

      const newFornecedor: Fornecedor = {
        ...data,
        products: products
      };

      setFornecedores([...fornecedores, newFornecedor]);
      setNovoFornecedor({
        name: "",
        phone: "",
        email: "",
        address: "",
        products: ""
      });
      
      toast({
        title: "Sucesso",
        description: "Fornecedor adicionado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao adicionar fornecedor:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o fornecedor.",
        variant: "destructive"
      });
    }
  };

  const handleExcluirFornecedor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFornecedores(fornecedores.filter(f => f.id !== id));
      toast({
        title: "Sucesso",
        description: "Fornecedor excluído com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao excluir fornecedor:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o fornecedor.",
        variant: "destructive"
      });
    }
  };

  const handleSalvarEdicao = async () => {
    if (!fornecedorEditando) return;

    try {
      const { products, created_at, ...fornecedorData } = fornecedorEditando;
      
      const { error } = await supabase
        .from('suppliers')
        .update(fornecedorData)
        .eq('id', fornecedorEditando.id);

      if (error) throw error;

      setFornecedores(fornecedores.map(f => 
        f.id === fornecedorEditando.id ? fornecedorEditando : f
      ));
      setFornecedorEditando(null);
      
      toast({
        title: "Sucesso",
        description: "Fornecedor atualizado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao atualizar fornecedor:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o fornecedor.",
        variant: "destructive"
      });
    }
  };

  const formatarTelefoneParaWhatsApp = (telefone: string) => {
    const numeroLimpo = telefone.replace(/\D/g, '');
    let numeroFormatado = numeroLimpo;
    if (!numeroLimpo.startsWith('55') && numeroLimpo.length > 8) {
      numeroFormatado = `55${numeroLimpo}`;
    }
    return `https://wa.me/${numeroFormatado}`;
  };

  const fornecedoresFiltrados = fornecedores.filter(fornecedor =>
    fornecedor.name.toLowerCase().includes(busca.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9b87f5]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Fornecedores</h1>
        <p className="text-muted-foreground">
          Gerencie os fornecedores de sua loja
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Novo Fornecedor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Nome do fornecedor"
              value={novoFornecedor.name}
              onChange={(e) => setNovoFornecedor({ ...novoFornecedor, name: e.target.value })}
            />
            <Input
              placeholder="Telefone"
              value={novoFornecedor.phone}
              onChange={(e) => setNovoFornecedor({ ...novoFornecedor, phone: e.target.value })}
            />
            <Input
              placeholder="Email"
              value={novoFornecedor.email}
              onChange={(e) => setNovoFornecedor({ ...novoFornecedor, email: e.target.value })}
            />
            <Input
              placeholder="Endereço"
              value={novoFornecedor.address}
              onChange={(e) => setNovoFornecedor({ ...novoFornecedor, address: e.target.value })}
            />
            <Input
              placeholder="Produtos fornecidos"
              value={novoFornecedor.products}
              onChange={(e) => setNovoFornecedor({ ...novoFornecedor, products: e.target.value })}
              className="md:col-span-2"
            />
          </div>
          <Button 
            className="bg-[#9b87f5] hover:bg-[#7e69ab] w-full md:w-auto"
            onClick={handleAdicionarFornecedor}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Fornecedor
          </Button>
        </div>
      </Card>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Buscar fornecedores..."
          className="pl-10"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fornecedoresFiltrados.map((fornecedor) => (
          <Card key={fornecedor.id} className="p-4">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{fornecedor.name}</h3>
                  {fornecedor.phone && (
                    <a 
                      href={formatarTelefoneParaWhatsApp(fornecedor.phone)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Phone className="h-3 w-3" />
                      {fornecedor.phone}
                    </a>
                  )}
                  {fornecedor.email && (
                    <p className="text-sm text-muted-foreground">
                      {fornecedor.email}
                    </p>
                  )}
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
                            placeholder="Nome do fornecedor"
                            value={fornecedorEditando.name}
                            onChange={(e) => setFornecedorEditando({
                              ...fornecedorEditando,
                              name: e.target.value
                            })}
                          />
                          <Input
                            placeholder="Telefone"
                            value={fornecedorEditando.phone}
                            onChange={(e) => setFornecedorEditando({
                              ...fornecedorEditando,
                              phone: e.target.value
                            })}
                          />
                          <Input
                            placeholder="Email"
                            value={fornecedorEditando.email}
                            onChange={(e) => setFornecedorEditando({
                              ...fornecedorEditando,
                              email: e.target.value
                            })}
                          />
                          <Input
                            placeholder="Endereço"
                            value={fornecedorEditando.address}
                            onChange={(e) => setFornecedorEditando({
                              ...fornecedorEditando,
                              address: e.target.value
                            })}
                          />
                          <Input
                            placeholder="Produtos fornecidos"
                            value={fornecedorEditando.products}
                            onChange={(e) => setFornecedorEditando({
                              ...fornecedorEditando,
                              products: e.target.value
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
              {fornecedor.address && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Endereço:</span> {fornecedor.address}
                </p>
              )}
              {fornecedor.products && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Produtos:</span> {fornecedor.products}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {fornecedoresFiltrados.length === 0 && (
        <div className="text-center p-8">
          <Truck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Nenhum fornecedor encontrado</h3>
          <p className="text-muted-foreground">
            Adicione fornecedores ou tente outra busca
          </p>
        </div>
      )}
    </div>
  );
}

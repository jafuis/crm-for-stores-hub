import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Trash2, FileEdit, Phone } from "lucide-react";

interface Fornecedor {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  products: string;
  created_at?: string;
  owner_id?: string;
}

export default function Fornecedores() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [novoFornecedor, setNovoFornecedor] = useState<Fornecedor>({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    products: ""
  });
  const [fornecedorEditando, setFornecedorEditando] = useState<Fornecedor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editDialogAberto, setEditDialogAberto] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFornecedores();
    }
  }, [user]);

  const fetchFornecedores = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('suppliers')
        .select('*');
      
      if (error) throw error;
      
      const fornecedoresData = data?.map(supplier => ({
        ...supplier,
        products: ""
      })) || [];
      
      setFornecedores(fornecedoresData);
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
      toast({
        title: "Erro ao carregar fornecedores",
        description: "Não foi possível carregar os fornecedores. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdicionarFornecedor = async () => {
    if (!novoFornecedor.name || !novoFornecedor.email || !user) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e email são campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { products, ...fornecedorData } = novoFornecedor;
      
      const { data, error } = await supabase
        .from('suppliers')
        .insert({
          ...fornecedorData,
          id: uuidv4(),
          owner_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      const newFornecedor: Fornecedor = {
        ...data,
        products: products
      };

      setFornecedores([...fornecedores, newFornecedor]);
      setNovoFornecedor({
        id: "",
        name: "",
        email: "",
        phone: "",
        address: "",
        products: ""
      });
      setDialogAberto(false);

      toast({
        title: "Fornecedor adicionado",
        description: "O fornecedor foi adicionado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao adicionar fornecedor:', error);
      toast({
        title: "Erro ao adicionar fornecedor",
        description: "Não foi possível adicionar o fornecedor. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleEditarFornecedor = (fornecedor: Fornecedor) => {
    setFornecedorEditando(fornecedor);
    setEditDialogAberto(true);
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
      setEditDialogAberto(false);

      toast({
        title: "Fornecedor atualizado",
        description: "As informações do fornecedor foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar fornecedor:', error);
      toast({
        title: "Erro ao atualizar fornecedor",
        description: "Não foi possível atualizar o fornecedor. Tente novamente.",
        variant: "destructive",
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

  const formatarTelefoneParaWhatsApp = (telefone: string) => {
    const numeroLimpo = telefone.replace(/\D/g, '');
    let numeroFormatado = numeroLimpo;
    if (!numeroLimpo.startsWith('55') && numeroLimpo.length > 8) {
      numeroFormatado = `55${numeroLimpo}`;
    }
    return `https://wa.me/${numeroFormatado}`;
  };

  const formatarEmailParaMailto = (email: string) => {
    return `mailto:${email}`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Fornecedores</h1>
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button className="bg-[#9b87f5] hover:bg-[#7e69ab]">
              <Plus className="w-4 h-4 mr-2" />
              Novo Fornecedor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Fornecedor</DialogTitle>
              <DialogDescription>
                Preencha os dados do fornecedor abaixo.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="nome" className="text-sm font-medium">Nome*</label>
                <Input
                  id="nome"
                  value={novoFornecedor.name}
                  onChange={(e) => setNovoFornecedor({...novoFornecedor, name: e.target.value})}
                  placeholder="Nome do fornecedor"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email*</label>
                <Input
                  id="email"
                  type="email"
                  value={novoFornecedor.email}
                  onChange={(e) => setNovoFornecedor({...novoFornecedor, email: e.target.value})}
                  placeholder="Email do fornecedor"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="telefone" className="text-sm font-medium">Telefone</label>
                <Input
                  id="telefone"
                  value={novoFornecedor.phone}
                  onChange={(e) => setNovoFornecedor({...novoFornecedor, phone: e.target.value})}
                  placeholder="Telefone do fornecedor"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="endereco" className="text-sm font-medium">Endereço</label>
                <Input
                  id="endereco"
                  value={novoFornecedor.address}
                  onChange={(e) => setNovoFornecedor({...novoFornecedor, address: e.target.value})}
                  placeholder="Endereço do fornecedor"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="produtos" className="text-sm font-medium">Produtos</label>
                <Textarea
                  id="produtos"
                  value={novoFornecedor.products}
                  onChange={(e) => setNovoFornecedor({...novoFornecedor, products: e.target.value})}
                  placeholder="Produtos fornecidos"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogAberto(false)}>Cancelar</Button>
              <Button className="bg-[#9b87f5] hover:bg-[#7e69ab]" onClick={handleAdicionarFornecedor}>
                Adicionar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9b87f5]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fornecedores.length === 0 ? (
            <Card className="p-8 text-center col-span-full">
              <h3 className="text-lg font-medium text-gray-500">Nenhum fornecedor encontrado</h3>
              <p className="text-gray-400 mt-2">Adicione fornecedores para começar</p>
            </Card>
          ) : (
            fornecedores.map((fornecedor) => (
              <Card key={fornecedor.id} className="p-6 relative">
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditarFornecedor(fornecedor)}
                  >
                    <FileEdit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir fornecedor</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir este fornecedor? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleExcluirFornecedor(fornecedor.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <h3 className="text-xl font-semibold mb-3">{fornecedor.name}</h3>
                <div className="space-y-2 mt-4">
                  {fornecedor.email && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Email: <a href={formatarEmailParaMailto(fornecedor.email)} className="hover:text-blue-500 hover:underline transition-colors">{fornecedor.email}</a>
                    </p>
                  )}
                  {fornecedor.phone && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Phone className="w-4 h-4 inline-block" /> 
                      <a href={formatarTelefoneParaWhatsApp(fornecedor.phone)} target="_blank" rel="noreferrer" className="hover:text-green-500 hover:underline transition-colors">
                        {fornecedor.phone}
                      </a>
                    </p>
                  )}
                  {fornecedor.address && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">Endereço: {fornecedor.address}</p>
                  )}
                  {fornecedor.products && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">Produtos: {fornecedor.products}</p>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      <Dialog open={editDialogAberto} onOpenChange={setEditDialogAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Fornecedor</DialogTitle>
            <DialogDescription>
              Atualize os dados do fornecedor abaixo.
            </DialogDescription>
          </DialogHeader>
          {fornecedorEditando && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="nome" className="text-sm font-medium">Nome*</label>
                <Input
                  id="nome"
                  value={fornecedorEditando.name}
                  onChange={(e) => setFornecedorEditando({...fornecedorEditando, name: e.target.value})}
                  placeholder="Nome do fornecedor"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email*</label>
                <Input
                  id="email"
                  type="email"
                  value={fornecedorEditando.email}
                  onChange={(e) => setFornecedorEditando({...fornecedorEditando, email: e.target.value})}
                  placeholder="Email do fornecedor"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="telefone" className="text-sm font-medium">Telefone</label>
                <Input
                  id="telefone"
                  value={fornecedorEditando.phone}
                  onChange={(e) => setFornecedorEditando({...fornecedorEditando, phone: e.target.value})}
                  placeholder="Telefone do fornecedor"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="endereco" className="text-sm font-medium">Endereço</label>
                <Input
                  id="endereco"
                  value={fornecedorEditando.address}
                  onChange={(e) => setFornecedorEditando({...fornecedorEditando, address: e.target.value})}
                  placeholder="Endereço do fornecedor"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="produtos" className="text-sm font-medium">Produtos</label>
                <Textarea
                  id="produtos"
                  value={fornecedorEditando.products}
                  onChange={(e) => setFornecedorEditando({...fornecedorEditando, products: e.target.value})}
                  placeholder="Produtos fornecidos"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogAberto(false)}>Cancelar</Button>
            <Button className="bg-[#9b87f5] hover:bg-[#7e69ab]" onClick={handleSalvarEdicao}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

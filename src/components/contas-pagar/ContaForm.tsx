
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus } from "lucide-react";
import { isBefore, parseISO } from "date-fns";

interface ContaPagar {
  id: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  status: string;
  importante: boolean;
  categoria: string;
}

interface ContaFormProps {
  contaEditando: ContaPagar | null;
  setContaEditando: (conta: ContaPagar | null) => void;
  onSaveSuccess: () => void;
}

export default function ContaForm({ contaEditando, setContaEditando, onSaveSuccess }: ContaFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [novaConta, setNovaConta] = useState({
    descricao: "",
    valor: "",
    data_vencimento: new Date().toISOString().split('T')[0],
    categoria: "geral",
    importante: false
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  useEffect(() => {
    if (contaEditando) {
      setNovaConta({
        descricao: contaEditando.descricao,
        valor: contaEditando.valor.toString(),
        data_vencimento: contaEditando.data_vencimento,
        categoria: contaEditando.categoria || "geral",
        importante: contaEditando.importante
      });
    }
  }, [contaEditando]);

  const handleSalvarConta = async () => {
    if (!user) return;
    
    if (!novaConta.descricao || !novaConta.valor || !novaConta.data_vencimento) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const valorNumerico = parseFloat(novaConta.valor.replace(',', '.'));
      
      if (isNaN(valorNumerico)) {
        toast({
          title: "Valor inválido",
          description: "O valor deve ser um número válido.",
          variant: "destructive"
        });
        return;
      }
      
      // Determinar o status com base na data de vencimento
      const dataVencimento = parseISO(novaConta.data_vencimento);
      const status = isBefore(dataVencimento, hoje) ? 'vencida' : 'pendente';
      
      if (contaEditando) {
        // Atualizando conta existente
        const { error } = await supabase
          .from('financas')
          .update({
            descricao: novaConta.descricao,
            valor: valorNumerico,
            data_vencimento: novaConta.data_vencimento,
            categoria: novaConta.categoria,
            importante: novaConta.importante,
            status: status
          })
          .eq('id', contaEditando.id);
        
        if (error) throw error;
        
        toast({
          title: "Conta atualizada",
          description: "A conta foi atualizada com sucesso."
        });
      } else {
        // Criando nova conta
        const { error } = await supabase
          .from('financas')
          .insert([{
            descricao: novaConta.descricao,
            valor: valorNumerico,
            data_vencimento: novaConta.data_vencimento,
            categoria: novaConta.categoria,
            importante: novaConta.importante,
            status: status,
            tipo: 'despesa',
            owner_id: user.id
          }]);
        
        if (error) throw error;
        
        toast({
          title: "Conta adicionada",
          description: "A conta a pagar foi adicionada com sucesso."
        });
      }
      
      // Limpar formulário
      setNovaConta({
        descricao: "",
        valor: "",
        data_vencimento: new Date().toISOString().split('T')[0],
        categoria: "geral",
        importante: false
      });
      setContaEditando(null);
      
      // Recarregar contas
      onSaveSuccess();
    } catch (error) {
      console.error("Erro ao salvar conta:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a conta. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="bg-[#9b87f5] hover:bg-[#7e69ab] w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Nova Conta
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-white">
        <SheetHeader>
          <SheetTitle>{contaEditando ? "Editar Conta" : "Adicionar Nova Conta"}</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Input
              placeholder="Descrição (ex: Aluguel, Luz, Internet)"
              value={novaConta.descricao}
              onChange={(e) => setNovaConta({ ...novaConta, descricao: e.target.value })}
            />
          </div>
          <div>
            <Input
              placeholder="Valor (R$)"
              value={novaConta.valor}
              onChange={(e) => {
                // Aceitar apenas números e vírgula
                const value = e.target.value.replace(/[^0-9,.]/g, '');
                setNovaConta({ ...novaConta, valor: value });
              }}
            />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Data de Vencimento</p>
            <Input
              type="date"
              value={novaConta.data_vencimento}
              onChange={(e) => setNovaConta({ ...novaConta, data_vencimento: e.target.value })}
            />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Categoria</p>
            <select 
              className="w-full p-2 border rounded-md"
              value={novaConta.categoria}
              onChange={(e) => setNovaConta({ ...novaConta, categoria: e.target.value })}
            >
              <option value="geral">Geral</option>
              <option value="aluguel">Aluguel</option>
              <option value="utilities">Serviços (Água, Luz, etc)</option>
              <option value="internet">Internet/Telefone</option>
              <option value="fornecedores">Fornecedores</option>
              <option value="impostos">Impostos</option>
              <option value="funcionarios">Funcionários</option>
              <option value="outros">Outros</option>
            </select>
          </div>
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="importante"
              checked={novaConta.importante}
              onChange={(e) => setNovaConta({ ...novaConta, importante: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="importante" className="text-sm text-gray-700">Marcar como importante</label>
          </div>
          <Button 
            className="w-full bg-[#9b87f5] hover:bg-[#7e69ab]"
            onClick={handleSalvarConta}
            disabled={isLoading}
          >
            {isLoading ? "Processando..." : contaEditando ? "Atualizar Conta" : "Adicionar Conta"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

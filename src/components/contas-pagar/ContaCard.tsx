
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, isBefore, isValid, addDays, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Star, WalletCards, Check, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface ContaPagar {
  id: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  status: string;
  importante: boolean;
  categoria: string;
}

interface ContaCardProps {
  conta: ContaPagar;
  onMarcarComoPaga: (id: string) => void;
  onEditar: (conta: ContaPagar) => void;
  onToggleImportante: (id: string, atual: boolean) => void;
  onArquivar: (id: string) => void;
  onExcluir: (id: string) => void;
  onRestaurar?: (id: string) => void;
  arquivada?: boolean;
}

export default function ContaCard({ 
  conta, 
  onMarcarComoPaga, 
  onEditar, 
  onToggleImportante, 
  onArquivar, 
  onExcluir, 
  onRestaurar,
  arquivada = false 
}: ContaCardProps) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const getStatusBadge = (status: string, dataVencimento: string) => {
    const data = parseISO(dataVencimento);
    const emBreve = isValid(data) && !isBefore(data, hoje) && isBefore(data, addDays(hoje, 3));
    
    if (status === 'vencida') {
      return <Badge variant="destructive" className="ml-2">Vencida</Badge>;
    } else if (status === 'paga') {
      return <Badge variant="outline" className="bg-green-100 text-green-800 ml-2">Paga</Badge>;
    } else if (status === 'arquivada') {
      return <Badge variant="outline" className="bg-gray-100 text-gray-800 ml-2">Arquivada</Badge>;
    } else if (emBreve) {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 ml-2">Vence em breve</Badge>;
    }
    
    return <Badge variant="outline" className="bg-blue-100 text-blue-800 ml-2">Pendente</Badge>;
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };
  
  return (
    <Card 
      key={conta.id} 
      className={`p-4 transition-all duration-200 ${
        arquivada ? 'opacity-80' : conta.status === 'vencida' 
          ? 'border-l-4 border-l-red-500 bg-red-50' 
          : conta.importante 
            ? 'border-l-4 border-l-yellow-500 bg-yellow-50' 
            : ''
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center">
          <div className="mr-3 text-gray-500">
            <WalletCards className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center">
              <h3 className="font-semibold">
                {conta.descricao}
                {conta.importante && (
                  <Star className="w-4 h-4 inline-block ml-1 fill-yellow-400 text-yellow-400" />
                )}
              </h3>
              {getStatusBadge(conta.status, conta.data_vencimento)}
            </div>
            <div className="text-sm text-gray-500">
              Vencimento: {format(parseISO(conta.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })}
            </div>
            <div className="font-medium text-lg">
              {formatarValor(conta.valor)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end md:self-auto">
          {!arquivada && (
            <Button
              variant="outline"
              size="sm"
              className="text-green-600 border-green-200 hover:bg-green-50"
              onClick={() => onMarcarComoPaga(conta.id)}
            >
              <Check className="w-4 h-4 mr-1" />
              Pagar
            </Button>
          )}
          
          {arquivada ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRestaurar && onRestaurar(conta.id)}
              >
                Restaurar
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir permanentemente esta conta?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => onExcluir(conta.id)}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditar(conta)}>
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleImportante(conta.id, conta.importante)}>
                  {conta.importante ? "Remover importância" : "Marcar como importante"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onArquivar(conta.id)}>
                  Arquivar
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-red-600">
                      Excluir
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onExcluir(conta.id)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </Card>
  );
}

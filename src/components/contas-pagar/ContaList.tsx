
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Archive, WalletCards } from "lucide-react";
import ContaCard from "./ContaCard";

interface ContaPagar {
  id: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  status: string;
  importante: boolean;
  categoria: string;
}

interface ContaListProps {
  contas: ContaPagar[];
  isLoading: boolean;
  arquivada?: boolean;
  onMarcarComoPaga: (id: string) => void;
  onEditar: (conta: ContaPagar) => void;
  onToggleImportante: (id: string, atual: boolean) => void;
  onArquivar: (id: string) => void;
  onExcluir: (id: string) => void;
  onRestaurar?: (id: string) => void;
}

export default function ContaList({
  contas,
  isLoading,
  arquivada = false,
  onMarcarComoPaga,
  onEditar,
  onToggleImportante,
  onArquivar,
  onExcluir,
  onRestaurar
}: ContaListProps) {
  
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }
  
  if (contas.length === 0) {
    return (
      <Card className="p-8 text-center">
        {arquivada ? (
          <Archive className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        ) : (
          <WalletCards className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        )}
        <p className="text-gray-500">
          {arquivada ? "Nenhuma conta arquivada ou paga encontrada." : "Nenhuma conta a pagar encontrada."}
        </p>
      </Card>
    );
  }
  
  return (
    <div className="grid gap-4">
      {contas.map(conta => (
        <ContaCard
          key={conta.id}
          conta={conta}
          arquivada={arquivada}
          onMarcarComoPaga={onMarcarComoPaga}
          onEditar={onEditar}
          onToggleImportante={onToggleImportante}
          onArquivar={onArquivar}
          onExcluir={onExcluir}
          onRestaurar={onRestaurar}
        />
      ))}
    </div>
  );
}

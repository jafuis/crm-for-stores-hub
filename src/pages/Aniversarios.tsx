import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Cake, Gift, MessageSquare, Mail, Phone, Calendar } from "lucide-react";
import { parseISO, format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  aniversario: string;
  classificacao: number;
}

export default function Aniversarios() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [aniversariantesHoje, setAniversariantesHoje] = useState<Cliente[]>([]);
  const [aniversariantesMes, setAniversariantesMes] = useState<Cliente[]>([]);
  const [activeTab, setActiveTab] = useState("hoje");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    carregarClientes();
    
    // Adicionar listener para mudanças nos clientes
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('clientDataChanged', carregarClientes);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('clientDataChanged', carregarClientes);
    };
  }, []);

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'clientes') {
      carregarClientes();
    }
  };

  const carregarClientes = () => {
    try {
      const clientesSalvos = localStorage.getItem('clientes');
      if (clientesSalvos) {
        const clientesData = JSON.parse(clientesSalvos);
        setClientes(clientesData);
        
        const hoje = new Date();
        
        // Filtrar aniversariantes de hoje
        const aniversariantesDeHoje = clientesData.filter((cliente: Cliente) => {
          if (!cliente.aniversario) return false;
          
          try {
            const aniversario = parseISO(cliente.aniversario);
            if (!isValid(aniversario)) return false;
            
            return (
              aniversario.getDate() === hoje.getDate() && 
              aniversario.getMonth() === hoje.getMonth()
            );
          } catch (error) {
            console.error("Erro ao processar aniversário:", error);
            return false;
          }
        });
        
        // Filtrar aniversariantes do mês atual
        const aniversariantesDoMes = clientesData.filter((cliente: Cliente) => {
          if (!cliente.aniversario) return false;
          
          try {
            const aniversario = parseISO(cliente.aniversario);
            if (!isValid(aniversario)) return false;
            
            return aniversario.getMonth() === hoje.getMonth();
          } catch (error) {
            console.error("Erro ao processar aniversário:", error);
            return false;
          }
        });
        
        setAniversariantesHoje(aniversariantesDeHoje);
        setAniversariantesMes(aniversariantesDoMes);
      }
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    }
  };

  const enviarMensagemWhatsApp = (cliente: Cliente) => {
    if (!cliente.telefone) {
      toast({
        title: "Erro",
        description: "Este cliente não possui um número de telefone cadastrado.",
        variant: "destructive",
      });
      return;
    }

    // Formatar o número de telefone (remover caracteres não numéricos)
    const telefone = cliente.telefone.replace(/\D/g, '');
    
    // Mensagem padrão de feliz aniversário
    const mensagem = `Feliz aniversário, ${cliente.nome}!`;
    
    // Criar URL do WhatsApp
    const whatsappUrl = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
    
    // Abrir em uma nova aba
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "WhatsApp aberto",
      description: `Mensagem para ${cliente.nome} preparada.`,
    });
  };

  const getAniversarioFormatado = (dataAniversario: string) => {
    try {
      const data = parseISO(dataAniversario);
      if (!isValid(data)) return "Data inválida";
      
      return format(data, "dd 'de' MMMM", { locale: ptBR });
    } catch (error) {
      return "Data inválida";
    }
  };

  const renderAniversariantes = (listaAniversariantes: Cliente[]) => {
    if (listaAniversariantes.length === 0) {
      return (
        <div className="p-8 text-center">
          <Cake className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Nenhum aniversariante encontrado
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Não há clientes fazendo aniversário neste período.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listaAniversariantes.map((cliente) => (
          <Card key={cliente.id} className="overflow-hidden">
            <CardHeader className="bg-blue-50 dark:bg-blue-900">
              <div className="flex items-center gap-2">
                <Cake className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-lg">{cliente.nome}</CardTitle>
              </div>
              <CardDescription>
                Aniversário: {getAniversarioFormatado(cliente.aniversario)}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                {cliente.email && (
                  <p className="text-sm flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    {cliente.email}
                  </p>
                )}
                {cliente.telefone && (
                  <p className="text-sm flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    {cliente.telefone}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 bg-gray-50 dark:bg-gray-800">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/clientes?id=${cliente.id}`)}
              >
                Ver perfil
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => enviarMensagemWhatsApp(cliente)}
                className="gap-1"
              >
                <MessageSquare className="h-4 w-4" />
                Enviar Parabéns
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto">
      <div className="flex items-center mb-6">
        <Gift className="mr-2 h-6 w-6 text-blue-500" />
        <h1 className="text-2xl font-bold">Aniversários dos Clientes</h1>
      </div>

      <Tabs 
        defaultValue="hoje" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="hoje" className="flex items-center gap-1">
            <Cake className="h-4 w-4" />
            Hoje
            {aniversariantesHoje.length > 0 && (
              <span className="ml-1 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                {aniversariantesHoje.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="mes" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Mês Atual
            {aniversariantesMes.length > 0 && (
              <span className="ml-1 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                {aniversariantesMes.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="hoje" className="mt-4">
          {renderAniversariantes(aniversariantesHoje)}
        </TabsContent>
        <TabsContent value="mes" className="mt-4">
          {renderAniversariantes(aniversariantesMes)}
        </TabsContent>
      </Tabs>
    </div>
  );
}

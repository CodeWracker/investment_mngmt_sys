import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { 
  Client, 
  Investment,
  PerformanceHistory,
  insertInvestmentSchema,
  insertPerformanceHistorySchema
} from "@shared/schema";
import { 
  User, 
  Building2, 
  Printer, 
  FileDown, 
  Plus, 
  AlertCircle,
  Calendar,
  SaveIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClientStats from "@/components/client/client-stats";
import InvestmentTable from "@/components/investment/investment-table";
import InvestmentForm from "@/components/investment/investment-form";
import PortfolioCharts from "@/components/charts/portfolio-charts";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ClientDashboard() {
  const { id } = useParams();
  const clientId = parseInt(id);
  const { toast } = useToast();
  const [showInvestmentForm, setShowInvestmentForm] = useState(false);
  const [editInvestment, setEditInvestment] = useState<Investment | null>(null);

  // Fetch client data
  const { 
    data: client, 
    isLoading: clientLoading, 
    error: clientError 
  } = useQuery<Client>({
    queryKey: [`/api/clients/${clientId}`],
    enabled: !isNaN(clientId),
  });

  // Fetch investments data
  const { 
    data: investments, 
    isLoading: investmentsLoading, 
    error: investmentsError 
  } = useQuery<Investment[]>({
    queryKey: [`/api/clients/${clientId}/investments`],
    enabled: !isNaN(clientId),
  });

  // Fetch performance history
  const { 
    data: performanceHistory, 
    isLoading: performanceLoading 
  } = useQuery<PerformanceHistory[]>({
    queryKey: [`/api/clients/${clientId}/performance`],
    enabled: !isNaN(clientId),
  });

  // Create investment mutation
  const createInvestmentMutation = useMutation({
    mutationFn: async (investment: any) => {
      const res = await apiRequest("POST", "/api/investments", {
        ...investment,
        clientId,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/clients/${clientId}/investments`] });
      setShowInvestmentForm(false);
      toast({
        title: "Investimento adicionado",
        description: "Investimento adicionado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao adicionar investimento: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Update investment mutation
  const updateInvestmentMutation = useMutation({
    mutationFn: async ({ id, investment }: { id: number; investment: any }) => {
      const res = await apiRequest("PUT", `/api/investments/${id}`, investment);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/clients/${clientId}/investments`] });
      setEditInvestment(null);
      setShowInvestmentForm(false);
      toast({
        title: "Investimento atualizado",
        description: "Investimento atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao atualizar investimento: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Delete investment mutation
  const deleteInvestmentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/investments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/clients/${clientId}/investments`] });
      toast({
        title: "Investimento excluído",
        description: "Investimento excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao excluir investimento: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Create portfolio snapshot mutation
  const createSnapshotMutation = useMutation({
    mutationFn: async () => {
      if (!investments || investments.length === 0) {
        throw new Error("Não há investimentos para criar um snapshot");
      }
      
      // Calculate total value and breakdown by class
      const totalValue = calculateTotalValue();
      const breakdown = calculateTotalsByClass();
      
      // Create performance history record
      const snapshotData = {
        clientId,
        date: new Date(),
        totalValue,
        breakdown
      };
      
      const res = await apiRequest("POST", "/api/performance-history", snapshotData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/clients/${clientId}/performance`] });
      toast({
        title: "Checkpoint criado",
        description: "Checkpoint do portfólio criado com sucesso. Estes dados serão usados para monitorar a evolução do patrimônio.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao criar checkpoint: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleCreateInvestment = (data: any) => {
    createInvestmentMutation.mutate(data);
  };

  const handleUpdateInvestment = (data: any) => {
    if (editInvestment) {
      updateInvestmentMutation.mutate({ id: editInvestment.id, investment: data });
    }
  };

  const handleDeleteInvestment = (id: number) => {
    deleteInvestmentMutation.mutate(id);
  };

  const handleEditInvestment = (investment: Investment) => {
    setEditInvestment(investment);
    setShowInvestmentForm(true);
  };

  // Calculate investment totals per class
  const calculateTotalsByClass = () => {
    if (!investments) return {};
    
    return investments.reduce((acc: Record<string, number>, investment) => {
      const total = investment.quantity * investment.unitPrice;
      acc[investment.class] = (acc[investment.class] || 0) + total;
      return acc;
    }, {});
  };

  // Calculate total portfolio value
  const calculateTotalValue = () => {
    if (!investments) return 0;
    
    return investments.reduce((total, investment) => {
      return total + (investment.quantity * investment.unitPrice);
    }, 0);
  };

  if (clientError || investmentsError) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>
          Ocorreu um erro ao carregar os dados. Por favor, tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

  const isLoading = clientLoading || investmentsLoading;

  return (
    <div className="space-y-6">
      {/* Client Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
        <div className="flex items-center">
          {isLoading ? (
            <>
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="ml-3">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32 mt-1" />
              </div>
            </>
          ) : client ? (
            <>
              <div className="h-12 w-12 rounded-full bg-blue-100 text-primary flex items-center justify-center mr-3">
                {client.documentType === "CPF" ? (
                  <User className="h-6 w-6" />
                ) : (
                  <Building2 className="h-6 w-6" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{client.name}</h2>
                <p className="text-sm text-gray-500">
                  {client.documentType}: {client.documentId}
                </p>
              </div>
            </>
          ) : null}
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <Button variant="outline" className="flex items-center">
            <Printer className="h-4 w-4 mr-1" />
            Imprimir
          </Button>
          <Button variant="outline" className="flex items-center">
            <FileDown className="h-4 w-4 mr-1" />
            Exportar
          </Button>
          <Button 
            onClick={() => createSnapshotMutation.mutate()}
            variant="secondary"
            className="flex items-center"
            disabled={createSnapshotMutation.isPending || !investments || investments.length === 0}
          >
            <SaveIcon className="h-4 w-4 mr-1" />
            {createSnapshotMutation.isPending ? "Criando..." : "Criar Checkpoint"}
          </Button>
          <Button 
            onClick={() => {
              setEditInvestment(null);
              setShowInvestmentForm(true);
            }}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Investimento
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <ClientStats 
        isLoading={isLoading} 
        investments={investments || []} 
        totals={calculateTotalsByClass()}
        totalValue={calculateTotalValue()}
      />

      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="investments">Investimentos</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="space-y-6">
          {/* Charts */}
          <PortfolioCharts 
            isLoading={isLoading || performanceLoading}
            investments={investments || []}
            performanceHistory={performanceHistory || []}
            totals={calculateTotalsByClass()}
          />
          
          {/* Investment Table (Summary) */}
          <Card>
            <InvestmentTable 
              investments={investments?.slice(0, 5) || []}
              isLoading={isLoading}
              onEdit={handleEditInvestment}
              onDelete={handleDeleteInvestment}
              showViewAll={investments && investments.length > 5}
              totalValue={calculateTotalValue()}
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="investments">
          {/* Full Investment Table */}
          <Card>
            <InvestmentTable 
              investments={investments || []}
              isLoading={isLoading}
              onEdit={handleEditInvestment}
              onDelete={handleDeleteInvestment}
              totalValue={calculateTotalValue()}
            />
          </Card>
        </TabsContent>
      </Tabs>

      {/* Investment Form Dialog */}
      {showInvestmentForm && (
        <InvestmentForm
          onSubmit={editInvestment ? handleUpdateInvestment : handleCreateInvestment}
          onCancel={() => {
            setShowInvestmentForm(false);
            setEditInvestment(null);
          }}
          investment={editInvestment}
          isLoading={createInvestmentMutation.isPending || updateInvestmentMutation.isPending}
        />
      )}
    </div>
  );
}

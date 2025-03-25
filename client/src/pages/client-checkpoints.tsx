import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/format";
import { ArrowLeft, Edit, Trash2, BarChart } from "lucide-react";
import { PerformanceHistory, Client } from "@shared/schema";

export default function ClientCheckpoints() {
  const { clientId } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingCheckpoint, setEditingCheckpoint] = useState<PerformanceHistory | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [checkpointToDelete, setCheckpointToDelete] = useState<number | null>(null);

  const { data: client, isLoading: isLoadingClient } = useQuery<Client>({
    queryKey: [`/api/clients/${clientId}`],
    enabled: !!clientId,
  });

  const { data: checkpoints, isLoading: isLoadingCheckpoints } = useQuery<PerformanceHistory[]>({
    queryKey: [`/api/clients/${clientId}/performance`],
    enabled: !!clientId,
  });

  const editCheckpointMutation = useMutation({
    mutationFn: async (data: Partial<PerformanceHistory>) => {
      if (!editingCheckpoint) return null;
      return apiRequest("PUT", `/api/performance-history/${editingCheckpoint.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/clients/${clientId}/performance`] });
      toast({
        title: "Checkpoint atualizado",
        description: "As informações do checkpoint foram atualizadas com sucesso.",
      });
      setShowEditDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao atualizar checkpoint: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteCheckpointMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/performance-history/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/clients/${clientId}/performance`] });
      toast({
        title: "Checkpoint excluído",
        description: "O checkpoint foi excluído com sucesso.",
      });
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao excluir checkpoint: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCheckpoint) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const data: Partial<PerformanceHistory> = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
    };

    editCheckpointMutation.mutate(data);
  };

  const handleDeleteConfirm = () => {
    if (checkpointToDelete !== null) {
      deleteCheckpointMutation.mutate(checkpointToDelete);
    }
  };

  const renderBreakdown = (checkpoint: PerformanceHistory) => {
    const breakdown = checkpoint.breakdown as Record<string, number>;
    return (
      <div className="grid grid-cols-2 gap-2 mt-2">
        {Object.entries(breakdown).map(([category, value]) => (
          <div key={category} className="flex justify-between">
            <span className="text-sm text-muted-foreground">{category}:</span>
            <span className="text-sm font-medium">{formatCurrency(value)}</span>
          </div>
        ))}
      </div>
    );
  };

  if (isLoadingClient) {
    return (
      <Layout>
        <div className="container mx-auto p-4">
          <Skeleton className="h-8 w-1/3 mb-4" />
          <Skeleton className="h-32 w-full mb-4" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/client/${clientId}`)}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">
            Histórico de Checkpoints - {client?.name}
          </h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="h-5 w-5 mr-2" />
              Checkpoints Históricos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingCheckpoints ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : checkpoints && checkpoints.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Patrimônio Total</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checkpoints.map((checkpoint) => (
                    <TableRow key={checkpoint.id}>
                      <TableCell>{formatDate(checkpoint.date)}</TableCell>
                      <TableCell className="font-medium">{checkpoint.name}</TableCell>
                      <TableCell>{formatCurrency(checkpoint.totalValue)}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {checkpoint.description || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingCheckpoint(checkpoint);
                            setShowEditDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCheckpointToDelete(checkpoint.id);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                Nenhum checkpoint encontrado para este cliente.
              </div>
            )}
          </CardContent>
        </Card>

        {checkpoints && checkpoints.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Último Checkpoint</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="summary">
                <TabsList className="mb-4">
                  <TabsTrigger value="summary">Resumo</TabsTrigger>
                  <TabsTrigger value="investments">Investimentos</TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary">
                  {checkpoints[0] && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Informações Gerais</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Data:</span>
                            <span className="font-medium">{formatDate(checkpoints[0].date)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Nome:</span>
                            <span className="font-medium">{checkpoints[0].name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Patrimônio Total:</span>
                            <span className="font-medium">{formatCurrency(checkpoints[0].totalValue)}</span>
                          </div>
                          <div className="mt-2">
                            <span className="text-muted-foreground">Descrição:</span>
                            <p className="mt-1">{checkpoints[0].description || "Sem descrição"}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Distribuição</h3>
                        {renderBreakdown(checkpoints[0])}
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="investments">
                  {checkpoints[0] && checkpoints[0].investmentsSnapshot && (
                    <div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Classe</TableHead>
                            <TableHead>Quantidade</TableHead>
                            <TableHead>Valor Unitário</TableHead>
                            <TableHead className="text-right">Valor Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(checkpoints[0].investmentsSnapshot as any[]).map((investment, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{investment.name}</TableCell>
                              <TableCell>
                                {investment.type === "emergency" ? "Emergência" : "Investimento"}
                              </TableCell>
                              <TableCell>{`${investment.class} - ${investment.subclass}`}</TableCell>
                              <TableCell>{investment.quantity}</TableCell>
                              <TableCell>{formatCurrency(investment.unitPrice)}</TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(investment.quantity * investment.unitPrice)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Edit Checkpoint Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Checkpoint</DialogTitle>
              <DialogDescription>
                Atualize as informações deste checkpoint
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Nome
                  </label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingCheckpoint?.name || ""}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Descrição
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    rows={3}
                    defaultValue={editingCheckpoint?.description || ""}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowEditDialog(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={editCheckpointMutation.isPending}
                >
                  {editCheckpointMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Checkpoint</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este checkpoint? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive hover:bg-destructive/90"
                disabled={deleteCheckpointMutation.isPending}
              >
                {deleteCheckpointMutation.isPending ? "Excluindo..." : "Excluir"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
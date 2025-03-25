import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { Search, UserPlus, User, Building2, Trash2, Edit, X } from "lucide-react";
import { Client, insertClientSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import ClientForm from "@/components/client/client-form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/format";
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
import { useToast } from "@/hooks/use-toast";

export default function ClientList() {
  const [location, navigate] = useLocation();
  const search = useSearch();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const { data: clients, isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const createClientMutation = useMutation({
    mutationFn: async (client: any) => {
      const res = await apiRequest("POST", "/api/clients", client);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setShowForm(false);
      toast({
        title: "Cliente criado",
        description: "Cliente criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao criar cliente: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, client }: { id: number; client: any }) => {
      const res = await apiRequest("PUT", `/api/clients/${id}`, client);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setEditClient(null);
      setShowForm(false);
      toast({
        title: "Cliente atualizado",
        description: "Cliente atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao atualizar cliente: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setClientToDelete(null);
      toast({
        title: "Cliente excluído",
        description: "Cliente excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao excluir cliente: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Filter clients based on search query
  const filteredClients = clients?.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.documentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check URL params to see if we should show the form
  useEffect(() => {
    const params = new URLSearchParams(search);
    if (params.get("new") === "true") {
      setShowForm(true);
      // Clear the URL parameter
      navigate("/client", { replace: true });
    }
  }, [search, navigate]);

  const handleSubmit = (data: any) => {
    if (editClient) {
      updateClientMutation.mutate({ id: editClient.id, client: data });
    } else {
      createClientMutation.mutate(data);
    }
  };

  const handleEdit = (client: Client) => {
    setEditClient(client);
    setShowForm(true);
  };

  const handleDelete = (client: Client) => {
    setClientToDelete(client);
  };

  const confirmDelete = () => {
    if (clientToDelete) {
      deleteClientMutation.mutate(clientToDelete.id);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditClient(null);
  };

  return (
    <div className="space-y-6">
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Gerenciar Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar cliente..."
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Button
                onClick={() => {
                  setEditClient(null);
                  setShowForm(true);
                }}
                className="w-full"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Cliente
              </Button>
            </div>
          </div>

          <div className="mt-6 overflow-hidden border rounded-lg">
            {isLoading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : filteredClients && filteredClients.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF/CNPJ</TableHead>
                    <TableHead className="text-right">Total Investido</TableHead>
                    <TableHead className="text-right">Última Atualização</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id} className="cursor-pointer hover:bg-gray-50">
                      <TableCell 
                        className="font-medium" 
                        onClick={() => navigate(`/client/${client.id}`)}
                      >
                        <div className="flex items-center">
                          <div className="mr-2 bg-blue-100 text-blue-800 p-1 rounded-full">
                            {client.documentType === "CPF" ? (
                              <User className="h-4 w-4" />
                            ) : (
                              <Building2 className="h-4 w-4" />
                            )}
                          </div>
                          {client.name}
                        </div>
                      </TableCell>
                      <TableCell onClick={() => navigate(`/client/${client.id}`)}>
                        {client.documentId}
                      </TableCell>
                      <TableCell 
                        className="text-right font-mono"
                        onClick={() => navigate(`/client/${client.id}`)}
                      >
                        {/* In a real app, we would calculate this from investments */}
                        {client.name === "Pedro Sousa" 
                          ? formatCurrency(562750)
                          : client.name === "Empresa ABC Ltda"
                          ? formatCurrency(1250000)
                          : formatCurrency(347800)}
                      </TableCell>
                      <TableCell 
                        className="text-right"
                        onClick={() => navigate(`/client/${client.id}`)}
                      >
                        {new Date(client.updatedAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(client);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(client);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="text-gray-500 mb-2">
                  {searchQuery
                    ? "Nenhum cliente encontrado com esses termos de busca."
                    : "Nenhum cliente cadastrado ainda."}
                </p>
                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery("")}
                    className="mb-2"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpar busca
                  </Button>
                )}
                <Button
                  onClick={() => {
                    setEditClient(null);
                    setShowForm(true);
                  }}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar cliente
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Client Form Dialog */}
      {showForm && (
        <ClientForm
          onSubmit={handleSubmit}
          onCancel={closeForm}
          client={editClient}
          isLoading={createClientMutation.isPending || updateClientMutation.isPending}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!clientToDelete} onOpenChange={() => setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cliente "{clientToDelete?.name}"? Esta ação 
              não pode ser desfeita e todos os investimentos associados serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { useState } from "react";
import { Investment } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Trash2, ChevronRight, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { Link } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface InvestmentTableProps {
  investments: Investment[];
  isLoading: boolean;
  onEdit: (investment: Investment) => void;
  onDelete: (id: number) => void;
  showViewAll?: boolean;
  totalValue: number;
}

export default function InvestmentTable({
  investments,
  isLoading,
  onEdit,
  onDelete,
  showViewAll = false,
  totalValue,
}: InvestmentTableProps) {
  const [investmentToDelete, setInvestmentToDelete] = useState<Investment | null>(null);

  const handleDeleteClick = (investment: Investment) => {
    setInvestmentToDelete(investment);
  };

  const confirmDelete = () => {
    if (investmentToDelete) {
      onDelete(investmentToDelete.id);
      setInvestmentToDelete(null);
    }
  };

  const getPerformanceDisplay = (performance: number) => {
    if (performance === 0) {
      return (
        <span className="bg-gray-100 text-gray-800 py-1 px-2 rounded-full text-xs inline-flex items-center">
          0.0%
        </span>
      );
    } else if (performance > 0) {
      return (
        <span className="bg-green-100 text-green-800 py-1 px-2 rounded-full text-xs inline-flex items-center">
          +{performance.toFixed(1)}%
        </span>
      );
    } else {
      return (
        <span className="bg-red-100 text-red-800 py-1 px-2 rounded-full text-xs inline-flex items-center">
          {performance.toFixed(1)}%
        </span>
      );
    }
  };

  return (
    <>
      <CardHeader>
        <CardTitle>Detalhes dos Investimentos</CardTitle>
        <CardDescription>
          Lista de todos os investimentos do cliente
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ativo</TableHead>
                <TableHead>Classe</TableHead>
                <TableHead>Subclasse</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Preço Unitário</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Rentabilidade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={8}>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : investments.length > 0 ? (
                investments.map((investment) => (
                  <TableRow key={investment.id}>
                    <TableCell className="font-medium">
                      {investment.name}
                    </TableCell>
                    <TableCell>{investment.class}</TableCell>
                    <TableCell>{investment.subclass}</TableCell>
                    <TableCell className="text-right font-mono">
                      {investment.quantity.toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(investment.unitPrice)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(investment.quantity * investment.unitPrice)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getPerformanceDisplay(investment.performance)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(investment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(investment)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6">
                    <div className="flex flex-col items-center justify-center">
                      <AlertTriangle className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-gray-500 mb-2">
                        Nenhum investimento encontrado
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={5} className="font-semibold">
                  Total
                </TableCell>
                <TableCell className="text-right font-semibold font-mono">
                  {formatCurrency(totalValue)}
                </TableCell>
                <TableCell colSpan={2}></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </CardContent>

      {showViewAll && (
        <CardFooter className="py-4 border-t">
          <Link href={`/clients/${investments[0]?.clientId}?tab=investments`} className="w-full">
            <Button variant="ghost" className="w-full flex justify-center gap-1">
              <span>Ver todos os investimentos</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!investmentToDelete}
        onOpenChange={() => setInvestmentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o investimento "
              {investmentToDelete?.name}"? Esta ação não pode ser desfeita.
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
    </>
  );
}

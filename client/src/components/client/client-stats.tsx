import { Investment } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import { TrendingUp, TrendingDown, Minus, Wallet, BarChart2, LineChart, Home } from "lucide-react";

interface ClientStatsProps {
  isLoading: boolean;
  investments: Investment[];
  totals: Record<string, number>;
  totalValue: number;
}

export default function ClientStats({ isLoading, investments, totals, totalValue }: ClientStatsProps) {
  // Calculate class totals
  const variableIncomeTotal = totals["Renda Variável"] || 0;
  const fixedIncomeTotal = totals["Renda Fixa"] || 0;
  const realEstateTotal = totals["Imóveis"] || 0;
  const fundsTotal = totals["Fundos"] || 0;

  // Calculate performance indicators
  const getPerformance = (value: number) => {
    // This would normally be calculated based on historical data
    // For demo purposes, we'll use random values
    if (value === variableIncomeTotal) return 12.5;
    if (value === fixedIncomeTotal) return 0.8;
    if (value === realEstateTotal) return 0;
    if (value === fundsTotal) return 5.2;
    return 7.2; // Default for total performance
  };

  const getPerformanceIcon = (performance: number) => {
    if (performance > 0) return <TrendingUp className="text-xs mr-1" />;
    if (performance < 0) return <TrendingDown className="text-xs mr-1" />;
    return <Minus className="text-xs mr-1" />;
  };

  const getPerformanceClass = (performance: number) => {
    if (performance > 0) return "text-success";
    if (performance < 0) return "text-red-500";
    return "text-gray-500";
  };

  const getAssetIcon = (assetType: string) => {
    switch (assetType) {
      case "total":
        return (
          <div className="rounded-full bg-blue-100 p-2 text-primary">
            <Wallet className="h-5 w-5" />
          </div>
        );
      case "variable":
        return (
          <div className="rounded-full bg-purple-100 p-2 text-secondary">
            <BarChart2 className="h-5 w-5" />
          </div>
        );
      case "fixed":
        return (
          <div className="rounded-full bg-green-100 p-2 text-green-600">
            <LineChart className="h-5 w-5" />
          </div>
        );
      case "realestate":
        return (
          <div className="rounded-full bg-yellow-100 p-2 text-yellow-600">
            <Home className="h-5 w-5" />
          </div>
        );
      default:
        return (
          <div className="rounded-full bg-blue-100 p-2 text-blue-600">
            <Wallet className="h-5 w-5" />
          </div>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Total Assets Card */}
      <StatCard
        title="Patrimônio Total"
        value={totalValue}
        performance={getPerformance(totalValue)}
        icon={getAssetIcon("total")}
        isLoading={isLoading}
      />
      
      {/* Variable Income Card */}
      <StatCard
        title="Renda Variável"
        value={variableIncomeTotal}
        performance={getPerformance(variableIncomeTotal)}
        icon={getAssetIcon("variable")}
        isLoading={isLoading}
      />
      
      {/* Fixed Income Card */}
      <StatCard
        title="Renda Fixa"
        value={fixedIncomeTotal}
        performance={getPerformance(fixedIncomeTotal)}
        icon={getAssetIcon("fixed")}
        isLoading={isLoading}
      />
      
      {/* Real Estate Card */}
      <StatCard
        title="Imóveis"
        value={realEstateTotal}
        performance={getPerformance(realEstateTotal)}
        icon={getAssetIcon("realestate")}
        isLoading={isLoading}
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  performance: number;
  icon: React.ReactNode;
  isLoading: boolean;
}

function StatCard({ title, value, performance, icon, isLoading }: StatCardProps) {
  const performanceIcon = performance > 0 
    ? <TrendingUp className="text-xs mr-1" /> 
    : performance < 0 
      ? <TrendingDown className="text-xs mr-1" /> 
      : <Minus className="text-xs mr-1" />;

  const performanceClass = performance > 0 
    ? "text-success" 
    : performance < 0 
      ? "text-red-500" 
      : "text-gray-500";

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-28 mt-1" />
            ) : (
              <p className="text-2xl font-semibold font-mono text-gray-800">
                {formatCurrency(value)}
              </p>
            )}
          </div>
          {icon}
        </div>
        <div className="mt-1 text-sm">
          {isLoading ? (
            <Skeleton className="h-4 w-24" />
          ) : (
            <>
              <span className={`${performanceClass} font-semibold flex items-center`}>
                {performanceIcon} {performance > 0 ? '+' : ''}{performance.toFixed(1)}%
              </span>
              <span className="text-gray-500">vs. mês anterior</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

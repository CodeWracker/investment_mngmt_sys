import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Investment, PerformanceHistory } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import Chart from "chart.js/auto";

interface PortfolioChartsProps {
  isLoading: boolean;
  investments: Investment[];
  performanceHistory: PerformanceHistory[];
  totals: Record<string, number>;
}

export default function PortfolioCharts({
  isLoading,
  investments,
  performanceHistory,
  totals,
}: PortfolioChartsProps) {
  const allocationChartRef = useRef<HTMLCanvasElement>(null);
  const allocationChartInstance = useRef<Chart | null>(null);
  
  const evolutionChartRef = useRef<HTMLCanvasElement>(null);
  const evolutionChartInstance = useRef<Chart | null>(null);

  // Colors for the charts
  const chartColors = {
    "Renda Variável": "#805ad5", // purple
    "Renda Fixa": "#48bb78",     // green
    "Imóveis": "#ecc94b",        // yellow
    "Fundos": "#3182ce",         // blue
    "Outros": "#a0aec0",         // gray
  };

  // Initialize the allocation chart
  useEffect(() => {
    if (isLoading || !allocationChartRef.current || Object.keys(totals).length === 0) return;

    // Calculate percentages
    const totalValue = Object.values(totals).reduce((sum, val) => sum + val, 0);
    const classes = Object.keys(totals);
    const percentages = classes.map(cls => ((totals[cls] / totalValue) * 100).toFixed(1));
    const values = classes.map(cls => totals[cls]);
    const colors = classes.map(cls => chartColors[cls as keyof typeof chartColors] || "#a0aec0");

    // Destroy previous chart if it exists
    if (allocationChartInstance.current) {
      allocationChartInstance.current.destroy();
    }

    // Create the chart
    const ctx = allocationChartRef.current.getContext("2d");
    if (ctx) {
      allocationChartInstance.current = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: classes,
          datasets: [
            {
              data: percentages,
              backgroundColor: colors,
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "70%",
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                font: {
                  family: "'Inter', sans-serif",
                  size: 12,
                },
                padding: 20,
              },
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || "";
                  const value = values[context.dataIndex];
                  return `${label}: ${context.parsed}% (${formatCurrency(value)})`;
                },
              },
            },
          },
        },
      });
    }

    return () => {
      if (allocationChartInstance.current) {
        allocationChartInstance.current.destroy();
      }
    };
  }, [isLoading, totals]);

  // Initialize the evolution chart
  useEffect(() => {
    if (isLoading || !evolutionChartRef.current || performanceHistory.length === 0) return;

    // Sort performance history by date
    const sortedHistory = [...performanceHistory].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Prepare the data
    const labels = sortedHistory.map((record) => {
      const date = new Date(record.date);
      return date.toLocaleDateString("pt-BR", { month: "short" });
    });

    const data = sortedHistory.map((record) => record.totalValue);

    // Destroy previous chart if it exists
    if (evolutionChartInstance.current) {
      evolutionChartInstance.current.destroy();
    }

    // Create the chart
    const ctx = evolutionChartRef.current.getContext("2d");
    if (ctx) {
      evolutionChartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Patrimônio Total",
              data,
              backgroundColor: "rgba(49, 130, 206, 0.1)",
              borderColor: "#3182ce",
              borderWidth: 2,
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: false,
              ticks: {
                callback: (value) => {
                  return "R$ " + (Number(value) / 1000).toFixed(0) + "k";
                },
                font: {
                  family: "'Inter', sans-serif",
                },
              },
            },
            x: {
              ticks: {
                font: {
                  family: "'Inter', sans-serif",
                },
              },
            },
          },
          plugins: {
            legend: {
              labels: {
                font: {
                  family: "'Inter', sans-serif",
                },
              },
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.dataset.label || "";
                  const value = context.parsed.y;
                  return `${label}: ${formatCurrency(value)}`;
                },
              },
            },
          },
        },
      });
    }

    return () => {
      if (evolutionChartInstance.current) {
        evolutionChartInstance.current.destroy();
      }
    };
  }, [isLoading, performanceHistory]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Alocação por Classe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-square md:aspect-[4/3] relative">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Skeleton className="h-[300px] w-[300px] rounded-full" />
              </div>
            ) : (
              <canvas ref={allocationChartRef} />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Evolução do Patrimônio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-square md:aspect-[4/3] relative">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-[300px] w-full" />
              </div>
            ) : (
              <canvas ref={evolutionChartRef} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

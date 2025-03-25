import { 
  investmentClasses, 
  investmentSubclasses 
} from "@shared/schema";

export const INVESTMENT_CLASSES = investmentClasses;
export const INVESTMENT_SUBCLASSES = investmentSubclasses;

export const CHART_COLORS = {
  "Renda Variável": "hsl(270, 70%, 60%)", // Purple
  "Renda Fixa": "hsl(145, 63%, 42%)",     // Green
  "Imóveis": "hsl(45, 93%, 47%)",         // Yellow
  "Fundos": "hsl(210, 79%, 46%)",         // Blue
  "Outros": "hsl(215, 16%, 47%)",         // Gray
};

export const PERFORMANCE_PERIODS = [
  { label: "1 mês", value: "1m" },
  { label: "3 meses", value: "3m" },
  { label: "6 meses", value: "6m" },
  { label: "1 ano", value: "1y" },
  { label: "Desde o início", value: "all" },
];

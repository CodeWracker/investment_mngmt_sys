import { pgTable, text, serial, integer, boolean, doublePrecision, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Client model
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  documentId: text("document_id").notNull().unique(), // CPF or CNPJ
  documentType: text("document_type").notNull().default("CPF"), // CPF or CNPJ
  notes: text("notes"),
  // Novos campos para plano de investimentos
  emergencyReserveTarget: doublePrecision("emergency_reserve_target").notNull().default(0),
  investmentPlan: json("investment_plan").notNull().default({}), // Distribuição percentual por categoria
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Investment classes and subclasses
export const investmentClasses = [
  "Renda Variável",
  "Renda Fixa",
  "Imóveis",
  "Fundos",
  "Outros"
] as const;

export const investmentSubclasses = {
  "Renda Variável": ["Ações", "BDRs", "ETFs", "Derivativos"],
  "Renda Fixa": ["Títulos Públicos", "CDBs", "LCIs/LCAs", "Debêntures", "Poupança"],
  "Imóveis": ["Residencial", "Comercial", "Terreno", "Rural"],
  "Fundos": ["FIIs", "Fundos de Investimento", "Previdência Privada"],
  "Outros": ["Criptomoedas", "Commodities", "Outros"],
} as const;

// Investment types
export const investmentTypes = ["emergency", "investment"] as const;
export type InvestmentType = typeof investmentTypes[number];

// Investment model
export const investments = pgTable("investments", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull().default("investment"), // emergency or investment
  class: text("class").notNull(), // From investmentClasses
  subclass: text("subclass").notNull(), // From investmentSubclasses
  quantity: doublePrecision("quantity").notNull(),
  unitPrice: doublePrecision("unit_price").notNull(),
  autoUpdatePrice: boolean("auto_update_price").notNull().default(false),
  ticker: text("ticker"), // For auto-updating investments like stocks
  notes: text("notes"),
  performance: doublePrecision("performance").default(0), // % performance
  previousValue: doublePrecision("previous_value").default(0), // To track change
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Performance tracking model (for historical performance)
export const performanceHistory = pgTable("performance_history", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  totalValue: doublePrecision("total_value").notNull(),
  name: text("name"), // Opcional - Nome para o checkpoint
  description: text("description"), // Opcional - Descrição para o checkpoint
  // JSON object with investment class totals
  breakdown: json("breakdown").notNull(),
  investmentsSnapshot: json("investments_snapshot").notNull(), // Snapshot completo dos investimentos
});

// Validation schemas
export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvestmentSchema = createInsertSchema(investments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  performance: true,
  previousValue: true,
}).refine(
  data => {
    // Validate class and subclass combination
    const validSubclasses = investmentSubclasses[data.class as keyof typeof investmentSubclasses];
    return validSubclasses?.includes(data.subclass as any);
  },
  {
    message: "Invalid subclass for the selected investment class",
    path: ["subclass"],
  }
);

export const insertPerformanceHistorySchema = createInsertSchema(performanceHistory).omit({
  id: true,
});

// Types
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Investment = typeof investments.$inferSelect;
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;

export type PerformanceHistory = typeof performanceHistory.$inferSelect;
export type InsertPerformanceHistory = z.infer<typeof insertPerformanceHistorySchema>;

export type InvestmentClass = typeof investmentClasses[number];
export type InvestmentSubclass<T extends InvestmentClass = InvestmentClass> = 
  typeof investmentSubclasses[T][number];

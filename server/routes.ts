import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClientSchema, insertInvestmentSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Client routes
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }

      const client = await storage.getClient(id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(clientData);
      res.status(201).json(client);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Failed to create client" });
      }
    }
  });

  app.put("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }

      const clientData = insertClientSchema.parse(req.body);
      const updatedClient = await storage.updateClient(id, clientData);
      
      if (!updatedClient) {
        return res.status(404).json({ message: "Client not found" });
      }

      res.json(updatedClient);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Failed to update client" });
      }
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }

      const success = await storage.deleteClient(id);
      if (!success) {
        return res.status(404).json({ message: "Client not found" });
      }

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Investment routes
  app.get("/api/clients/:clientId/investments", async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      if (isNaN(clientId)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }

      const client = await storage.getClient(clientId);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      const investments = await storage.getInvestmentsByClient(clientId);
      res.json(investments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch investments" });
    }
  });

  app.get("/api/investments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid investment ID" });
      }

      const investment = await storage.getInvestment(id);
      if (!investment) {
        return res.status(404).json({ message: "Investment not found" });
      }

      res.json(investment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch investment" });
    }
  });

  app.post("/api/investments", async (req, res) => {
    try {
      const investmentData = insertInvestmentSchema.parse(req.body);
      
      // Verify client exists
      const client = await storage.getClient(investmentData.clientId);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      const investment = await storage.createInvestment(investmentData);
      res.status(201).json(investment);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Failed to create investment" });
      }
    }
  });

  app.put("/api/investments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid investment ID" });
      }

      // Get current investment to check ownership
      const currentInvestment = await storage.getInvestment(id);
      if (!currentInvestment) {
        return res.status(404).json({ message: "Investment not found" });
      }

      // Validate only the fields we're updating
      const updates = req.body;
      
      const updatedInvestment = await storage.updateInvestment(id, updates);
      if (!updatedInvestment) {
        return res.status(404).json({ message: "Investment not found" });
      }

      res.json(updatedInvestment);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Failed to update investment" });
      }
    }
  });

  app.delete("/api/investments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid investment ID" });
      }

      const success = await storage.deleteInvestment(id);
      if (!success) {
        return res.status(404).json({ message: "Investment not found" });
      }

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete investment" });
    }
  });

  // Performance history routes
  app.get("/api/clients/:clientId/performance", async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      if (isNaN(clientId)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }

      const client = await storage.getClient(clientId);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      const performanceHistory = await storage.getPerformanceHistory(clientId);
      res.json(performanceHistory);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch performance history" });
    }
  });

  // Mock Brazilian stock price API (for demonstration purposes)
  app.get("/api/market/price/:ticker", (req, res) => {
    const { ticker } = req.params;
    
    // Mock prices for some common Brazilian stocks
    const priceMap: Record<string, number> = {
      "PETR4": 32.75,
      "VALE3": 68.42,
      "ITSA4": 10.25,
      "BBDC4": 15.87,
      "ABEV3": 14.22,
      "WEGE3": 37.51,
      "MGLU3": 4.15,
      "B3SA3": 12.82,
    };

    const price = priceMap[ticker.toUpperCase()];
    
    if (price) {
      // Add small random variation to simulate price movements
      const variation = (Math.random() * 0.1 - 0.05) * price;
      const currentPrice = parseFloat((price + variation).toFixed(2));
      res.json({ ticker, price: currentPrice });
    } else {
      res.status(404).json({ message: "Ticker not found" });
    }
  });

  // Return the server
  return httpServer;
}

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    const clientes = await prisma.cliente.findMany();
    return res.status(200).json(clientes);
  } else if (req.method === "POST") {
    const { nome, cpf, cnpj, observacoes } = req.body;
    if (!nome) {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }
    if (!cpf && !cnpj) {
      return res.status(400).json({ error: "É necessário informar pelo menos um entre CPF e CNPJ" });
    }
    const newCliente = await prisma.cliente.create({
      data: { nome, cpf, cnpj, observacoes },
    });
    return res.status(201).json(newCliente);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Método ${req.method} não permitido`);
  }
}

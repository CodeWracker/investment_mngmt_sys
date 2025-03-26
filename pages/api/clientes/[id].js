import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "GET") {
    const cliente = await prisma.cliente.findUnique({
      where: { id_cliente: Number(id) },
    });
    if (cliente) {
      return res.status(200).json(cliente);
    }
    return res.status(404).json({ error: "Cliente não encontrado" });
  } else if (req.method === "PUT") {
    const { nome, cpf, cnpj, observacoes } = req.body;
    try {
      const updatedCliente = await prisma.cliente.update({
        where: { id_cliente: Number(id) },
        data: { nome, cpf, cnpj, observacoes },
      });
      return res.status(200).json(updatedCliente);
    } catch (error) {
      return res.status(400).json({ error: "Erro ao atualizar cliente" });
    }
  } else if (req.method === "DELETE") {
    await prisma.cliente.delete({
      where: { id_cliente: Number(id) },
    });
    return res.status(204).end();
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Método ${req.method} não permitido`);
  }
}

-- CreateTable
CREATE TABLE "Cliente" (
    "id_cliente" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT,
    "cnpj" TEXT,
    "observacoes" TEXT,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id_cliente")
);

-- CreateTable
CREATE TABLE "Carteira" (
    "id_carteira" SERIAL NOT NULL,
    "nome_carteira" TEXT NOT NULL,
    "fk_id_cliente" INTEGER NOT NULL,

    CONSTRAINT "Carteira_pkey" PRIMARY KEY ("id_carteira")
);

-- CreateTable
CREATE TABLE "Item" (
    "id_item" SERIAL NOT NULL,
    "nome_item" TEXT NOT NULL,
    "codigo_item" TEXT,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id_item")
);

-- AddForeignKey
ALTER TABLE "Carteira" ADD CONSTRAINT "Carteira_fk_id_cliente_fkey" FOREIGN KEY ("fk_id_cliente") REFERENCES "Cliente"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

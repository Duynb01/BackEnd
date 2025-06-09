/*
  Warnings:

  - You are about to drop the column `manufacturerId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `Manufacturer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_manufacturerId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "manufacturerId";

-- DropTable
DROP TABLE "Manufacturer";

-- CreateTable
CREATE TABLE "Payment" (
    "id" BIGSERIAL NOT NULL,
    "orderId" BIGINT NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "transactionId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment"("orderId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

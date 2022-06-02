-- CreateEnum
CREATE TYPE "WebhookAction" AS ENUM ('BOOKUPDATE', 'NEWTRADES');

-- CreateTable
CREATE TABLE "Webhook" (
    "id" SERIAL NOT NULL,
    "fullAddress" TEXT NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "action" "WebhookAction" NOT NULL,

    CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Webhook_tenantId_action_key" ON "Webhook"("tenantId", "action");

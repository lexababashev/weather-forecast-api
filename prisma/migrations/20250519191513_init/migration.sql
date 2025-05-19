-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('HOURLY', 'DAILY');

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "frequency" "Frequency" NOT NULL,
    "token" TEXT NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_email_key" ON "Subscription"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_token_key" ON "Subscription"("token");

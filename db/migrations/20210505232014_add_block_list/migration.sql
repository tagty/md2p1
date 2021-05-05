-- AlterTable
ALTER TABLE "Block" ALTER COLUMN "slideId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Slide" ALTER COLUMN "presentationId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "BlockList" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "text" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

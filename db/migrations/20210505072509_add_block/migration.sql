-- CreateTable
CREATE TABLE "Block" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "text" TEXT NOT NULL,
    "buildableId" INTEGER NOT NULL,
    "buildableType" TEXT NOT NULL,
    "slideId" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Block" ADD FOREIGN KEY ("slideId") REFERENCES "Slide"("id") ON DELETE CASCADE ON UPDATE CASCADE;

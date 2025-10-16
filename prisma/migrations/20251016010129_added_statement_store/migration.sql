-- CreateTable
CREATE TABLE "public"."Statements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Statements_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Statements" ADD CONSTRAINT "Statements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "Job" (
    "id" SERIAL NOT NULL,
    "company" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "postedAt" TEXT NOT NULL,
    "contract" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "languages" TEXT[],
    "tools" TEXT[],

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_JobToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_JobToUser_AB_unique" ON "_JobToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_JobToUser_B_index" ON "_JobToUser"("B");

-- AddForeignKey
ALTER TABLE "_JobToUser" ADD CONSTRAINT "_JobToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobToUser" ADD CONSTRAINT "_JobToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

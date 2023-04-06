-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tutorial" BOOLEAN NOT NULL,
    "role" TEXT NOT NULL,
    "answeredGames" TEXT[],
    "deleted" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "designers" TEXT[],
    "illustrators" TEXT[],
    "imgUrl" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameQuestion" (
    "id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "videoTimestamp" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "defaultAnswers" TEXT[],
    "deleted" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "gameQuestion_id" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Answers_gameQuestion_id_user_id_key" ON "Answers"("gameQuestion_id", "user_id");

-- AddForeignKey
ALTER TABLE "GameQuestion" ADD CONSTRAINT "GameQuestion_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answers" ADD CONSTRAINT "Answers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answers" ADD CONSTRAINT "Answers_gameQuestion_id_fkey" FOREIGN KEY ("gameQuestion_id") REFERENCES "GameQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

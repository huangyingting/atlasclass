/*
  Warnings:

  - You are about to drop the column `blurb` on the `ProblemSet` table. All the data in the column will be lost.
  - You are about to drop the column `difficulty` on the `ProblemSet` table. All the data in the column will be lost.
  - You are about to drop the column `number` on the `ProblemSet` table. All the data in the column will be lost.
  - You are about to drop the column `problemIds` on the `ProblemSet` table. All the data in the column will be lost.
  - You are about to drop the column `topic` on the `ProblemSet` table. All the data in the column will be lost.
  - You are about to drop the column `translations` on the `ProblemSet` table. All the data in the column will be lost.
  - Added the required column `chapterNo` to the `ProblemSet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nProblems` to the `ProblemSet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pageFrom` to the `ProblemSet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pageTo` to the `ProblemSet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pages` to the `ProblemSet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position` to the `ProblemSet` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProblemSet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subject" TEXT NOT NULL,
    "chapter" TEXT NOT NULL,
    "chapterNo" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "pages" TEXT NOT NULL,
    "nProblems" INTEGER NOT NULL,
    "pageFrom" INTEGER NOT NULL,
    "pageTo" INTEGER NOT NULL,
    "i18nJson" TEXT NOT NULL DEFAULT '{}'
);
INSERT INTO "new_ProblemSet" ("chapter", "id", "subject", "title") SELECT "chapter", "id", "subject", "title" FROM "ProblemSet";
DROP TABLE "ProblemSet";
ALTER TABLE "new_ProblemSet" RENAME TO "ProblemSet";
CREATE INDEX "ProblemSet_chapter_position_idx" ON "ProblemSet"("chapter", "position");
CREATE INDEX "ProblemSet_chapterNo_position_idx" ON "ProblemSet"("chapterNo", "position");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

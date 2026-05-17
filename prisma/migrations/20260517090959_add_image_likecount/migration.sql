-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "image" TEXT,
ADD COLUMN     "likeCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "image" TEXT,
ADD COLUMN     "likeCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "FAQ" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "FAQ_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessSection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description_html" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "images" JSONB NOT NULL DEFAULT '[]',
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "BusinessSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FAQ_is_active_position_idx" ON "FAQ"("is_active", "position");

-- CreateIndex
CREATE INDEX "FAQ_deleted_at_idx" ON "FAQ"("deleted_at");

-- CreateIndex
CREATE INDEX "FAQ_created_at_idx" ON "FAQ"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessSection_slug_key" ON "BusinessSection"("slug");

-- CreateIndex
CREATE INDEX "BusinessSection_is_published_position_idx" ON "BusinessSection"("is_published", "position");

-- CreateIndex
CREATE INDEX "BusinessSection_deleted_at_idx" ON "BusinessSection"("deleted_at");

-- CreateIndex
CREATE INDEX "BusinessSection_created_at_idx" ON "BusinessSection"("created_at");

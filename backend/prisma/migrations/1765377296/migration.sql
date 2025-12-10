-- CreateTable
CREATE TABLE "ColorPalette" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "colors" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "use_for_admin" BOOLEAN NOT NULL DEFAULT false,
    "use_for_shop" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ColorPalette_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ColorPalette_name_key" ON "ColorPalette"("name");

-- CreateIndex
CREATE INDEX "ColorPalette_is_active_idx" ON "ColorPalette"("is_active");

-- CreateIndex
CREATE INDEX "ColorPalette_use_for_admin_idx" ON "ColorPalette"("use_for_admin");

-- CreateIndex
CREATE INDEX "ColorPalette_use_for_shop_idx" ON "ColorPalette"("use_for_shop");


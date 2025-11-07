-- CreateIndex
CREATE INDEX "Categories_status_is_active_idx" ON "Categories"("status", "is_active");

-- CreateIndex
CREATE INDEX "Categories_created_at_idx" ON "Categories"("created_at");

-- CreateIndex
CREATE INDEX "Categories_title_idx" ON "Categories"("title");

-- CreateIndex
CREATE INDEX "Products_categoryId_idx" ON "Products"("categoryId");

-- CreateIndex
CREATE INDEX "Products_categoryId_is_active_idx" ON "Products"("categoryId", "is_active");

-- CreateIndex
CREATE INDEX "Products_is_active_state_idx" ON "Products"("is_active", "state");

-- CreateIndex
CREATE INDEX "Products_created_at_idx" ON "Products"("created_at");

-- CreateIndex
CREATE INDEX "Products_price_idx" ON "Products"("price");

-- CreateIndex
CREATE INDEX "Promos_is_active_idx" ON "Promos"("is_active");

-- CreateIndex
CREATE INDEX "Promos_show_in_home_is_active_idx" ON "Promos"("show_in_home", "is_active");

-- CreateIndex
CREATE INDEX "Promos_start_date_end_date_idx" ON "Promos"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "Promos_createdById_idx" ON "Promos"("createdById");

-- CreateIndex
CREATE INDEX "Sales_source_created_at_idx" ON "Sales"("source", "created_at");

-- CreateIndex
CREATE INDEX "Sales_payment_method_created_at_idx" ON "Sales"("payment_method", "created_at");

-- CreateIndex
CREATE INDEX "User_is_active_idx" ON "User"("is_active");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_created_at_idx" ON "User"("created_at");

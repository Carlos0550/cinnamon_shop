-- Create Admin table
CREATE TABLE "Admin" (
    "id" SERIAL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "profile_image" TEXT,
    "role" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT NOW()
);

-- Unique and indexes for Admin
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");
CREATE INDEX "Admin_is_active_idx" ON "Admin"("is_active");
CREATE INDEX "Admin_created_at_idx" ON "Admin"("created_at");

-- Migrate existing admins from User.role = 1
INSERT INTO "Admin" ("email", "password", "name", "is_active", "profile_image", "role", "created_at", "updated_at")
SELECT "email", "password", "name", "is_active", "profile_image", 1 AS "role", "created_at", "updated_at"
FROM "User"
WHERE "role" = 1;

-- Remove migrated admins from User
DELETE FROM "User" WHERE "role" = 1;

-- Change User unique from (email, role) to (email)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'User_email_role_key'
    ) THEN
        DROP INDEX "public"."User_email_role_key";
    END IF;
END $$;

-- Recreate unique index on email only
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- Trigger to maintain updated_at on Admin (optional if Prisma handles @updatedAt)
-- Note: Prisma @updatedAt updates via client, but for raw SQL safety you may set a trigger.

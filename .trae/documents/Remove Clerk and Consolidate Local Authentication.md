I will completely remove Clerk authentication and implement a standalone username/password authentication system with registration capabilities.

### Backend (`/backend`)
1.  **Remove Clerk Logic:**
    *   Remove `clerkLogin` and related logic from `AuthServices`.
    *   Remove `clerk-login` routes from `User` and `AuthShop` modules.
    *   Uninstall `@clerk/backend` dependency.
2.  **Enhance Local Auth:**
    *   Add a public `registerShop` method in `AuthServices` to handle new user registration (name, email, password).
    *   Add a `/register` route in `AuthShop` module.
    *   Update `validate-token` endpoints to remove `is_clerk` field.
3.  **Database Cleanup:**
    *   Update `prisma/schema.prisma` to remove `is_clerk` and `clerk_user_id` fields from the `User` model.
    *   Generate a migration to apply these changes to the database.

### Frontend (`/shop`)
1.  **Remove Clerk:**
    *   Remove `ClerkProvider` from `layout.tsx`.
    *   Remove Clerk hooks and logic from `useAuth.tsx`.
    *   Uninstall `@clerk/nextjs` dependency.
2.  **Implement Local Auth UI:**
    *   Update `LoginForm.tsx` to remove Google/Clerk login buttons.
    *   Add a "Create Account" (Register) view within the `LoginForm`.
    *   Connect the registration form to the new backend registration endpoint.
    *   Update `useAuth` hook to support the registration flow.
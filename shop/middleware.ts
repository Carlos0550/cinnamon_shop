import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define rutas protegidas; los patrones soportan dinámicos mediante sufijo (.*)
const isProtectedRoute = createRouteMatcher([
  "/account(.*)",
  "/checkout(.*)",
  "/orders(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return;

  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();
});

// Aplica el middleware a todas las rutas excepto assets y _next
export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
  ],
};
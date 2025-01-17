import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const userRole = req.cookies.get("userRole")?.value; // Obtiene el rol del usuario
  const isAuthenticated = req.cookies.has("auth"); // Verifica si está autenticado

  if (!isAuthenticated && pathname !== "/auth/login") {
    return NextResponse.redirect(new URL("/auth/login", req.url)); // Redirige al login si no está autenticado
  }

  const protectedRoutes: { [key: string]: string } = {
    "/dashboard/admin": "admin",
    "/dashboard/client": "client",
    "/dashboard/delivery": "delivery",
  };

  for (const route in protectedRoutes) {
    if (pathname.startsWith(route) && userRole !== protectedRoutes[route]) {
      return NextResponse.redirect(new URL("/unauthorized", req.url)); // Redirige si no tiene permiso
    }
  }

  return NextResponse.next(); // Permite continuar con la solicitud
}

import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const userRole = req.cookies.get("userRole")?.value;

  const protectedRoutes: { [key: string]: string } = {
    "/dashboard/admin": "admin",
    "/dashboard/client": "client",
    "/dashboard/delivery": "delivery",
  };

  // Manejar rutas protegidas
  for (const route in protectedRoutes) {
    if (pathname.startsWith(route) && userRole !== protectedRoutes[route]) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  // Redirigir a `/not-found` si la ruta no coincide con ninguna existente
  const validRoutes = ["/", "/dashboard", "/user", "/menu", "/confirm-order", "/unauthorized"];
  const isValid = validRoutes.some((route) => pathname.startsWith(route));
  if (!isValid) {
    return NextResponse.rewrite(new URL("/not-found", req.url));
  }

  return NextResponse.next();
}

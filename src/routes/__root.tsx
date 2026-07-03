import {
  Outlet,
  Link,
  createRootRoute,
} from "@tanstack/react-router";
import { TopBar } from "@/components/site/TopBar";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Toaster } from "@/components/ui/sonner";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página no encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          La página que buscás no existe o fue movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Clik — Agencia Digital" },
      {
        name: "description",
        content:
          "Agencia digital especializada en soluciones web a medida y tarjetas digitales para eventos. Landing pages, sistemas, automatizaciones.",
      },
      { property: "og:title", content: "Clik — Agencia Digital" },
      {
        property: "og:description",
        content:
          "Agencia digital especializada en soluciones web a medida y tarjetas digitales para eventos.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://clik.com.ar" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "index, follow" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Red+Hat+Display:wght@300;400;500;600;700&display=swap",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        href: "/logo.png",
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <Outlet />
      <Footer />
      <Toaster position="bottom-right" />
    </div>
  );
}

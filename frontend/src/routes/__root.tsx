import {
  Outlet,
  Link,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";
import { TopBar } from "@/components/site/TopBar";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Toaster } from "@/components/ui/sonner";
import { whatsappLink } from "@/config/site";
import appCss from "../styles.css?url";
import logoSrc from "@/assets/logo-v2.png";

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
        href: logoSrc,
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function WhatsAppFloat() {
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-[#25D366]/30 transition-all hover:scale-110 hover:shadow-xl active:scale-95"
      aria-label="WhatsApp"
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7 fill-white" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </a>
  );
}

function RootComponent() {
  const path = useRouterState({ select: s => s.location.pathname })
  const isPanel = path === '/login' ||
    path.startsWith('/dashboard') ||
    path.startsWith('/projects') ||
    path.startsWith('/services') ||
    path.startsWith('/users') ||
    path.startsWith('/pagar')
  const hideWhatsApp = path === '/tarjetas-digitales' || path === '/soluciones-web'

  if (isPanel) {
    return (
      <div className="min-h-screen bg-white">
        <Outlet />
        <Toaster position="top-right" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <Outlet />
      <Footer />
      {!hideWhatsApp && <WhatsAppFloat />}
      <Toaster position="top-right" />
    </div>
  );
}

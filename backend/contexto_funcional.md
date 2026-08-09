# Contexto Funcional — Clik Agencia Digital

## 1. Identidad de Marca

**Clik** es una agencia digital argentina (Buenos Aires) fundada por **Nahuel Tisera** (Software Dev & Analista) y **Julieta Risso** (Diseñadora UI/UX, CM & Analista). Operan bajo el dominio `clik.com.ar` y se comunican principalmente vía WhatsApp.

### Propuesta de valor
- "Transformá tu idea en un negocio digital"
- Precios fijos, sin sorpresas, sin costo oculto
- "Primero trabajamos, después cobramos" — el cliente paga al finalizar y aprobar el proyecto
- Atención personalizada vía WhatsApp, sin burocracia
- Comunicación clara, sin tecnicismos

---

## 2. Servicios

Clik ofrece **4 líneas de servicio** con precios variables según alcance y personalización:

### 2.1 Tarjetas Digitales (Invitaciones interactivas)
- **Desde:** $20.000 ARS (diseños de catálogo existentes)
- **Hasta:** $40.000+ ARS (diseños 100% personalizados)
- **Incluye:** QR, WhatsApp, Instagram, contador regresivo, mapa, RSVP, música
- **Entrega:** 48 horas
- **Modalidad:** El cliente elige un diseño del catálogo o pide uno personalizado
- **Catálogo actual:** 13 diseños organizados en Casamientos, XV, Peques, Empresariales, Regalos

### 2.2 Páginas Web
- **Desde:** $80.000 ARS (landing page, 1 sección)
- **Incluye:** Diseño responsive, integración WhatsApp, redes sociales, formulario de contacto, hosting 1er año
- **Modalidad:** El precio varía según cantidad de secciones, funcionalidades y si el cliente ya tiene contenido o hay que investigar su negocio desde cero
- **Tipos:** Landing page, sitio profesional multi-página, e-commerce

### 2.3 Sistemas Web a Medida
- **Desde:** $350.000 ARS
- **Incluye:** Módulos personalizados, panel admin, usuarios y permisos, base de datos, integración de APIs
- **Modalidad:** Cada sistema se cotiza individualmente según funcionalidades
- **Tipos:** Dashboards, CRM, paneles de control, inventarios, SaaS

### 2.4 Sistemas con IA Integrada
- **Precio:** A consultar (cotización personalizada)
- **Incluye:** Modelos de IA personalizados, chatbots, asistentes virtuales, automatización de procesos
- **Modalidad:** Proyectos enterprise, se cotiza por alcance

---

## 3. Modelo de Negocio

### 3.1 Ciclo de venta
1. **Captación:** SEO orgánico, Instagram (`@clik.ba`), referencias
2. **Contacto:** El usuario completa un formulario o directamente envía un WhatsApp desde cualquier CTA del sitio
3. **Consulta:** Se analiza el proyecto con el cliente, se define alcance y precio
4. **Desarrollo:** Se trabaja el proyecto con comunicación constante
5. **Aprobación:** El cliente aprueba el resultado final
6. **Cobro:** El cliente paga (Mercado Pago o transferencia)
7. **Entrega:** Se entrega el proyecto terminado

### 3.2 Estrategia de precios
- No hay un catálogo de precios fijos por servicio
- Cada proyecto se cotiza individualmente según:
  - Complejidad técnica
  - Cantidad de contenido que aporta el cliente
  - Nivel de personalización requerido
  - Urgencia del proyecto
- El precio final se acuerda con el cliente por WhatsApp antes de comenzar

### 3.3 Métodos de pago actuales
| Método | Descripción |
|--------|-------------|
| Mercado Pago (link) | Link de pago único generado desde el panel de MP |
| Mercado Pago (alias) | Transferencia al alias `ntisera0x` |
| Mercado Pago (QR) | Código QR de MP para escanear |
| Transferencia bancaria | A través del alias/CVU de MP |

### 3.4 Flujo de pago actual
1. El cliente y Clik acuerdan el precio por WhatsApp
2. Según el método:
   - **Link de MP:** Se le envía un link de pago (generado manualmente desde el dashboard de MP)
   - **Alias/QR:** El cliente realiza la transferencia y avisa por WhatsApp
3. No hay confirmación automática de pago — todo es manual vía WhatsApp
4. No hay manejo de cuotas — el cliente paga el total acordado

---

## 4. Público Objetivo

### Segmentos principales
1. **Emprendedores argentinos** que necesitan presencia digital (landing pages, sitio web profesional)
2. **Particulares organizando eventos** (casamientos, XV, cumpleaños, baby showers) que quieren invitaciones digitales modernas
3. **Empresas/PyMEs** que necesitan sistemas a medida (CRM, dashboards, inventarios)
4. **Negocios con procesos repetitivos** interesados en automatización con IA

### Perfil del cliente
- Busca precio justo sin sorpresas
- Valora la comunicación directa y personalizada (WhatsApp)
- No tiene conocimientos técnicos profundos
- Quiere resultados rápidos (días, no meses)

---

## 5. Canales de Comunicación

| Canal | Detalle |
|-------|---------|
| **WhatsApp** | Canal principal. Número: +54 11 3350-1445. Todos los CTAs del sitio llevan a WhatsApp con mensaje predefinido según contexto |
| **Email** | nahueltisera03@gmail.com (a través de FormSubmit.co) |
| **Instagram** | @clik.ba — Red social principal para mostrar trabajos |
| **Web** | clik.com.ar — Escaparate principal y generación de leads |

---

## 6. Stack Tecnológico Actual

| Capa | Tecnología |
|------|------------|
| Frontend | React 19, TypeScript, TanStack Router, Tailwind CSS v4 |
| Build | Vite 7 |
| UI | shadcn/ui, Lucide icons, Radix UI |
| Tipografía | DM Serif Display + Red Hat Display |
| Hosting/Deploy | Cloudflare (vite plugin + wrangler) |
| Email | FormSubmit.co (sin backend propio) |
| Pagos | Mercado Pago (alias, QR, links manuales) |
| Animaciones | CSS keyframes (sin Framer Motion) |

---

## 7. Problemas Actuales a Resolver con el Backend

### 7.1 Gestión de precios dinámicos
- **Problema:** Los precios varían por cliente y por alcance. Actualmente se acuerdan por WhatsApp y se cobran con links manuales de MP o alias.
- **Necesidad:** Poder generar un link de pago personalizado por cliente/monto desde el frontend, sin tener que entrar al dashboard de MP.

### 7.2 Cuotas / Financiación
- **Problema:** MP ofrece cuotas sin interés y con interés, pero actualmente no se está usando la API de preferencias, solo alias o links manuales.
- **Necesidad:** Integrar la API de MP para crear preferencias de pago que permitan al cliente elegir entre 1 pago o cuotas (hasta 12, por ejemplo).

### 7.3 Confirmación automática de pagos
- **Problema:** Hoy el cliente paga y tiene que avisar por WhatsApp. No hay forma de saber automáticamente si alguien pagó.
- **Necesidad:** Webhook de MP que notifique cuando un pago se concreta, para cerrar el ciclo sin intervención manual.

### 7.4 Gestión de proyectos
- **Problema:** No hay un registro de qué pagó cada cliente, por cuánto, por qué servicio, y en qué estado está.
- **Necesidad:** Poder llevar un registro simple de proyectos, clientes y pagos (idealmente sin base de datos compleja).

---

## 8. Requerimientos para el Backend

### 8.1 Funcionalidades principales
1. Autenticación simple (admin) para acceder al panel de gestión
2. CRUD de servicios con precios base y descripciones
3. Generación de links de pago dinámicos (Mercado Pago API)
4. Soporte para cuotas (1, 3, 6, 12 pagos)
5. Webhook de confirmación de pagos
6. Registro básico de proyectos/clientes
7. Dashboard simple con historial de pagos

### 8.2 Consideraciones
- Los precios no son fijos — cada proyecto se cotiza individualmente
- El flujo debe ser: admin define monto → genera link → envía al cliente → cliente paga → webhook confirma → admin ve el estado
- Debe coexistir con el método actual de alias/transferencia manual
- Sin base de datos relacional compleja (idealmente SQLite, D1 en Cloudflare, o incluso JSON)

---

## 9. API de Mercado Pago — Integración Planeada

### Endpoints necesarios
| Endpoint | Descripción |
|----------|-------------|
| `POST /api/create-preference` | Crea una preferencia de pago con monto, descripción, y opciones de cuotas |
| `POST /api/webhook` | Recibe notificaciones de MP cuando un pago se aprueba |
| `GET /api/payments` | Lista de pagos recibidos |

### Configuración de cuotas
```json
{
  "payment_methods": {
    "installments": 12
  }
}
```
MP maneja automáticamente el cálculo de intereses y cuotas. Clik recibe el total acordado.

---

## 10. Glosario

| Término | Significado |
|---------|-------------|
| MP | Mercado Pago |
| Alias | Identificador de cuenta de MP (`ntisera0x`) |
| CVU | Clave Virtual de cuenta bancaria de MP |
| Preference | Objeto de MP que define un pago (monto, descripción, cuotas, etc.) |
| Init point | URL de checkout de MP generada por una preferencia |
| Webhook | Callback HTTP que MP envía cuando cambia el estado de un pago |
| Lead | Potencial cliente que contacta |
| Landing page | Página web de una sola sección, orientada a conversión |
| Proyecto | Trabajo acordado entre Clik y un cliente |

---

*Documento generado a partir del análisis completo del frontend (`src/`) en julio 2026.*

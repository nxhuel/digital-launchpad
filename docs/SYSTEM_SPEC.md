# Clik Agencia Digital — Especificación Funcional

## 1. Visión
Clik Agencia Digital es un sistema interno de gestión de proyectos, comunicación y pagos que reemplaza el flujo actual por WhatsApp. Centraliza en un solo panel toda la relación entre la agencia (admin) y sus clientes: solicitudes, cotizaciones, chat, entregas, cuotas y mantenimiento.

Es un sistema **independiente** de la web pública de captación de clientes. Aunque conviva en el mismo repositorio, no comparte datos ni vistas con la landing de marketing.

## 2. Actores
- **Admin** (Nahuel y Julieta): acceso total. Cotiza, gestiona proyectos, confirma pagos, sube entregas, administra clientes y servicios.
- **Cliente**: usuario final. Solicita proyectos, acepta/rechaza cotizaciones, chatea, sube comprobantes, ve entregas y cuotas.

## 3. Autenticación
- Registro con email + contraseña. Todo registro público crea un usuario con rol `client`.
- El admin queda pre-cargado en el seed (`nahueltisera03@gmail.com` / `admin123`).
- Sesión con JWT (access 15 min, refresh 7 días).
- El admin puede activar/desactivar clientes.

## 4. Servicios (catálogo interno)
Guía compartida entre admin y socia. **No se muestra en la web pública.** Sirve para armar cotizaciones consistentes.

Servicios base:
- Páginas Web *(admite mantenimiento)*
- Sistemas Web *(admite mantenimiento)*
- Sistemas con IA *(admite mantenimiento)*
- Mantenimiento (oculto para el cliente; se activa como opción dentro de otros servicios)

## 5. Flujo de un proyecto
1. **Solicitud**: el cliente elige un servicio, completa título, descripción y referencias. Estado inicial: `pendiente`.
2. **Cotización**: el admin revisa, fija `admin_price`, define cuotas y (si aplica) activa mantenimiento. Estado: `cotizado`.
3. **Aceptación**: el cliente acepta o rechaza. Al aceptar → estado `aceptado`, se generan N cuotas `pendiente`, y si hay mantenimiento se programa la primera mensualidad.
4. **Desarrollo**: el admin trabaja, chatea con el cliente y sube entregas parciales. Estado: `desarrollo`.
5. **Entregas**: cada entrega es un registro con nota, link opcional y adjuntos. **Visible para el cliente apenas se guarda.** Se puede editar; queda el historial con fecha/hora, más reciente arriba.
6. **Entregado / Completado**: el admin marca el proyecto como `entregado` y, cuando cobra todo, `completado`.
7. **Rechazado**: si el cliente no acepta la cotización.

## 6. Chat por proyecto
- Un chat por proyecto entre admin y cliente.
- Mensajes con adjuntos (imágenes, PDF, video, audio) hasta 5 MB.
- El input crece con el texto largo para mantener legibilidad.
- Cada mensaje nuevo dispara notificación al otro rol.

## 7. Pagos
Dos tipos:
- **Proyecto**: se generan al aceptar la cotización. Cantidad = `installments`, monto = `admin_price / installments`.
- **Mantenimiento**: mensual, monto = `admin_price / 2` por defecto (editable). Se genera el siguiente al confirmar el anterior.

Cada cuota muestra:
- Número de cuota, monto, estado (`pendiente` / `confirmado` / `rechazado`).
- Método (link MP, alias, QR, otro) cargado por el admin.
- **Fecha estimada del próximo pago** = último `paid_at` (o `accepted_at`) + 30 días.
- Comprobante adjunto (imagen o PDF) subido por cliente o admin.
- El admin confirma o rechaza; al confirmar se registra `paid_at`.

## 8. Ingresos del mes (solo admin)
Suma en el dashboard de:
- Pagos `confirmado` de tipo `project` de proyectos en estado `completado`, con `paid_at` en el mes actual.
- Pagos `confirmado` de tipo `maintenance` del mes actual.

## 9. Notificaciones
Se generan del lado del servidor ante cada evento:
- Registro de nuevo usuario (al admin).
- Creación de proyecto (al admin).
- Cambio de estado del proyecto (al cliente).
- Nuevo mensaje (al otro rol).
- Comprobante subido (al admin).
- Pago confirmado (al cliente).
- Nueva entrega (al cliente).

Campana en el header con contador de no leídas, link al recurso, marcar como leídas individual o todas.

## 10. Panel del admin
- **Dashboard**: KPIs (proyectos activos, en cotización, cuotas pendientes, ingresos del mes) + proyectos recientes.
- **Proyectos**: lista con filtros por estado, detalle completo con chat, cotización, cuotas, entregas, mantenimiento.
- **Clientes**: lista, activar/desactivar, ver proyectos de cada uno.
- **Servicios**: CRUD del catálogo interno.

## 11. Panel del cliente
- **Dashboard**: saludo, contadores (activos, en cotización, completados), lista de "Mis proyectos" **ordenada por más reciente primero**.
- **Nuevo proyecto**: elige servicio y completa el brief.
- **Detalle de proyecto**: estado, timeline, cotización, chat, entregas, cuotas, mantenimiento, subida de comprobantes.

## 12. Reglas de negocio clave
- Solo admin: crear/editar servicios, fijar precio, cambiar estado, crear entregas, confirmar pagos, activar mantenimiento.
- Mantenimiento disponible **solo** si `service.supports_maintenance = true`.
- Precio de mantenimiento por defecto = `admin_price / 2`, editable.
- Las cuotas siempre suman el precio final.
- Entregas visibles al cliente al instante, sin importar el estado.
- Cliente solo ve/toca sus propios recursos.

## 13. Adjuntos
- Límite 5 MB por archivo.
- Tipos: imágenes (jpg/png/webp), PDF, mp4, audio.
- Contextos: mensajes de chat, entregas, comprobantes de pago.
- Validación real del mime type (magic bytes), renombre a UUID.

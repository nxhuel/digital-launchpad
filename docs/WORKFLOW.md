# Clik Agencia Digital — Flujos y Estados

## 1. Estados del proyecto

```
        ┌──────────┐
        │ pendiente│  ← cliente crea
        └────┬─────┘
             │ admin cotiza (admin_price, installments, mantenimiento?)
             ▼
        ┌──────────┐
        │ cotizado │
        └────┬─────┘
      accept │  │ reject
             ▼  ▼
    ┌──────────┐  ┌──────────┐
    │ aceptado │  │ rechazado│  (terminal)
    └────┬─────┘  └──────────┘
         │ admin arranca a trabajar
         ▼
    ┌────────────┐
    │ desarrollo │  ← chat, entregas
    └────┬───────┘
         │ admin marca entregado
         ▼
    ┌───────────┐
    │ entregado │
    └────┬──────┘
         │ todas las cuotas confirmadas
         ▼
    ┌────────────┐
    │ completado │  (terminal)
    └────────────┘
```

### Reglas de transición:

pendiente → cotizado: admin fija admin_price (obligatorio) e installments (≥1).
cotizado → aceptado: acción del cliente. Setea accepted_at, genera N Payment(kind=project, status=pendiente). Si maintenance_enabled, crea el primer Payment(kind=maintenance).
cotizado → rechazado: acción del cliente. Terminal.
aceptado → desarrollo: acción del admin.
desarrollo → entregado: acción del admin (típicamente tras primera DeliveryRecord).
entregado → completado: acción del admin cuando todas las cuotas project están confirmado.

## 2. Estados del pago

```
┌───────────┐   admin confirma    ┌────────────┐
│ pendiente │ ──────────────────► │ confirmado │
└─────┬─────┘                     └────────────┘
      │ admin rechaza
      ▼
┌───────────┐
│ rechazado │
└───────────┘
```
- Al confirmar: setea paid_at = now().
- Si kind=maintenance y se confirma: se genera automáticamente el próximo Payment(kind=maintenance) para el mes siguiente.
- next_due_date del proyecto se recalcula: último paid_at + 30 días (o accepted_at + 30 días si aún no hay pagos).

## 3. Flujo de solicitud (cliente)

``` 
Registro → Login → Dashboard → "Solicitar proyecto"
   → Elegir servicio → Completar brief → Enviar
   → Proyecto en `pendiente` → Notificación al admin
```

## 4. Flujo de cotización (admin)

```
Notificación → Detalle del proyecto → Fijar precio, cuotas, mantenimiento
   → Guardar → estado `cotizado` → Notificación al cliente
```

## 5. Flujo de aceptación (cliente)

```
Notificación → Detalle → Revisar cotización
   → Aceptar (genera cuotas) │ Rechazar (terminal)
   → Notificación al admin
```

## 6. Flujo de entrega (admin → cliente)

```
Admin sube DeliveryRecord (nota + link + adjuntos)
   → Visible al cliente al instante
   → Notificación al cliente
   → Editable después: cada edición queda registrada con timestamp, historial descendente
```

## 7. Flujo de pago

```
Cliente ve cuota `pendiente` con método (link MP / alias / QR)
   → Paga por fuera del sistema
   → Sube comprobante (imagen o PDF)  ─┐
                                        ├─► Notificación al admin
Admin también puede subirlo si lo recibió ─┘
   → Admin revisa y confirma o rechaza
   → Si confirma: paid_at seteado, notificación al cliente
   → Si era la última cuota `project` confirmada: proyecto listo para `completado`
   → Si era `maintenance` confirmado: se genera la siguiente mensualidad
```

## 8. Flujo de chat

```
Emisor escribe mensaje (+ adjuntos opcionales)
   → Se persiste
   → Notificación al otro rol (agrupada si hay varias seguidas)
   → Receptor abre proyecto → notificaciones marcadas como leídas
```

## 9. Flujo de notificaciones

Eventos que generan notificación:
```
Evento - Destinatario
Nuevo usuario registrado - admin
Proyecto creado - admin
Cambio de estado del proyecto - cliente
Nuevo mensaje - otro rol
Comprobante subido - admin
Pago confirmado / rechazado - cliente
Nueva entrega o edición	cliente
```
Campana en header muestra no leídas; click navega al recurso (link) y marca como leída.

## 10. Cálculo de ingresos del mes (admin dashboard)

```
ingresos_mes =
   Σ Payment.amount
   WHERE Payment.status = 'confirmado'
     AND MONTH(Payment.paid_at) = MONTH(now())
     AND (
       Payment.kind = 'maintenance'
       OR (Payment.kind = 'project' AND Project.status = 'completado')
     )
```
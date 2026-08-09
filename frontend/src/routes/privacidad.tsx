import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { LegalLayout } from "@/components/site/LegalLayout";
import { SITE } from "@/config/site";

export const Route = createFileRoute("/privacidad")({
  component: PrivacidadPage,
});

function PrivacidadPage() {
  return (
    <LegalLayout
      icon={<ShieldCheck className="h-6 w-6" />}
      title="Política de Privacidad"
      subtitle="Cómo recopilamos, usamos y protegemos tus datos personales al usar los servicios de Clik Agencia Digital."
      updatedAt="agosto de 2026"
      sections={[
        {
          title: "Responsable del tratamiento",
          body: (
            <>
              <p>
                El responsable del tratamiento de los datos personales es{" "}
                <strong>Clik Agencia Digital</strong> (en adelante, "Clik", "nosotros" o "el sitio"),
                con correo de contacto <strong>{SITE.email}</strong>. Al crear una cuenta o usar
                cualquiera de nuestros servicios, aceptás los términos de esta política.
              </p>
            </>
          ),
        },
        {
          title: "Qué datos recopilamos",
          body: (
            <>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Datos de cuenta:</strong> nombre, dirección de correo electrónico y
                  contraseña (almacenada siempre de forma encriptada, nunca en texto plano).
                </li>
                <li>
                  <strong>Datos de los proyectos:</strong> información que nos brindás sobre el
                  servicio solicitado (páginas web, sistemas o tarjetas digitales), como descripciones,
                  imágenes, fechas y material de referencia que compartas en los chats de tu proyecto.
                </li>
                <li>
                  <strong>Datos de pago:</strong> registros de pagos realizados y comprobantes
                  subidos. Los pagos se procesan a través de <strong>Mercado Pago</strong>; no
                  almacenamos ni tenemos acceso a los datos de tu tarjeta de crédito o débito.
                </li>
                <li>
                  <strong>Datos técnicos:</strong> dirección IP, tipo de navegador y datos de uso
                  básicos, necesarios para el funcionamiento y la seguridad del sitio.
                </li>
              </ul>
            </>
          ),
        },
        {
          title: "Cómo validamos tu correo electrónico",
          body: (
            <>
              <p>
                Al registrarte te enviamos un código de verificación a tu correo a través de nuestro
                proveedor de email transaccional (<strong>Resend</strong>), para confirmar que la
                dirección de correo te pertenece. El código tiene una validez limitada y se guarda de
                forma encriptada. No usamos tu correo para enviarte publicidad sin tu consentimiento.
              </p>
            </>
          ),
        },
        {
          title: "Para qué usamos tus datos",
          body: (
            <>
              <ul className="list-disc pl-5 space-y-2">
                <li>Crear y gestionar tu cuenta y tus pedidos.</li>
                <li>Comunicarnos con vos sobre tus proyectos, pagos y entregas.</li>
                <li>Validar tu correo y permitirte restablecer tu contraseña.</li>
                <li>Cumplir con obligaciones legales y contables.</li>
                <li>Prevenir fraudes y proteger la seguridad del sistema.</li>
              </ul>
              <p>
                No vendemos, alquilamos ni cedemos tus datos personales a terceros con fines
                comerciales.
              </p>
            </>
          ),
        },
        {
          title: "Cómo protegemos tus datos",
          body: (
            <>
              <ul className="list-disc pl-5 space-y-2">
                <li>Tus contraseñas se guardan con un algoritmo de hash seguro (bcrypt).</li>
                <li>Las sesiones usan tokens firmados (JWT) con expiración automática.</li>
                <li>Toda la comunicación con el sitio viaja encriptada (HTTPS).</li>
                <li>Los códigos de verificación se almacenan encriptados y con límite de intentos.</li>
                <li>Limitamos la cantidad de intentos de ingreso para prevenir accesos no autorizados.</li>
              </ul>
            </>
          ),
        },
        {
          title: "Terceros con los que trabajamos",
          body: (
            <>
              <p>Para operar el servicio, compartimos datos mínimos con:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Mercado Pago</strong> — procesamiento de pagos (datos de la transacción,
                  nunca tus credenciales bancarias).
                </li>
                <li>
                  <strong>Resend</strong> — envío de correos transaccionales (verificación y
                  restablecimiento de contraseña).
                </li>
                <li>
                  <strong>Railway</strong> — infraestructura de hosting donde se alojan la base de
                  datos y los archivos del sistema.
                </li>
              </ul>
              <p>
                Cada proveedor aplica sus propias políticas de privacidad y solo recibe la
                información necesaria para brindar su servicio.
              </p>
            </>
          ),
        },
        {
          title: "Tus derechos",
          body: (
            <>
              <p>
                De acuerdo con la <strong>Ley Nacional de Protección de Datos Personales N° 25.326</strong>{" "}
                (Argentina) y la normativa aplicable, podés ejercer los derechos de:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Acceso:</strong> solicitá qué datos tuyos tenemos almacenados.
                </li>
                <li>
                  <strong>Rectificación:</strong> corregir datos inexactos o desactualizados.
                </li>
                <li>
                  <strong>Supresión:</strong> solicitar la eliminación de tus datos personales,
                  sujeto a obligaciones legales de conservación.
                </li>
                <li>
                  <strong>Revocación del consentimiento:</strong> en cualquier momento.
                </li>
              </ul>
              <p>
                Para ejercer cualquiera de estos derechos, escribinos a{" "}
                <a className="text-violet-600 hover:text-violet-800" href={`mailto:${SITE.email}`}>
                  {SITE.email}
                </a>{" "}
                y lo gestionaremos en un plazo razonable. En caso de considerar vulnerados tus
                derechos, podés presentar una denuncia ante la <strong>AAIP</strong> (Agencia de
                Acceso a la Información Pública).
              </p>
            </>
          ),
        },
        {
          title: "Retención de datos",
          body: (
            <>
              <p>
                Conservamos tus datos mientras tu cuenta esté activa y durante el tiempo necesario
                para cumplir obligaciones legales, contables y fiscales (en particular, los registros
                de pagos). Cuando eliminás tu cuenta, eliminamos tus datos personales salvo aquellos
                que la ley nos obligue a conservar.
              </p>
            </>
          ),
        },
        {
          title: "Menores de edad",
          body: (
            <>
              <p>
                Los servicios de Clik están dirigidos a mayores de 18 años. No recopilamos
                intencionalmente datos de menores. Si sos padre, madre o tutor y detectás que un menor
                creó una cuenta, contactanos para eliminarla.
              </p>
            </>
          ),
        },
        {
          title: "Cambios en esta política",
          body: (
            <>
              <p>
                Podemos actualizar esta política periódicamente. Publicaremos la versión vigente en
                esta página con su fecha de actualización. El uso continuado del sitio tras una
                modificación implica la aceptación de la nueva versión.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

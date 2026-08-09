import { createFileRoute } from "@tanstack/react-router";
import { Scale } from "lucide-react";
import { LegalLayout } from "@/components/site/LegalLayout";
import { SITE } from "@/config/site";

export const Route = createFileRoute("/terminos")({
  component: TerminosPage,
});

function TerminosPage() {
  return (
    <LegalLayout
      icon={<Scale className="h-6 w-6" />}
      title="Términos de Servicio"
      subtitle="Las reglas que rigen el uso de la plataforma y los servicios de Clik Agencia Digital."
      updatedAt="agosto de 2026"
      sections={[
        {
          title: "Aceptación de los términos",
          body: (
            <>
              <p>
                Estos Términos de Servicio ("Términos") regulan el acceso y uso de la plataforma de{" "}
                <strong>Clik Agencia Digital</strong> ("Clik", "nosotros", "el sitio"). Al crear una
                cuenta, ingresar o utilizar cualquiera de nuestros servicios, declarás ser mayor de 18
                años y aceptás estos Términos en su totalidad. Si no estás de acuerdo, no uses el
                sitio.
              </p>
            </>
          ),
        },
        {
          title: "Nuestros servicios",
          body: (
            <>
              <p>Clik ofrece servicios de desarrollo digital, entre los que se incluyen:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Páginas y sistemas web a medida.</li>
                <li>Tarjetas e invitaciones digitales para eventos.</li>
                <li>Automatizaciones, integraciones y mantenimiento de sitios.</li>
              </ul>
              <p>
                Las características, precios y plazos de cada servicio se acuerdan por escrito entre
                el cliente y Clik. Los presupuestos aprobados son vinculantes en las condiciones
                pactadas.
              </p>
            </>
          ),
        },
        {
          title: "Tu cuenta y su seguridad",
          body: (
            <>
              <ul className="list-disc pl-5 space-y-2">
                <li>Sos responsable de mantener la confidencialidad de tu contraseña.</li>
                <li>Debés brindar datos verdaderos y mantenerlos actualizados.</li>
                <li>
                  No podés compartir tu cuenta ni permitir que terceros accedan a ella con tus
                  credenciales.
                </li>
                <li>
                  Ante cualquier uso no autorizado de tu cuenta, debés informarnos de inmediato a{" "}
                  {SITE.email}.
                </li>
                <li>
                  Podemos suspender el acceso mientras investigamos actividades sospechosas o
                  violaciones de seguridad.
                </li>
              </ul>
            </>
          ),
        },
        {
          title: "Uso permitido y prohibido",
          body: (
            <>
              <p>Te comprometés a usar la plataforma de forma legal y de buena fe. Queda prohibido:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Intentar vulnerar, dañar, sobrecargar o interferir con el funcionamiento del
                  sistema, sus servidores, bases de datos o redes (incluidos ataques de fuerza bruta,
                  inyección, "scraping" masivo o cualquier otra técnica de intrusión).
                </li>
                <li>
                  Usar la plataforma para fines ilegales, fraudulentos o que violen derechos de
                  terceros.
                </li>
                <li>Suplantar identidad, crear cuentas falsas o usar cuentas de terceros.</li>
                <li>
                  Subir contenido malicioso (virus, malware, archivos ejecutables disfrazados) o
                  contenido que infrinja propiedad intelectual de terceros.
                </li>
                <li>
                  Revender, sublicenciar o explotar comercialmente la plataforma sin autorización.
                </li>
              </ul>
            </>
          ),
        },
        {
          title: "Pagos y reembolsos",
          body: (
            <>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Los pagos se procesan de forma segura a través de Mercado Pago o transferencia
                  bancaria según lo acordado.
                </li>
                <li>
                  Los pagos recibidos se registran en el panel del proyecto. Clik no almacena datos de
                  tarjetas.
                </li>
                <li>
                  Los reembolsos se evalúan caso por caso según el avance del trabajo y se gestionan
                  por escrito dentro de los 10 días hábiles de la solicitud.
                </li>
                <li>
                  El incumplimiento de pago en los plazos pactados puede suspender la entrega o el
                  mantenimiento del servicio hasta regularizar la deuda.
                </li>
              </ul>
            </>
          ),
        },
        {
          title: "Propiedad intelectual",
          body: (
            <>
              <p>
                El sitio, su diseño, código, textos, imágenes y marcas son propiedad de Clik o de sus
                licenciantes. No podés copiarlos, reproducirlos ni utilizarlos sin autorización
                previa.
              </p>
              <p>
                Los entregables desarrollados para el cliente (sitios, sistemas o tarjetas) pasan a
                ser de uso comercial del cliente una vez abonados en su totalidad, salvo acuerdo en
                contrario.
              </p>
              <p>
                El cliente declara contar con los derechos sobre las imágenes, textos, marcas y
                contenidos que nos brinde para desarrollar su proyecto.
              </p>
            </>
          ),
        },
        {
          title: "Suspensión y bloqueo de cuentas",
          body: (
            <>
              <p>
                Clik puede suspender o eliminar de forma temporal o definitiva una cuenta, o rechazar
                pedidos, cuando se verifique alguna de las siguientes circunstancias:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Violación de estos Términos, en particular de la sección de uso prohibido.</li>
                <li>Actividad fraudulenta, intentos de intrusión o daño al sistema.</li>
                <li>Uso de la plataforma para actividades ilegales.</li>
                <li>Incumplimiento reiterado de obligaciones de pago.</li>
              </ul>
              <p>
                La suspensión se comunica al correo de la cuenta. En caso de bloqueo definitivo, los
                pedidos en curso se resuelven según lo pactado y las obligaciones de pago pendientes
                se mantienen.
              </p>
            </>
          ),
        },
        {
          title: "Limitación de responsabilidad",
          body: (
            <>
              <p>
                El sitio se brinda "tal cual" y dentro de los límites técnicos razonables. No
                garantizamos disponibilidad ininterrumpida ni la ausencia de errores, aunque
                trabajamos para mantener la continuidad del servicio.
              </p>
              <p>
                En la medida permitida por la ley, Clik no será responsable por daños indirectos,
                pérdida de datos, lucro cesante o interrupciones causadas por terceros, fallas de
                infraestructura o fuerza mayor. Nuestra responsabilidad total frente a un reclamo no
                excederá el monto efectivamente abonado por el cliente en los 12 meses anteriores al
                reclamo.
              </p>
            </>
          ),
        },
        {
          title: "Ley aplicable y jurisdicción",
          body: (
            <>
              <p>
                Estos Términos se rigen por las leyes de la <strong>República Argentina</strong>. Para
                cualquier controversia, las partes se someten a la jurisdicción de los tribunales
                ordinarios de la Ciudad Autónoma de Buenos Aires, renunciando a cualquier otro fuero
                que pudiera corresponder.
              </p>
            </>
          ),
        },
        {
          title: "Modificaciones",
          body: (
            <>
              <p>
                Podemos actualizar estos Términos cuando sea necesario. Publicaremos la versión
                vigente en esta página con su fecha de actualización y, en caso de cambios
                sustanciales, lo notificaremos por correo. El uso continuado del sitio tras una
                modificación implica su aceptación.
              </p>
            </>
          ),
        },
        {
          title: "Contacto",
          body: (
            <>
              <p>
                Ante dudas, reclamos o consultas sobre estos Términos, escribinos a{" "}
                <a className="text-violet-600 hover:text-violet-800" href={`mailto:${SITE.email}`}>
                  {SITE.email}
                </a>
                .
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

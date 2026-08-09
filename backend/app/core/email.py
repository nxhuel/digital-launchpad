"""Envío de emails transaccionales a través de Resend.

Si RESEND_API_KEY no está configurado (desarrollo local), los códigos se
loguean en la consola del servidor y el envío se omite, para que el flujo
pueda probarse sin depender del servicio.
"""
import logging

import httpx

from backend.app.core.config import settings

logger = logging.getLogger("email")

RESEND_API_URL = "https://api.resend.com/emails"


def _send(to_email: str, subject: str, html: str) -> None:
    if not settings.RESEND_API_KEY:
        logger.info("[EMAIL DISABLED] Para=%s Asunto=%s (configurá RESEND_API_KEY para enviar real)", to_email, subject)
        return
    from_email = settings.EMAIL_FROM or "Clik Agencia Digital <onboarding@resend.dev>"
    try:
        resp = httpx.post(
            RESEND_API_URL,
            headers={
                "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json={"from": from_email, "to": [to_email], "subject": subject, "html": html},
            timeout=15,
        )
        resp.raise_for_status()
    except Exception as exc:  # noqa: BLE001
        logger.exception("Error enviando email a %s", to_email)
        raise RuntimeError(f"No se pudo enviar el email a través de Resend: {exc}") from exc


def _branded_html(title: str, body_html: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background-color:#f4f4f8;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f8;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e9e6f5;">
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#5b21b6);padding:28px 32px;text-align:center;">
              <span style="font-size:26px;font-weight:bold;color:#ffffff;letter-spacing:1px;">Clik Agencia Digital</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;color:#1f2937;">
              <h1 style="margin:0 0 12px;font-size:20px;color:#111827;">{title}</h1>
              {body_html}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background-color:#faf9ff;color:#6b7280;font-size:12px;text-align:center;border-top:1px solid #f0edf8;">
              Si no solicitaste este email, podés ignorarlo. · Clik Agencia Digital
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def send_code_email(to_email: str, code: str, name: str | None = None, purpose: str = "verification") -> None:
    """Envía un código de verificación o de restablecimiento de contraseña."""
    first_name = (name or "").strip().split()[0] if (name or "").strip() else ""
    greeting = f"Hola {first_name}," if first_name else "Hola,"

    if purpose == "verification":
        subject = "Tu código de verificación de Clik"
        title = "Confirmá tu correo"
        body = f"""
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">{greeting}</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
            Para completar tu registro usá este código:
          </p>
          <p style="margin:0 0 16px;text-align:center;">
            <span style="display:inline-block;font-size:32px;font-weight:bold;letter-spacing:8px;color:#5b21b6;background:#f3effc;border-radius:10px;padding:12px 20px;">{code}</span>
          </p>
          <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
            El código es válido por {settings.VERIFICATION_CODE_MINUTES} minutos.
          </p>
        """
    else:
        subject = "Restablecé tu contraseña de Clik"
        title = "Código para restablecer tu contraseña"
        body = f"""
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">{greeting}</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
            Usá este código para crear una nueva contraseña:
          </p>
          <p style="margin:0 0 16px;text-align:center;">
            <span style="display:inline-block;font-size:32px;font-weight:bold;letter-spacing:8px;color:#5b21b6;background:#f3effc;border-radius:10px;padding:12px 20px;">{code}</span>
          </p>
          <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
            El código es válido por {settings.RESET_CODE_MINUTES} minutos. Si no lo pediste vos, ignorá este email.
          </p>
        """

    _send(to_email, subject, _branded_html(title, body))

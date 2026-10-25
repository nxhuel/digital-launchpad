Armame una tarjeta digital (index.html + styles.css + script.js + carpeta assets/) para comprimir en .ZIP.
[ACÁ EL DISEÑO QUE QUIERAS: estilo, secciones, textos, etc.]

REGLAS TÉCNICAS OBLIGATORIAS:
- Todo el CSS en styles.css y todo el JS en script.js (JavaScript vainilla, sin frameworks ni CDN salvo Google Fonts).
- index.html OBLIGATORIO en la raíz del ZIP. Todas las referencias con rutas RELATIVAS (styles.css, assets/foto.jpg). Prohibido rutas absolutas (/styles.css) y URLs hardcodeadas al dominio.
- El slug de la tarjeta se obtiene con: location.pathname.split('/')[2]. Nunca hardcodearlo.
- El ZIP no lleva backend ni base de datos: solo diseña y llama a los endpoints de abajo.
- Diseño mobile-first, accesible y con estados visibles de carga, éxito y error.
- No uses formularios que recarguen la página: manejá los envíos con fetch y preventDefault().

CONTRATO CON EL SISTEMA (endpoints existentes, sin autenticación):
BASE: /api/public/tarjetas/{slug}

1. CONFIG (al cargar la página):
   GET {BASE}/config
   Respuesta:
   {
     "slug": "nombre-evento",
     "title": "Casamiento de Ana y Juan",
     "menu_options": ["Normal", "Veggie", "Celíaco", "Infantil"],
     "features": ["rsvp", "menu", "album"],
     "submissions_open": true
   }
   - Con menu_options se arman las opciones de los campos "menú" del invitado principal y de cada acompañante.
   - Si menu_options está vacío, ocultá los selectores de menú (no inventes opciones).
   - Si submissions_open es false: reemplazá formularios y subida de fotos por "Las confirmaciones están cerradas".
   - Podés usar features para mostrar u ocultar secciones, pero no es obligatorio: el administrador ya eligió qué secciones tiene la tarjeta.

2. CONFIRMACIÓN DE ASISTENCIA (RSVP CON GRUPO FAMILIAR):
   POST {BASE}/respuestas
   Content-Type: application/json

   Estructura EXACTA que tenés que enviar:
   {
     "kind": "rsvp",
     "nombre": "Ana Pérez",
     "asisten": true,
     "menu": "Normal",
     "cantidad": 3,
     "notas": null,
     "acompañantes": [
       { "nombre": "Juan Pérez", "asisten": true, "menu": "Veggie", "notas": null },
       { "nombre": "Luis Pérez", "asisten": false, "menu": null, "notas": null },
       { "nombre": "Sofía Pérez", "asisten": null, "menu": "Celíaco", "notas": "Menú sin sal" }
     ],
     "cancion": "La Bamba",
     "mensaje": "¡Felicitaciones!"
   }

   TIPOS DE DATOS Y REGLAS:
   - nombre (string, OBLIGATORIO): nombre del invitado principal. Trim, mínimo 1, máximo 120 caracteres.
   - asisten (boolean | null): estado del invitado principal. true = asiste, false = no asiste, null = sin responder. No mandes strings como "true" ni "false".
   - menu (string | null): menú del invitado principal. Debe ser una de las opciones de menu_options o null.
   - notas (string | null): aclaración del invitado principal. Opcional, máximo 300 caracteres.
   - cantidad (integer): cantidad de acompañantes declarados. Debe ser IGUAL a acompañantes.length. No incluye al invitado principal. Si no hay acompañantes, mandá 0.
   - acompañantes (array de objetos): cada subinvitado del grupo. Máximo 20. Puede ser [] si no hay acompañantes.
     Cada objeto acepta:
     * nombre (string, OBLIGATORIO si agregás el acompañante): máximo 120 caracteres.
     * asisten (boolean | null): estado individual de ese acompañante. null = sin responder.
     * menu (string | null): menú individual. Debe ser una de las opciones de menu_options o null.
     * notas (string | null): aclaración libre, máximo 300 caracteres. Opcional.
   - cancion (string | null): canción pedida por el grupo. Opcional, máximo 300 caracteres.
   - mensaje (string | null): dedicatoria del grupo. Opcional, máximo 1000 caracteres.
   - IMPORTANTE: canción y mensaje viajan DENTRO de este mismo POST RSVP. No crees secciones, formularios ni endpoints separados para canciones o mensajes.
   - No agregues objetos anidados dentro de un acompañante. No agregues arrays dentro de un acompañante.
   - El payload completo debe pesar menos de 32 KB.

   IMPORTANTE SOBRE EL MODELO:
   - Siempre se confirma primero al invitado principal (el que llena el formulario) y después se agregan los acompañantes/subinvitados.
   - Cada acompañante tiene su PROPIO asisten, su PROPIO menu y sus PROPIAS notas.
   - Nada de eso es obligatorio: un acompañante puede quedar "Sin responder", sin menú y sin notas.
   - No uses "cantidad" para representar el total de personas. cantidad = cantidad de acompañantes. El total del grupo es 1 (principal) + acompañantes.length.
   - Las tarjetas viejas que solo mandan "cantidad" siguen funcionando en el sistema, pero esta tarjeta nueva debe usar siempre "acompañantes".
   - El invitado principal también puede quedar "Sin responder", pero por defecto mostralo como "Asiste" porque está confirmando su propia asistencia.

   UX OBLIGATORIA DEL FORMULARIO RSVP:
   - Mostrá un formulario con el invitado principal siempre visible: nombre, estado (Asiste / No asiste / Sin responder), menú y notas.
   - Debajo, un botón "Agregar acompañante" que agrega una fila nueva. Cada fila debe tener: nombre, estado (Asiste / No asiste / Sin responder), menú, notas y un botón para quitarla.
   - No obligues a completar estado, menú ni notas de los acompañantes.
   - Si el usuario agrega un acompañante, pedile el nombre antes de enviar; si está vacío, mostrá un error claro y no envíes.
   - Incluí siempre un campo de dedicatoria (mensaje) en este mismo formulario: es lo que los dueños leen en la columna Detalles de su panel. No lo armes como sección aparte.
   - Usá radios, selects o botones de estado; no uses un checkbox para representar tres estados.
   - El select de menú debe construirse con menu_options del config.
   - Antes de enviar, armá el JSON respetando los tipos: cantidad = acompañantes.length; asisten booleano o null; menu string o null; notas string o null.
   - Deshabilitá el botón mientras se envía para evitar duplicados.
   - Mostrá "¡Gracias por confirmar!" cuando responde 201 {ok:true, id}.
   - Errores: 400 = confirmaciones cerradas; 422 = datos inválidos; 429 = demasiados intentos; 404 = tarjeta inexistente. Mostrá un mensaje claro y permití reintentar.
   - Si submissions_open es false, no muestres el formulario: mostrá "Las confirmaciones están cerradas".

3. FOTOS (álbum de invitados):
   POST {BASE}/fotos
   multipart/form-data con campos: file (imagen JPG/PNG/WEBP, máx. 10 MB) + nombre (opcional).
   - Input sugerido: <input type="file" accept="image/*"> (abre la cámara en el celular).
   - Responde 201 con {payload: {url, thumb_url}}.
   - Mismos errores que respuestas + 503 si el servicio de fotos no está configurado.
   - IMPORTANTE: las fotos las ven los dueños en SU panel privado (no hay galería pública). El ZIP solo SUBE fotos, no las lista.

DETECCIÓN AUTOMÁTICA DE SECCIONES:
- El panel detecta qué secciones implementa el ZIP leyendo index.html, styles.css y script.js. Para que funcione, dejá los literales del contrato visibles en el código:
  * kind:"rsvp" en el POST de confirmación (el mismo POST incluye canción y mensaje).
  * /fotos en la subida de fotos del álbum.
  * menu_options al construir los selectores de menú.
- No ofusques ni armes esos valores dinámicamente si eso hace desaparecer el literal del archivo.
- La detección es una ayuda: el administrador puede ajustar el checklist antes de publicar.

EJEMPLO DE FLUJO COMPLETO:
1. Al cargar: GET {BASE}/config.
2. Si submissions_open === false: mostrar "Las confirmaciones están cerradas" y ocultar formularios.
3. Armar el formulario RSVP con el principal + botón "Agregar acompañante", más la dedicatoria (mensaje) y, si el diseño lo pide, la canción en ese mismo formulario.
4. Al enviar: validar nombre del principal y nombres de acompañantes agregados.
5. POST {BASE}/respuestas con el JSON del grupo (incluyendo cancion/mensaje si corresponde).
6. Si 201: mostrar éxito y limpiar el formulario.
7. Si error: mostrar el mensaje correspondiente y reactivar el botón.

NO HAGAS:
- No hardcodees el slug.
- No agregues backend propio, base de datos ni login.
- No uses frameworks ni CDN salvo Google Fonts.
- No mandes cantidad como total de personas.
- No obligues a responder estado, menú o notas.
- No crees secciones ni POST separados de canciones o mensajes: van dentro del RSVP.
- No inventes endpoints ni campos fuera de este contrato.
- No anides objetos/arrays dentro de un acompañante.

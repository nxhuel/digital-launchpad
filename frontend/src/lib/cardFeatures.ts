/* Secciones que puede tener una tarjeta desplegada. El admin las tilda al
   subir el ZIP (y puede cambiarlas después en Ajustes); el panel del cliente
   solo muestra las habilitadas. Las claves coinciden con el backend.

   El checklist refleja lo que el contrato de las tarjetas puede generar:
   - rsvp:  POST {BASE}/respuestas con kind="rsvp" (incluye canción y mensaje)
   - menu:  config.menu_options (el cliente edita las opciones)
   - album: POST {BASE}/fotos (kind="foto" en el panel) */
export type CardFeatureKey = 'rsvp' | 'menu' | 'album'

export const CARD_FEATURES: { key: CardFeatureKey; label: string; description: string }[] = [
  {
    key: 'rsvp',
    label: 'Confirmaciones',
    description:
      'Invitado principal + acompañantes, cada uno con estado, menú y notas. Canción y mensaje viajan en la misma confirmación. Descarga en Excel.',
  },
  {
    key: 'menu',
    label: 'Menú',
    description:
      'Opciones de menú (Normal, Veggie, Celíaco...) que el cliente puede editar desde su panel.',
  },
  {
    key: 'album',
    label: 'Álbum de fotos',
    description:
      'Fotos que suben los invitados. Son privadas: se ven y descargan solo desde el panel.',
  },
]

export const CARD_FEATURE_KEYS: CardFeatureKey[] = CARD_FEATURES.map(f => f.key)

export function enabledFeatures(list: readonly string[] | undefined): CardFeatureKey[] {
  const raw = list ?? []
  return CARD_FEATURE_KEYS.filter(key => raw.includes(key))
}

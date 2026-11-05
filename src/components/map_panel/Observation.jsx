import { Plus } from 'lucide-preact'
import { GhostButton } from '../buttons/GhostButton'
import { TextArea } from '../input/TextArea'

// editing + !open: botón para agregar · editing + open: campo de texto · vista: texto (si existe)
// imageButton: agrega el botón "Imagen" junto al de observación (por ahora solo visual)
// children: campos que comparten la sección en modo edición (p. ej. el selector de color). Con el
// campo abierto van debajo de él; con el botón, encima.
export function Observation ({ editing = false, open = false, value = '', onOpen, onInput, imageButton = false, children }) {
    if (editing) {
        return (
            <div class="flex w-full flex-col gap-2 overflow-clip border-b border-slate-200 p-3">
                {open ? (
                    <>
                        <TextArea
                            autoFocus
                            label="Observación"
                            value={value}
                            onInput={(event) => onInput(event.currentTarget.value)}
                        />
                        {children}
                    </>
                ) : (
                    <>
                        {children}
                    </>
                )}
                {(!open || imageButton) && (
                    <div class="flex w-full flex-wrap items-center gap-1">
                        {!open && <GhostButton size="xs" leadingIcon={Plus} onClick={onOpen}>Observación</GhostButton>}
                        {imageButton && <GhostButton size="xs" leadingIcon={Plus}>Imagen</GhostButton>}
                    </div>
                )}
            </div>
        )
    }

    if (!value) return null

    return (
        <div class="flex w-full px-4 py-3">
            <p class="min-w-px flex-1 whitespace-pre-wrap break-words text-sm text-slate-700">{value}</p>
        </div>
    )
}

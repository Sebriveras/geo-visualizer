import { Plus } from 'lucide-preact'
import { GhostButton } from '../buttons/GhostButton'
import { TextArea } from '../input/TextArea'

// editing + !open: botón para agregar · editing + open: campo de texto · vista: texto (si existe)
// children: campos que comparten la sección en modo edición (p. ej. el selector de color). Con el
// campo abierto van debajo de él; con el botón, encima.
export function Observation ({ editing = false, open = false, value = '', onOpen, onInput, children }) {
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
                        <div class="flex w-full flex-wrap items-center gap-1">
                            <GhostButton size="xs" leadingIcon={Plus} onClick={onOpen}>Observación</GhostButton>
                        </div>
                    </>
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

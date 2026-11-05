import { useEffect, useRef } from 'preact/hooks'
import { OutlineButton } from '../buttons/OutlineButton'
import { TonalButton } from '../buttons/TonalButton'

// Advertencia modal para acciones destructivas. Cubre el área bajo el encabezado de la app (h-12), como en el diseño.
// Escape o un clic fuera cancelan; el foco empieza en "Cancelar" para que Enter nunca confirme por accidente.
export function ConfirmDialog ({ title, message, confirmLabel = 'Eliminar', cancelLabel = 'Cancelar', onConfirm, onCancel }) {
    const dialogRef = useRef(null)

    const latest = useRef(onCancel)
    latest.current = onCancel

    // El primer botón del diálogo es "Cancelar"
    useEffect(() => {
        dialogRef.current.querySelector('button').focus()
    }, [])

    useEffect(() => {
        // En captura y deteniendo la propagación: Escape solo cierra el diálogo, no lo que haya debajo (trazados, paneles)
        const onKeyDown = (event) => {
            if (event.key !== 'Escape') return
            event.stopPropagation()
            latest.current()
        }
        window.addEventListener('keydown', onKeyDown, true)
        return () => window.removeEventListener('keydown', onKeyDown, true)
    }, [])

    return (
        <div
            class="pointer-events-auto fixed inset-x-0 bottom-0 top-12 z-50 flex items-center justify-center bg-black/15 p-6"
            onMouseDown={(event) => event.target === event.currentTarget && onCancel()}
        >
            <div ref={dialogRef} role="alertdialog" aria-modal="true" aria-label={title} class="flex w-104 max-w-full flex-col items-center overflow-clip rounded-3xl bg-white shadow-[0_10px_15px_-3px_#0000001a,0_4px_6px_-4px_#0000001a]">
                <div class="flex h-18 w-full shrink-0 items-center justify-center px-6">
                    <h2 class="min-w-px flex-1 text-center text-2xl font-semibold text-slate-700">{title}</h2>
                </div>

                <div class="w-full px-6 py-3">
                    <p class="break-words text-center text-base leading-normal text-slate-700">{message}</p>
                </div>

                <div class="flex w-full items-center gap-2 p-6">
                    <OutlineButton class="flex-1" onClick={onCancel}>{cancelLabel}</OutlineButton>
                    <TonalButton tone="destructive" class="flex-1" onClick={onConfirm}>{confirmLabel}</TonalButton>
                </div>
            </div>
        </div>
    )
}

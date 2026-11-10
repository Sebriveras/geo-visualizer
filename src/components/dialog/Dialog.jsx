import { useEffect, useRef } from 'preact/hooks'

// Carcasa de los diálogos modales: cubre el área bajo el encabezado de la app (h-12), como en el diseño.
// Escape o un clic fuera cancelan. El foco empieza en el elemento con data-autofocus o, si no hay, en el primer botón.
// headless: sin encabezado (el título solo queda como etiqueta accesible), p. ej. el selector de color.
// children: el cuerpo y los botones del diálogo.
export function Dialog ({ title, role = 'dialog', headless = false, width = 'w-104', onCancel, children }) {
    const dialogRef = useRef(null)
    const latest = useRef(onCancel)
    latest.current = onCancel

    useEffect(() => {
        const dialog = dialogRef.current
        const target = dialog.querySelector('[data-autofocus]') ?? dialog.querySelector('button')
        target.focus()
        if (target instanceof HTMLInputElement) target.select()
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
            <div ref={dialogRef} role={role} aria-modal="true" aria-label={title} class={`flex ${width} max-w-full flex-col items-center overflow-clip rounded-3xl bg-white shadow-[0_10px_15px_-3px_#0000001a,0_4px_6px_-4px_#0000001a]`}>
                {!headless && (
                    <div class="flex h-18 w-full shrink-0 items-center justify-center px-6">
                        <h2 class="min-w-px flex-1 text-center text-2xl font-semibold text-slate-700">{title}</h2>
                    </div>
                )}

                {children}
            </div>
        </div>
    )
}

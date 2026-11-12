import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks'

const GAP = 4
const MARGIN = 8
// Espera con el cursor encima antes de mostrarlo; con el teclado aparece al instante
const HOVER_DELAY = 400

// Tooltip blanco bajo el elemento (o encima si no cabe), centrado y siempre dentro de la pantalla. Envuelve al elemento:
// aparece tras HOVER_DELAY con el cursor encima, o de inmediato al llegar con el teclado, y se oculta al salir, al pulsar,
// con Escape (que además sigue funcionando para lo demás), al hacer scroll o cambiar el tamaño de la ventana.
// Reemplaza al atributo `title` nativo: el elemento no debe llevar uno.
export function Tooltip ({ label, class: className = '', children }) {
    const wrapRef = useRef(null)
    const tipRef = useRef(null)
    const timer = useRef(null)
    const [open, setOpen] = useState(false)
    const [position, setPosition] = useState(null)

    const show = (delay) => {
        clearTimeout(timer.current)
        timer.current = setTimeout(() => setOpen(true), delay)
    }
    const hide = () => {
        clearTimeout(timer.current)
        setOpen(false)
        setPosition(null)
    }

    useEffect(() => () => clearTimeout(timer.current), [])

    useLayoutEffect(() => {
        if (!open) return
        const anchor = wrapRef.current.getBoundingClientRect()
        const tip = tipRef.current.getBoundingClientRect()
        const left = Math.min(Math.max(anchor.left + anchor.width / 2 - tip.width / 2, MARGIN), window.innerWidth - tip.width - MARGIN)
        const below = anchor.bottom + GAP
        const top = below + tip.height <= window.innerHeight - MARGIN ? below : anchor.top - GAP - tip.height
        setPosition({ left, top })
    }, [open, label])

    useEffect(() => {
        if (!open) return
        const onKeyDown = (event) => event.key === 'Escape' && hide()
        window.addEventListener('keydown', onKeyDown, true)
        window.addEventListener('scroll', hide, true)
        window.addEventListener('resize', hide)
        return () => {
            window.removeEventListener('keydown', onKeyDown, true)
            window.removeEventListener('scroll', hide, true)
            window.removeEventListener('resize', hide)
        }
    }, [open])

    return (
        <span
            ref={wrapRef}
            class={`inline-flex ${className}`}
            onMouseEnter={() => show(HOVER_DELAY)}
            onMouseLeave={hide}
            onMouseDown={hide}
            onFocusIn={(event) => event.target.matches?.(':focus-visible') && show(0)}
            onFocusOut={hide}
        >
            {children}

            {open && (
                <span
                    ref={tipRef}
                    role="tooltip"
                    style={{ position: 'fixed', ...position, visibility: position ? 'visible' : 'hidden' }}
                    class="pointer-events-none z-30 whitespace-nowrap rounded-sm bg-white px-2 py-1 text-xs text-slate-700 drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
                >
                    {label}
                </span>
            )}
        </span>
    )
}

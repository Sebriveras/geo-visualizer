import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks'
import { Check, X } from 'lucide-preact'
import { GhostButton } from '../buttons/GhostButton'
import { parseCoordinates } from '../map_panel/coordinates'

const OFFSET = 8
const MARGIN = 8

// Tarjeta para escribir las coordenadas de un punto, donde se hizo clic derecho en el mapa (x, y en píxeles del mapa).
// Enter o la palomita confirman con onAccept({ lat, lng }); la ✕, Escape o un clic fuera la cierran con onClose.
export function CoordinatePopover ({ x, y, onAccept, onClose }) {
    const cardRef = useRef(null)
    const rootRef = useRef(null)
    const inputRef = useRef(null)
    const focused = useRef(false)
    const [text, setText] = useState('')
    const [error, setError] = useState(false)
    const [position, setPosition] = useState(null)

    // Junto al clic, sin salirse del mapa
    useLayoutEffect(() => {
        const card = cardRef.current.getBoundingClientRect()
        const area = cardRef.current.offsetParent.getBoundingClientRect()
        setPosition({
            left: Math.max(MARGIN, Math.min(x + OFFSET, area.width - card.width - MARGIN)),
            top: Math.max(MARGIN, Math.min(y + OFFSET, area.height - card.height - MARGIN))
        })
    }, [x, y, error])

    // Con el campo ya visible (la tarjeta nace oculta hasta colocarse), el foco queda en él para poder pegar directamente
    useEffect(() => {
        if (!position || focused.current) return
        focused.current = true
        inputRef.current.focus()
    }, [position])

    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key !== 'Escape') return
            event.stopPropagation()
            onClose()
        }
        // Un clic fuera del mapa (paneles, barras) también la cierra
        const onMouseDown = (event) => {
            if (!rootRef.current.contains(event.target)) onClose()
        }
        window.addEventListener('keydown', onKeyDown, true)
        window.addEventListener('mousedown', onMouseDown, true)
        return () => {
            window.removeEventListener('keydown', onKeyDown, true)
            window.removeEventListener('mousedown', onMouseDown, true)
        }
    }, [onClose])

    const submit = (event) => {
        event.preventDefault()
        const coordinates = parseCoordinates(text)
        if (!coordinates) return setError(true)
        onAccept(coordinates)
    }

    return (
        // La capa transparente recoge los clics fuera de la tarjeta: cierran sin poner ningún punto
        <div ref={rootRef} class="absolute inset-0 z-20" onMouseDown={(event) => event.target === event.currentTarget && onClose()} onContextMenu={(event) => { event.preventDefault(); onClose() }}>
            <form
                ref={cardRef}
                role="dialog"
                aria-label="Crear punto con coordenadas"
                noValidate
                onSubmit={submit}
                style={{ left: `${position?.left ?? x}px`, top: `${position?.top ?? y}px`, visibility: position ? 'visible' : 'hidden' }}
                class="absolute flex w-72 max-w-full flex-col gap-1 rounded-lg bg-white p-2 shadow-[0_4px_6px_-1px_#0000001a,0_2px_4px_-2px_#0000001a]"
            >
                <div class="flex items-center gap-1">
                    <input
                        ref={inputRef}
                        type="text"
                        aria-label="Coordenadas"
                        aria-invalid={error}
                        placeholder="Escribe las coordenadas..."
                        value={text}
                        onInput={(event) => {
                            setText(event.currentTarget.value)
                            setError(false)
                        }}
                        class={`h-8 min-w-px flex-1 rounded-lg border bg-white px-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-2 focus:px-[9px] ${error ? 'border-[#e7000b] focus:border-[#e7000b]' : 'border-slate-300 focus:border-[#51a2ff]'}`}
                    />
                    <GhostButton size="xs" iconSize={14} leadingIcon={X} aria-label="Cancelar" title="Cancelar" onClick={onClose}>{null}</GhostButton>
                    <button type="submit" aria-label="Aceptar coordenadas" title="Aceptar" class="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-[#2c2039] text-white hover:bg-[#3b2c4d]">
                        <Check size={16} />
                    </button>
                </div>
                {error && <p class="px-0.5 text-xs text-[#e7000b]">Ingresa coordenadas válidas</p>}
            </form>
        </div>
    )
}

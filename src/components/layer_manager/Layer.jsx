import { ChevronDown, ChevronRight, EllipsisVertical, GripVertical } from 'lucide-preact'
import { LayerCheckbox } from './LayerCheckbox'

// Para arrastrar: rowRef/gripRef los entrega useDraggable (el agarre es el grip), `dragging` marca la fila
// de origen (queda como hueco), `overlay` es la copia que sigue al cursor y `indicator` el destino del soltado:
// { edge: 'top' | 'bottom', level } = línea entre filas · { inside: true } = dentro de esta carpeta
export function Layer ({ id, name = 'Layer', count = '##', level = 0, active = false, checked = false, onCheckedChange, icon: Icon, expanded, onToggle, onClick, menuOpen = false, onMenu, rowRef, gripRef, dragging = false, overlay = false, indicator }) {
    const background = overlay ? (active ? 'bg-blue-50 opacity-80' : 'bg-slate-200 opacity-80') : dragging ? 'bg-white' : indicator?.inside ? 'bg-blue-100 ring-1 ring-inset ring-[#51a2ff]' : active ? 'bg-blue-100' : 'hover:bg-slate-100'

    return (
        <div
            ref={rowRef}
            data-layer-id={id}
            role="button"
            tabIndex={overlay ? -1 : 0}
            aria-pressed={active}
            onClick={onClick}
            onKeyDown={(event) => {
                if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault()
                    onClick()
                }
            }}
            class={`group relative flex h-7 w-full cursor-pointer items-center gap-1 py-1 pl-2 pr-3 ${background} ${dragging ? '*:invisible' : ''} ${overlay ? 'pointer-events-none' : ''}`}
        >
            <span
                ref={gripRef}
                onClick={(event) => event.stopPropagation()}
                class={`flex size-3 shrink-0 touch-none items-center justify-center text-slate-500 ${gripRef ? 'cursor-grab' : ''} ${overlay ? '' : 'opacity-0 group-hover:opacity-100'}`}
            >
                <GripVertical size={12} />
            </span>

            {Array.from({ length: level }, (_, index) => (
                <span key={index} class="size-3 shrink-0" />
            ))}

            {expanded === undefined ? (
                <span class="size-3 shrink-0" />
            ) : (
                <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={(event) => {
                        event.stopPropagation()
                        onToggle()
                    }}
                    class="-mx-1 flex size-5 shrink-0 cursor-pointer items-center justify-center text-slate-500"
                >
                    {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </button>
            )}

            <LayerCheckbox checked={checked} onChange={onCheckedChange} />

            <div class="flex min-w-px flex-1 items-center gap-1">
                {Icon && <Icon size={14} class="shrink-0 text-slate-500" />}
                <p class="min-w-px flex-1 truncate text-sm text-slate-700">{name}</p>
            </div>

            <span class="shrink-0 text-base text-slate-400">{count}</span>

            <button
                type="button"
                aria-label="Más opciones"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                data-menu-trigger
                onClick={(event) => {
                    event.stopPropagation()
                    onMenu(event.currentTarget)
                }}
                class={`-mx-1 flex size-5 shrink-0 cursor-pointer items-center justify-center text-slate-700 focus-visible:opacity-100 group-hover:opacity-100 ${menuOpen || overlay ? 'opacity-100' : 'opacity-0'}`}
            >
                <EllipsisVertical size={12} />
            </button>

            {indicator?.edge && (
                <span
                    class={`pointer-events-none absolute right-0 z-10 h-0.5 bg-[#51a2ff] ${indicator.edge === 'top' ? '-top-px' : '-bottom-px'}`}
                    style={{ left: `${indicator.level * 12}px` }}
                />
            )}
        </div>
    )
}

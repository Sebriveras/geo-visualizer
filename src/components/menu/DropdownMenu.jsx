import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks'

const GAP = 4
const MARGIN = 8

// Se ancla bajo `anchor` alineado a su borde derecho (o encima si no cabe). Usa posición fija para
// no quedar recortado por paneles con overflow. Cierra con clic fuera, Escape, scroll o resize.
// Los disparadores marcados con data-menu-trigger gestionan su propio toggle.
export function DropdownMenu ({ anchor, onClose, class: className = '', style, children, ...props }) {
    const menuRef = useRef(null)
    const [position, setPosition] = useState(null)

    useLayoutEffect(() => {
        const trigger = anchor.getBoundingClientRect()
        const menu = menuRef.current.getBoundingClientRect()
        const below = trigger.bottom + GAP
        const left = Math.min(Math.max(trigger.right - menu.width, MARGIN), window.innerWidth - menu.width - MARGIN)
        const top = below + menu.height <= window.innerHeight - MARGIN ? below : trigger.top - GAP - menu.height

        setPosition({ left: `${left}px`, top: `${top}px` })
    }, [anchor])

    useEffect(() => {
        const onPointerDown = (event) => {
            if (!menuRef.current.contains(event.target) && !event.target.closest('[data-menu-trigger]')) onClose()
        }
        const onKeyDown = (event) => {
            if (event.key === 'Escape') onClose()
        }
        document.addEventListener('mousedown', onPointerDown)
        document.addEventListener('keydown', onKeyDown)
        window.addEventListener('resize', onClose)
        window.addEventListener('scroll', onClose, true)
        return () => {
            window.removeEventListener('resize', onClose)
            window.removeEventListener('scroll', onClose, true)
            document.removeEventListener('mousedown', onPointerDown)
            document.removeEventListener('keydown', onKeyDown)
        }
    }, [onClose])

    return (
        <div
            ref={menuRef}
            role="menu"
            style={{ position: 'fixed', ...position, visibility: position ? 'visible' : 'hidden', ...style }}
            class={`z-20 flex w-50 flex-col gap-1 rounded-xl border border-slate-300 bg-white p-3 shadow-[0_1px_1.5px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.1)] ${className}`}
            {...props}
        >
            {children}
        </div>
    )
}

export function MenuItem ({ icon: Icon, trailingIcon: TrailingIcon, tone = 'primary', onClick, children, ...props }) {
    return (
        <button
            type="button"
            role="menuitem"
            onClick={onClick}
            class={`flex h-9 w-full shrink-0 cursor-pointer items-center gap-2 rounded-lg px-2 text-base enabled:hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 ${tone === 'danger' ? 'text-[#e7000b]' : 'text-slate-700'}`}
            {...props}
        >
            {Icon && <Icon size={16} class="shrink-0" />}
            <span class="min-w-px flex-1 truncate text-left leading-normal">{children}</span>
            {TrailingIcon && <TrailingIcon size={16} class="shrink-0" />}
        </button>
    )
}

export function MenuDivider () {
    return (
        <div role="separator" class="flex h-9 w-full shrink-0 items-center px-3">
            <div class="h-px min-w-px flex-1 bg-slate-300" />
        </div>
    )
}

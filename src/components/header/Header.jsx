import { useState } from 'preact/hooks'
import { Bell, ChevronDown, CircleHelp, Leaf, MapPin, PanelLeft, Settings, Shapes } from 'lucide-preact'
import { GhostButton } from '../buttons/GhostButton'
import { DropdownMenu, MenuItem } from '../menu/DropdownMenu'
import UnergyIcon from '../../assets/UnergyIcon'

function IconButton ({ label, icon, ...props }) {
    return (
        <GhostButton size="xs" iconSize={14} leadingIcon={icon} aria-label={label} title={label} {...props}>
            {null}
        </GhostButton>
    )
}

// Solo visual por ahora: las opciones del menú no cargan nada, solo cambian el nombre del botón
const VIEWERS = [
    { id: 'tetris', label: 'Tetris', icon: Shapes },
    { id: 'abientadas', label: 'Abientadas', icon: Leaf }
]
const DEFAULT_VIEWER = 'Visualizador KMZ'

// menuHidden / onToggleMenu: estado del botón que oculta la barra lateral de iconos
export function Header({ menuHidden = false, onToggleMenu }){
    // Botón "Visualizador" que abrió el menú (null = cerrado) y la opción elegida
    const [anchor, setAnchor] = useState(null)
    const [viewer, setViewer] = useState(null)

    return(
        <header class="flex h-12 w-full shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-4">
            <div class="flex min-w-px flex-1 items-center gap-1">
                <UnergyIcon aria-label="Unergy" />
                <div class="flex h-4 w-6 shrink-0 items-center justify-center" aria-hidden="true">
                    <div class="h-full w-px bg-slate-200" />
                </div>
                <IconButton
                    label="Mostrar u ocultar menú"
                    icon={PanelLeft}
                    aria-pressed={!menuHidden}
                    onClick={onToggleMenu}
                />
            </div>

            <GhostButton
                size="sm"
                leadingIcon={MapPin}
                trailingIcon={ChevronDown}
                iconSize={16}
                class="min-w-45.75"
                aria-haspopup="menu"
                aria-expanded={Boolean(anchor)}
                data-menu-trigger
                onClick={(event) => setAnchor(anchor ? null : event.currentTarget)}
            >
                {viewer?.label ?? DEFAULT_VIEWER}
            </GhostButton>

            <div class="flex min-w-px flex-1 items-center justify-end gap-2">
                <IconButton label="Ayuda" icon={CircleHelp} />
                <IconButton label="Configuración" icon={Settings} />
                <IconButton label="Notificaciones" icon={Bell} showAlertDot />
                <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700" title="Usuario">AV</div>
            </div>

            {anchor && (
                <DropdownMenu anchor={anchor} onClose={() => setAnchor(null)} style={{ width: '208px' }}>
                    {VIEWERS.map((item) => (
                        <MenuItem
                            key={item.id}
                            icon={item.icon}
                            onClick={() => {
                                setViewer(item)
                                setAnchor(null)
                            }}
                        >
                            {item.label}
                        </MenuItem>
                    ))}
                </DropdownMenu>
            )}
        </header>
    )
}

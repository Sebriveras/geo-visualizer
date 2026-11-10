import { useState } from 'preact/hooks'
import { ChevronDown, CircleGauge, EllipsisVertical, History, MapPin, Minus, Mountain, Ruler, Spline, VectorSquare } from 'lucide-preact'
import { GhostButton } from '../buttons/GhostButton'
import { DropdownMenu, MenuItem } from '../menu/DropdownMenu'
import { useLayers } from '../../context/LayersContext'

function Divider () {
    return (
        <div class="flex h-full w-4 shrink-0 justify-center">
            <div class="h-full w-px bg-slate-200" />
        </div>
    )
}

function IconButton ({ label, icon, trailingIcon, disabled = false, active = false, onClick, ...props }) {
    return (
        <GhostButton
            size="sm"
            iconSize={14}
            leadingIcon={icon}
            trailingIcon={trailingIcon}
            tone={active ? 'action' : 'primary'}
            aria-pressed={onClick ? active : undefined}
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            title={label}
            {...props}
        >
            {null}
        </GhostButton>
    )
}

export function MapActionPanel () {
    const { activeTool, measure, startShape, startMeasure, toggleHistory } = useLayers()
    // Botón de medir que abrió el menú; null = cerrado
    const [measureAnchor, setMeasureAnchor] = useState(null)

    return (
        <div class="flex h-13 w-full items-center gap-2 bg-slate-50 p-2">
            <div class="flex h-full min-w-px flex-1 items-center gap-1">
                <IconButton label="Punto" icon={MapPin} active={activeTool === 'point'} onClick={() => startShape('point')} />
                <IconButton label="Línea" icon={Spline} active={activeTool === 'line'} onClick={() => startShape('line')} />
                <IconButton label="Polígono" icon={VectorSquare} active={activeTool === 'polygon'} onClick={() => startShape('polygon')} />
                <Divider />
                <IconButton
                    label="Medir"
                    icon={Ruler}
                    trailingIcon={ChevronDown}
                    active={activeTool === 'measure'}
                    aria-haspopup="menu"
                    aria-expanded={Boolean(measureAnchor)}
                    data-menu-trigger
                    onClick={(event) => {
                        if (activeTool === 'measure') return startMeasure(measure.type)
                        setMeasureAnchor(measureAnchor ? null : event.currentTarget)
                    }}
                />
                <IconButton label="Perfil de elevación" icon={Mountain} active={activeTool === 'profile'} onClick={() => startMeasure('profile')} />
                <IconButton label="Imágenes históricas" icon={History} active={activeTool === 'history'} onClick={toggleHistory} />
            </div>

            <IconButton label="Más opciones" icon={EllipsisVertical} />

            {measureAnchor && (
                <DropdownMenu anchor={measureAnchor} onClose={() => setMeasureAnchor(null)} style={{ width: '263px' }}>
                    <MenuItem icon={Minus} onClick={() => { setMeasureAnchor(null); startMeasure('line') }}>Medir línea</MenuItem>
                    <MenuItem icon={CircleGauge} onClick={() => { setMeasureAnchor(null); startMeasure('circle') }}>Medir circunferencia</MenuItem>
                </DropdownMenu>
            )}
        </div>
    )
}

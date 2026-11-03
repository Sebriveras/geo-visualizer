import { useState } from 'preact/hooks'
import { CircleGauge, EllipsisVertical, MapPin, Minus, Redo2, Ruler, Spline, Undo2, VectorSquare } from 'lucide-preact'
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

function IconButton ({ label, icon, disabled = false, active = false, onClick, ...props }) {
    return (
        <GhostButton
            size="sm"
            iconSize={14}
            leadingIcon={icon}
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
    const { activeTool, startShape, startMeasure } = useLayers()
    // Botón de medir que abrió el menú; null = cerrado
    const [measureAnchor, setMeasureAnchor] = useState(null)

    return (
        <div class="flex h-13 w-full items-center gap-2 bg-slate-50 p-2">
            <div class="flex h-full min-w-px flex-1 items-center gap-1">
                <IconButton label="Deshacer" icon={Undo2} disabled />
                <IconButton label="Rehacer" icon={Redo2} disabled />
                <Divider />
                <IconButton label="Punto" icon={MapPin} active={activeTool === 'point'} onClick={() => startShape('point')} />
                <IconButton label="Línea" icon={Spline} active={activeTool === 'line'} onClick={() => startShape('line')} />
                <IconButton label="Polígono" icon={VectorSquare} active={activeTool === 'polygon'} onClick={() => startShape('polygon')} />
                <Divider />
                <IconButton
                    label="Medir"
                    icon={Ruler}
                    active={activeTool === 'measure'}
                    aria-haspopup="menu"
                    aria-expanded={Boolean(measureAnchor)}
                    data-menu-trigger
                    onClick={(event) => {
                        if (activeTool === 'measure') return startMeasure('line')
                        setMeasureAnchor(measureAnchor ? null : event.currentTarget)
                    }}
                />
            </div>

            <IconButton label="Más opciones" icon={EllipsisVertical} />

            {measureAnchor && (
                <DropdownMenu anchor={measureAnchor} onClose={() => setMeasureAnchor(null)} style={{ width: '263px' }}>
                    <MenuItem icon={Minus} onClick={() => { setMeasureAnchor(null); startMeasure('line') }}>Medir línea</MenuItem>
                    <MenuItem icon={CircleGauge} disabled>Medir circunferencia</MenuItem>
                </DropdownMenu>
            )}
        </div>
    )
}

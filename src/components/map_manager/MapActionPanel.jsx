import { useState } from 'preact/hooks'
import { ChevronDown, CircleGauge, EllipsisVertical, History, MapPin, Minus, Mountain, Ruler, Search, Spline, Upload, VectorSquare } from 'lucide-preact'
import { GhostButton } from '../buttons/GhostButton'
import { Tooltip } from '../tooltip/Tooltip'
import { DropdownMenu, MenuItem } from '../menu/DropdownMenu'
import { useLayers } from '../../context/LayersContext'

function Divider () {
    return (
        <div class="flex h-full w-4 shrink-0 justify-center">
            <div class="h-full w-px bg-slate-200" />
        </div>
    )
}

// tooltip: texto de ayuda (por defecto, la etiqueta); `label` queda como nombre accesible del botón
function IconButton ({ label, tooltip = label, icon, trailingIcon, disabled = false, active = false, onClick, ...props }) {
    return (
        <Tooltip label={tooltip}>
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
                {...props}
            >
                {null}
            </GhostButton>
        </Tooltip>
    )
}

export function MapActionPanel () {
    const { activeTool, measure, startShape, startMeasure, toggleHistory } = useLayers()
    // Botón de medir que abrió el menú; null = cerrado
    const [measureAnchor, setMeasureAnchor] = useState(null)

    return (
        <div class="flex h-13 w-full items-center gap-2 bg-slate-50 p-2">
            <div class="flex h-full min-w-px flex-1 items-center gap-1">
                <IconButton label="Punto" tooltip="Crear punto" icon={MapPin} active={activeTool === 'point'} onClick={() => startShape('point')} />
                <IconButton label="Línea" tooltip="Crear línea" icon={Spline} active={activeTool === 'line'} onClick={() => startShape('line')} />
                <IconButton label="Polígono" tooltip="Crear polígono" icon={VectorSquare} active={activeTool === 'polygon'} onClick={() => startShape('polygon')} />
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

                {/* Solo visual por ahora: ni el campo ni el botón de cargar hacen nada */}
                <div class="flex min-w-px flex-1 items-center justify-end px-4">
                    <div class="flex h-8 w-90.25 min-w-0 max-w-full items-stretch">
                        <label class="flex min-w-0 flex-1 items-center gap-2 rounded-l-lg border border-slate-300 bg-white px-3 text-sm text-slate-400 focus-within:border-slate-600">
                            <Search size={14} class="shrink-0" />
                            <input type="text" aria-label="Buscar un terreno" placeholder="Busca un terreno..." class="min-w-px flex-1 bg-transparent leading-normal text-slate-700 outline-none placeholder:text-slate-400" />
                        </label>
                        <Tooltip label="Cargar">
                            <button type="button" aria-label="Cargar" class="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-r-lg border-y border-r border-slate-300 bg-white text-[#2c2039] hover:bg-[#00185614] active:bg-[#0018561f]">
                                <Upload size={16} />
                            </button>
                        </Tooltip>
                    </div>
                </div>
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

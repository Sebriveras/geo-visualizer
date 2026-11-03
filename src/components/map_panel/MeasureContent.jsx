import { Check, ChevronDown } from 'lucide-preact'
import { useState } from 'preact/hooks'
import { GhostButton } from '../buttons/GhostButton'
import { DropdownMenu, MenuItem } from '../menu/DropdownMenu'
import { useLayers } from '../../context/LayersContext'
import { Content } from './Content'

// factor: de la unidad base (m o m²) a la unidad; decimals: decimales a mostrar
export const LINE_LENGTH_UNITS = [
    { id: 'm', label: 'Metros', symbol: 'm', factor: 1, decimals: 0 },
    { id: 'km', label: 'Kilómetros', symbol: 'km', factor: 0.001, decimals: 2 },
    { id: 'mi', label: 'Millas', symbol: 'mi', factor: 0.000621371, decimals: 2 }
]

export const PERIMETER_UNITS = LINE_LENGTH_UNITS.map((unit) => ({ ...unit, decimals: 2 }))

export const AREA_UNITS = [
    { id: 'm2', label: 'Metros²', symbol: 'm²', factor: 1, decimals: 2 },
    { id: 'ha', label: 'Hectáreas', symbol: 'ha', factor: 0.0001, decimals: 2 },
    { id: 'km2', label: 'Kilómetros²', symbol: 'km²', factor: 0.000001, decimals: 4 }
]

function format (base, unit) {
    if (base == null) return '—'
    const value = (base * unit.factor).toLocaleString('en-US', {
        minimumFractionDigits: unit.decimals,
        maximumFractionDigits: unit.decimals
    })
    return `${value} ${unit.symbol}`
}

// Medida (longitud, área, perímetro) con un menú (mock) para cambiar la unidad
// kind: 'length' | 'area' | 'elevation' | 'coordinates' · value: en metros o metros cuadrados
// render(unit): texto a mostrar cuando el valor no es numérico (p. ej. coordenadas)
export function MeasureContent ({ name, kind, units, value, render }) {
    const { units: selected, setUnit } = useLayers()
    // Botón que abrió el menú; null = cerrado
    const [anchor, setAnchor] = useState(null)
    const unit = units.find((item) => item.id === selected[kind])

    return (
        <div class="relative w-full">
            <Content
                name={name}
                value={render ? render(unit) : format(value, unit)}
                trailing={
                    <GhostButton
                        size="xs"
                        leadingIcon={ChevronDown}
                        aria-label={`Cambiar unidad de ${name.toLowerCase()}`}
                        aria-expanded={Boolean(anchor)}
                        title="Cambiar unidad"
                        data-menu-trigger
                        onClick={(event) => setAnchor(anchor ? null : event.currentTarget)}
                    >
                        {null}
                    </GhostButton>
                }
            />

            {anchor && (
                <DropdownMenu anchor={anchor} onClose={() => setAnchor(null)}>
                    {units.map((item) => (
                        <MenuItem
                            key={item.id}
                            role="menuitemradio"
                            aria-checked={item.id === unit.id}
                            trailingIcon={item.id === unit.id ? Check : undefined}
                            onClick={() => {
                                setUnit(kind, item.id)
                                setAnchor(null)
                            }}
                        >
                            {item.symbol ? `${item.label} (${item.symbol})` : item.label}
                        </MenuItem>
                    ))}
                </DropdownMenu>
            )}
        </div>
    )
}

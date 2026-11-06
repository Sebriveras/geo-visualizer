import { Picker } from './Picker'

// Distancia del buffer (zona de influencia) alrededor de una línea, en metros
const DISTANCES = [10, 12, 30]

export const DEFAULT_BUFFER = DISTANCES[0]
export const MIN_BUFFER = 1
export const MAX_BUFFER = 50
// El buffer se rellena con el color de la línea con esta opacidad fija (no se puede cambiar)
export const DEFAULT_BUFFER_OPACITY = 0.3

// "25", "25.5" o "25,5" → metros; null si no está entre MIN_BUFFER y MAX_BUFFER con un decimal como máximo
function parse (text) {
    const match = /^(\d{1,2}(?:[.,]\d)?)\s*(?:m|mt|mts)?$/i.exec(text.trim())
    if (!match) return null
    const value = Number(match[1].replace(',', '.'))
    return value >= MIN_BUFFER && value <= MAX_BUFFER ? value : null
}

export function BufferPicker ({ value = DEFAULT_BUFFER, onChange }) {
    return (
        <Picker
            label="Buffer"
            options={DISTANCES.map((distance) => ({ value: distance, text: `${distance} m` }))}
            value={value}
            defaultValue={DEFAULT_BUFFER}
            onChange={onChange}
            customLabel={`${value} m`}
            dialog={{ title: 'Buffer', label: 'Distancia del buffer', placeholder: 'Ingresa la distancia en metros...', parse, format: (current) => String(current) }}
        />
    )
}

import { ColorDialog } from '../dialog/ColorDialog'
import { Picker } from './Picker'

export const COLORS = [
    { value: '#FF557F', label: 'Rosa' },
    { value: '#FFAA00', label: 'Naranja' },
    { value: '#AA00FF', label: 'Morado' },
    { value: '#00557F', label: 'Azul oscuro' },
    { value: '#000000', label: 'Negro' }
]

export const DEFAULT_COLOR = COLORS[0].value

const dot = (color) => <span class="size-5.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />

// "#f80", "f80" o "#ff8800" → "#FF8800"; null si no es un código HEX de 3 o 6 dígitos
function parse (text) {
    const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text.trim())
    if (!match) return null
    const hex = match[1].length === 3 ? [...match[1]].map((digit) => digit + digit).join('') : match[1]
    return `#${hex.toUpperCase()}`
}

// Selector de color para líneas y polígonos
export function ColorPicker ({ label = 'Colores', value = DEFAULT_COLOR, onChange }) {
    return (
        <Picker
            label={label}
            options={COLORS.map((color) => ({ value: color.value, label: color.label, swatch: dot(color.value) }))}
            value={value}
            defaultValue={DEFAULT_COLOR}
            onChange={onChange}
            customSwatch={dot}
            dialog={{ title: 'Color', label: 'Codigo HEX', placeholder: 'Ingresa el código HEX...', parse, format: (current) => current, component: ColorDialog }}
        />
    )
}

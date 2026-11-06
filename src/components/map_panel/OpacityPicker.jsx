import { OpacityDialog } from '../dialog/OpacityDialog'
import { Picker } from './Picker'

// Opacidad del relleno de los polígonos, como fracción (0.05 = 5 %)
const OPACITIES = [0.05, 0.2, 0.3]

export const DEFAULT_OPACITY = OPACITIES[0]

const percent = (value) => +(value * 100).toFixed(1)

// Muestra del relleno: el color de la forma con esa opacidad
const circle = (color) => (value) => <span class="size-5.5 shrink-0 rounded-full" style={{ backgroundColor: color, opacity: value }} />

// "45", "45%" o "45,5" → fracción; null si no es un porcentaje entre 0 y 100 con un decimal como máximo
function parse (text) {
    const match = /^(\d{1,3}(?:[.,]\d)?)\s*%?$/.exec(text.trim())
    if (!match) return null
    const value = Number(match[1].replace(',', '.'))
    return value >= 0 && value <= 100 ? Number((value / 100).toFixed(4)) : null
}

// color: el de la forma, para que las muestras se vean como quedará el relleno
export function OpacityPicker ({ value = DEFAULT_OPACITY, color = '#000000', onChange }) {
    const swatch = circle(color)

    return (
        <Picker
            label="Opacidad"
            options={OPACITIES.map((opacity) => ({ value: opacity, text: `${percent(opacity)}%`, swatch: swatch(opacity) }))}
            value={value}
            defaultValue={DEFAULT_OPACITY}
            onChange={onChange}
            customLabel={`${percent(value)}%`}
            customSwatch={swatch}
            dialog={{ title: 'Opacidad', label: 'Valor opacidad', placeholder: 'Ingresa valor de opacidad...', parse, format: (current) => String(percent(current)), component: OpacityDialog, props: { color } }}
        />
    )
}

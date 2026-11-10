import { ValueDialog } from '../dialog/ValueDialog'
import { Picker } from './Picker'

// Grosor del trazo de líneas y polígonos (px)
const WIDTHS = [1, 2, 3]

export const DEFAULT_WIDTH = WIDTHS[0]
export const MIN_WIDTH = 0.5
export const MAX_WIDTH = 4

// Vista previa del diálogo: una línea a todo el ancho con el grosor elegido
const line = (value) => <span class="w-full bg-slate-800" style={{ height: `${value}px` }} />

const bar = (value) => <span class="w-4.5 shrink-0 rounded-full bg-slate-800" style={{ height: `${value}px` }} />

// "2", "2.5" o "2,5" → número; null si no está entre MIN_WIDTH y MAX_WIDTH con un decimal como máximo
function parse (text) {
    const match = /^(\d{1,2}(?:[.,]\d)?)$/.exec(text.trim())
    if (!match) return null
    const value = Number(match[1].replace(',', '.'))
    return value >= MIN_WIDTH && value <= MAX_WIDTH ? value : null
}

export function WidthPicker ({ value = DEFAULT_WIDTH, onChange }) {
    return (
        <Picker
            label="Grosor de línea"
            options={WIDTHS.map((width) => ({ value: width, text: width.toFixed(1), swatch: bar(width) }))}
            value={value}
            defaultValue={DEFAULT_WIDTH}
            onChange={onChange}
            customLabel={value.toFixed(1)}
            customSwatch={bar}
            dialog={{ title: 'Grosor de línea', label: 'Grosor de línea', placeholder: 'Ingresa el grosor de línea...', parse, format: (current) => String(current), prefill: true, component: ValueDialog, props: { preview: line } }}
        />
    )
}

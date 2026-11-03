export const COLORS = [
    { value: '#51a2ff', label: 'Azul' },
    { value: '#ffb900', label: 'Amarillo' },
    { value: '#fb2c36', label: 'Rojo' },
    { value: '#ff8904', label: 'Naranja' },
    { value: '#c27aff', label: 'Morado' },
    { value: '#00d3f3', label: 'Cian' },
    { value: '#ed6aff', label: 'Rosa' }
]

export const DEFAULT_COLOR = COLORS[0].value

// Selector de color para líneas (y más adelante polígonos)
export function ColorPicker ({ label = 'Colores', value = DEFAULT_COLOR, onChange }) {
    return (
        <div class="flex flex-col gap-2">
            <p class="text-sm font-semibold text-slate-700">{label}</p>

            <div role="radiogroup" aria-label={label} class="flex items-start gap-1.5 rounded-lg bg-slate-50 p-1">
                {COLORS.map((color) => {
                    const selected = color.value === value

                    return (
                        <button
                            key={color.value}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            aria-label={color.label}
                            title={color.label}
                            onClick={() => onChange(color.value)}
                            class={`flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md border-[1.5px] ${selected ? 'border-[#7c33dc] bg-[#f3e8ff]' : 'border-transparent hover:bg-slate-100'}`}
                        >
                            <span class="size-5.5 rounded-full" style={{ backgroundColor: color.value }} />
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

import { useState } from 'preact/hooks'
import { Palette, X } from 'lucide-preact'
import { GhostButton } from '../buttons/GhostButton'
import { ValueDialog } from '../dialog/ValueDialog'

const ITEM_CLASS = 'flex h-8 min-w-px flex-1 items-center justify-center gap-1.5 overflow-clip rounded-md border-[1.5px] px-2 text-sm text-slate-700'
const SELECTED_CLASS = 'border-[#7c33dc] bg-[#f3e8ff]'

// Selector de valores predefinidos con la opción de ingresar uno personalizado (botón de la paleta).
// options: [{ value, label?, text?, swatch }] · defaultValue: la opción a la que vuelve la ✕ del valor personalizado
// customLabel(value): texto del valor personalizado · customSwatch(value): su muestra
// dialog: { title, label, placeholder, parse, format, prefill?, component?, props? } (props: extras para el componente del diálogo;
// prefill: el campo del diálogo arranca con el valor vigente aunque sea uno predefinido, no solo con uno personalizado)
export function Picker ({ label, options, value, defaultValue, onChange, customLabel = '', customSwatch, dialog }) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const isCustom = !options.some((option) => option.value === value)
    // Cada picker puede traer su propio diálogo (el de color tiene selector visual); por defecto, un campo de texto
    const DialogComponent = dialog.component ?? ValueDialog

    return (
        <div class="flex w-full flex-col gap-1">
            <div class="flex items-center justify-between">
                <p class="text-sm font-semibold text-slate-700">{label}</p>
                <GhostButton
                    size="xs"
                    leadingIcon={Palette}
                    iconSize={14}
                    aria-label={`Valor personalizado de ${label.toLowerCase()}`}
                    title="Valor personalizado"
                    onClick={() => setDialogOpen(true)}
                >
                    {null}
                </GhostButton>
            </div>

            {isCustom ? (
                <div class="flex items-center gap-1 rounded-lg bg-slate-50 p-1">
                    <div class={`${ITEM_CLASS} ${SELECTED_CLASS}`}>
                        {customSwatch?.(value)}
                        <span class="truncate">{[customLabel, '(Personalizado)'].filter(Boolean).join(' ')}</span>
                    </div>
                    <GhostButton size="xs" leadingIcon={X} iconSize={14} aria-label={`Quitar valor personalizado de ${label.toLowerCase()}`} title="Quitar valor personalizado" onClick={() => onChange(defaultValue)}>
                        {null}
                    </GhostButton>
                </div>
            ) : (
                <div role="radiogroup" aria-label={label} class="flex items-start gap-1.5 rounded-lg bg-slate-50 p-1">
                    {options.map((option) => {
                        const selected = option.value === value

                        return (
                            <button
                                key={option.value}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                aria-label={option.label ?? option.text}
                                title={option.label ?? option.text}
                                onClick={() => onChange(option.value)}
                                class={`${ITEM_CLASS} cursor-pointer ${selected ? SELECTED_CLASS : 'border-transparent hover:bg-slate-100'}`}
                            >
                                {option.swatch}
                                {option.text}
                            </button>
                        )
                    })}
                </div>
            )}

            {dialogOpen && (
                <DialogComponent
                    title={dialog.title}
                    label={dialog.label}
                    placeholder={dialog.placeholder}
                    initial={isCustom || dialog.prefill ? dialog.format(value) : ''}
                    current={value}
                    {...dialog.props}
                    parse={dialog.parse}
                    onCancel={() => setDialogOpen(false)}
                    onAccept={(next) => {
                        onChange(next)
                        setDialogOpen(false)
                    }}
                />
            )}
        </div>
    )
}

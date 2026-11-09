import { useId, useState } from 'preact/hooks'
import { ChevronDown } from 'lucide-preact'
import { DropdownMenu, MenuItem } from '../menu/DropdownMenu'

// Desplegable de selección única con el mismo formato que TextField.
// options: [{ value, label }]. onChange recibe el value elegido.
export function SelectField ({ label, required = false, placeholder = 'Selecciona una opción', options, value, onChange, class: className = '', ...props }) {
    const id = useId()
    const [anchor, setAnchor] = useState(null)
    const selected = options.find((option) => option.value === value)

    return (
        <div class={`flex w-full flex-col gap-1 ${className}`}>
            {label && (
                <span id={`${id}-label`} class="flex items-center gap-0.5 text-sm font-semibold text-slate-700">
                    {label}
                    {required && <span class="text-[#c10007]">*</span>}
                </span>
            )}

            <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={Boolean(anchor)}
                aria-labelledby={label ? `${id}-label` : undefined}
                data-menu-trigger
                onClick={(event) => setAnchor(anchor ? null : event.currentTarget)}
                class="flex h-10 w-full cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-base hover:bg-slate-100 focus-visible:border-2 focus-visible:border-slate-600 focus-visible:px-[11px] focus-visible:outline-none"
                {...props}
            >
                <span class={`min-w-px flex-1 truncate text-left leading-normal ${selected ? 'text-slate-700' : 'text-slate-400'}`}>{selected ? selected.label : placeholder}</span>
                <ChevronDown size={16} class="shrink-0 text-slate-700" />
            </button>

            {anchor && (
                <DropdownMenu anchor={anchor} onClose={() => setAnchor(null)} role="listbox" class="max-h-60 overflow-y-auto" style={{ width: `${anchor.offsetWidth}px` }}>
                    {options.map((option) => (
                        <MenuItem
                            key={option.value}
                            role="option"
                            aria-selected={option.value === value}
                            onClick={() => {
                                setAnchor(null)
                                onChange(option.value)
                            }}
                        >
                            {option.label}
                        </MenuItem>
                    ))}
                </DropdownMenu>
            )}
        </div>
    )
}

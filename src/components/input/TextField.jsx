import { useId } from 'preact/hooks'

// Campo de texto de una línea; mismo formato que TextArea. supportingText se muestra en rojo cuando hay error.
export function TextField ({ label, required = false, supportingText, error = false, disabled = false, id, class: className = '', ...props }) {
    const generatedId = useId()
    const fieldId = id ?? generatedId

    return (
        <div class={`flex w-full flex-col gap-1 ${className}`}>
            {label && (
                <label for={fieldId} class="flex items-center gap-0.5 text-sm font-semibold text-slate-700">
                    {label}
                    {required && <span class="text-[#c10007]">*</span>}
                </label>
            )}

            <input
                id={fieldId}
                disabled={disabled}
                aria-invalid={error}
                class={`h-10 w-full rounded-lg border bg-white px-3 text-base text-slate-700 outline-none placeholder:text-slate-400 enabled:hover:bg-slate-100 focus:border-2 focus:bg-slate-100 focus:px-[11px] disabled:border-slate-400 disabled:bg-slate-100 disabled:text-slate-400 ${error ? 'border-[#e7000b] focus:border-[#e7000b]' : 'border-slate-300 focus:border-slate-600'}`}
                {...props}
            />

            {supportingText && (
                <p class={`text-xs ${error && !disabled ? 'text-[#e7000b]' : 'text-slate-400'}`}>{supportingText}</p>
            )}
        </div>
    )
}

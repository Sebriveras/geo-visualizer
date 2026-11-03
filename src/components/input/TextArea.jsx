import { Info } from 'lucide-preact'
import { useEffect, useId, useRef } from 'preact/hooks'

const SIZES = {
    md: 'text-base leading-normal',
    sm: 'text-sm',
    xs: 'text-xs',
}

export function TextArea ({ label, required = false, showMoreInfo = false, supportingText, error = false, size = 'md', disabled = false, autoFocus = false, id, class: className = '', ...props }) {
    const generatedId = useId()
    const textareaRef = useRef(null)
    const fieldId = id ?? generatedId

    useEffect(() => {
        if (autoFocus) {
            const textarea = textareaRef.current
            textarea.focus()
            textarea.setSelectionRange(textarea.value.length, textarea.value.length)
        }
    }, [])

    return (
        <div class={`flex w-full flex-col gap-1 ${className}`}>
            {label && (
                <label for={fieldId} class="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                    <span class="flex items-center gap-0.5">
                        {label}
                        {required && <span class="text-[#c10007]">*</span>}
                    </span>
                    {showMoreInfo && <Info size={14} class="shrink-0 text-slate-400" />}
                </label>
            )}

            <textarea
                ref={textareaRef}
                id={fieldId}
                disabled={disabled}
                aria-invalid={error}
                class={`min-h-18 w-full resize-none rounded-lg border bg-white p-3 text-slate-700 outline-none placeholder:text-slate-400 enabled:hover:bg-slate-100 focus:border-2 focus:bg-slate-100 focus:p-[11px] disabled:border-slate-400 disabled:bg-slate-100 disabled:text-slate-400 ${error ? 'border-[#e7000b] focus:border-[#e7000b]' : 'border-slate-300 focus:border-slate-600'} ${SIZES[size]}`}
                {...props}
            />

            {supportingText && (
                <p class={`text-xs ${error && !disabled ? 'text-[#e7000b]' : 'text-slate-400'}`}>{supportingText}</p>
            )}
        </div>
    )
}

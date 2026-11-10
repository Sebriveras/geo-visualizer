import { Search, X } from 'lucide-preact'

// Campo de búsqueda compacto (24 px) con lupa y una ✕ para limpiar cuando hay texto; Escape también limpia
export function SearchField ({ value, onInput, placeholder = 'Buscar', label = placeholder, class: className = '' }) {
    return (
        <div class={`flex h-6 w-full items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2 text-xs text-slate-700 focus-within:border-slate-600 ${className}`}>
            <Search size={12} class="shrink-0 text-slate-500" />
            <input
                type="text"
                role="searchbox"
                aria-label={label}
                value={value}
                placeholder={placeholder}
                onInput={(event) => onInput(event.currentTarget.value)}
                onKeyDown={(event) => {
                    if (event.key !== 'Escape' || value === '') return
                    event.stopPropagation()
                    onInput('')
                }}
                class="min-w-px flex-1 bg-transparent outline-none placeholder:text-slate-400"
            />
            {value !== '' && (
                <button type="button" aria-label="Limpiar búsqueda" title="Limpiar búsqueda" onClick={() => onInput('')} class="-mr-1 flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-sm text-slate-500 hover:text-slate-700">
                    <X size={12} />
                </button>
            )}
        </div>
    )
}

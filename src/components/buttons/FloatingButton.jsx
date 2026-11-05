// Botón circular flotante de solo icono (44 px). Estados del diseño: enabled, hover, pressed y disabled
// La capa translúcida de hover/pressed va sobre el fondo blanco, como en el diseño
export function FloatingButton ({ icon: Icon, iconSize = 18, disabled = false, type = 'button', class: className = '', ...props }) {
    return (
        <button
            type={type}
            disabled={disabled}
            class={`group relative flex size-11 min-h-11 min-w-11 shrink-0 items-center justify-center overflow-clip rounded-full p-0 ${disabled ? 'bg-slate-100 text-[#90a1b9] shadow-[0_20px_25px_-5px_#0000001a,0_8px_10px_-6px_#0000001a]' : 'cursor-pointer bg-white text-[#2c2039] shadow-[0_25px_50px_-12px_#00000040] hover:shadow-[0_20px_25px_-5px_#0000001a,0_8px_10px_-6px_#0000001a] active:shadow-[0_20px_25px_-5px_#0000001a,0_8px_10px_-6px_#0000001a]'} ${className}`}
            {...props}
        >
            {!disabled && <span class="pointer-events-none absolute inset-0 group-hover:bg-[#d3dfff0d] group-active:bg-[#d3dfff14]" />}
            {Icon && <Icon size={iconSize} class="relative shrink-0" />}
        </button>
    )
}

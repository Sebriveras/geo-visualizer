import { BUTTON_SIZES } from './buttonSizes'

export function OutlineButton ({ children = 'Action', size = 'md', leadingIcon: LeadingIcon, trailingIcon: TrailingIcon, iconSize = 16, disabled = false, type = 'button', class: className = '', ...props }) {
    return (
        <button
            type={type}
            disabled={disabled}
            class={`relative inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-slate-300 bg-white font-semibold enabled:cursor-pointer enabled:text-[#2c2039] enabled:hover:bg-[#00185614] enabled:active:bg-[#0018561f] disabled:text-[#90a1b9] ${BUTTON_SIZES[size]} ${className}`}
            {...props}
        >
            {LeadingIcon && <LeadingIcon size={iconSize} class="shrink-0" />}
            {children}
            {TrailingIcon && <TrailingIcon size={iconSize} class="shrink-0" />}
        </button>
    )
}

import { BUTTON_SIZES } from './buttonSizes'

const TONES = {
    primary: 'text-[#2c2039]',
    action: 'text-[#1447e6]',
    danger: 'text-[#c10007]',
}

export function GhostButton ({ children = 'Action', tone = 'primary', size = 'md', leadingIcon: LeadingIcon, trailingIcon: TrailingIcon, iconSize = 16, showAlertDot = false, disabled = false, type = 'button', class: className = '', ...props }) {
    return (
        <button
            type={type}
            disabled={disabled}
            class={`relative inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg font-semibold enabled:cursor-pointer enabled:hover:bg-[#00185614] enabled:active:bg-[#0018561f] disabled:text-[#90a1b9] ${disabled ? '' : TONES[tone]} ${BUTTON_SIZES[size]} ${className}`}
            {...props}
        >
            {LeadingIcon && <LeadingIcon size={iconSize} class="shrink-0" />}
            {children}
            {TrailingIcon && <TrailingIcon size={iconSize} class="shrink-0" />}

            {showAlertDot && (
                <span class="absolute -right-0.75 -top-0.75 size-2.5 rounded-full border-2 border-white bg-[#e7000b]" />
            )}
        </button>
    )
}

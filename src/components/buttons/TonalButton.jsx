import { BUTTON_SIZES } from './buttonSizes'

const TONES = {
    primary: 'enabled:bg-[#2c2039]',
    action: 'enabled:bg-[#155dfc]',
    destructive: 'enabled:bg-[#e7000b]',
}

export function TonalButton ({ children = 'Action', tone = 'primary', size = 'md', leadingIcon: LeadingIcon, trailingIcon: TrailingIcon, iconSize = 16, showAlertDot = false, disabled = false, type = 'button', class: className = '', ...props }) {
    return (
        <button
            type={type}
            disabled={disabled}
            class={`relative inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg font-semibold after:pointer-events-none after:absolute after:inset-0 after:rounded-lg enabled:cursor-pointer enabled:text-white enabled:hover:after:bg-[#d3dfff14] enabled:active:after:bg-[#d3dfff1f] disabled:bg-[#f1f5f9] disabled:text-[#90a1b9] ${TONES[tone]} ${BUTTON_SIZES[size]} ${className}`}
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

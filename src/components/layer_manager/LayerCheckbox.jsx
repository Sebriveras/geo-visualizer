export function LayerCheckbox ({ checked = false, onChange }) {
    return (
        <button
            type="button"
            role="checkbox"
            aria-checked={checked}
            onClick={(event) => {
                event.stopPropagation()
                onChange(!checked)
            }}
            class={`flex size-3.5 shrink-0 cursor-pointer items-center justify-center overflow-clip rounded border ${checked ? 'border-transparent bg-blue-500' : 'border-slate-500 bg-slate-100'}`}
        >
            {checked && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="shrink-0">
                    <path d="M6.66771 11.1151L3.90937 8.35676L4.89088 7.37526L6.66771 9.15209L11.1112 4.70859L12.0927 5.69009L6.66771 11.1151Z" fill="white" />
                </svg>
            )}
        </button>
    )
}

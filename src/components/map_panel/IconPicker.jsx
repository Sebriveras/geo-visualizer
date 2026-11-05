import Entrance from '../../assets/Entrance'
import Pin from '../../assets/Pin'
import Pole from '../../assets/Pole'
import Tree from '../../assets/Tree'

export const ICONS = [
    { id: 'pin', label: 'Chincheta', component: Pin },
    { id: 'tree', label: 'Árbol', component: Tree },
    { id: 'entrance', label: 'Entrada', component: Entrance },
    { id: 'pole', label: 'Poste', component: Pole }
]

export const DEFAULT_ICON = ICONS[0].id

export const findIcon = (id) => ICONS.find((icon) => icon.id === id) ?? ICONS[0]

// Selector de icono para puntos; mismo formato que ColorPicker
export function IconPicker ({ label = 'Iconos', value = DEFAULT_ICON, onChange }) {
    return (
        <div class="flex flex-col gap-2">
            <p class="text-sm font-semibold text-slate-700">{label}</p>

            <div role="radiogroup" aria-label={label} class="flex items-start gap-1.5 rounded-lg bg-slate-50 p-1">
                {ICONS.map(({ id, label: iconLabel, component: Icon }) => {
                    const selected = id === value

                    return (
                        <button
                            key={id}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            aria-label={iconLabel}
                            title={iconLabel}
                            onClick={() => onChange(id)}
                            class={`flex size-10 shrink-0 cursor-pointer items-center justify-center overflow-clip rounded-md border-[1.5px] ${selected ? 'border-[#7c33dc] bg-[#f3e8ff]' : 'border-transparent hover:bg-slate-100'}`}
                        >
                            <Icon class="shrink-0" />
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

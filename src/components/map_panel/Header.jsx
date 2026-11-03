import { EllipsisVertical, X } from 'lucide-preact'
import { GhostButton } from '../buttons/GhostButton'
import { InputTitle } from './InputTitle'

// options = false oculta el botón "Más opciones" (p. ej. en las mediciones)
export function Header({ icon: Icon, name, editing = false, options = true, onNameInput, onClose }){
    return(
        <div class="flex h-16 w-full shrink-0 items-center gap-1 bg-white py-3 pl-4 pr-3">
            <div class="flex min-w-px flex-1 items-center gap-2">
                <Icon size={16} class="shrink-0 text-slate-700" />
                {editing ? (
                    <InputTitle
                        autoFocus
                        value={name}
                        onInput={(event) => onNameInput(event.currentTarget.value)}
                        aria-label="Título"
                        class="flex-1"
                    />
                ) : (
                    <p class="min-w-px flex-1 truncate rounded-sm border-[1.5px] border-transparent px-1 text-base font-semibold leading-normal text-slate-700">{name}</p>
                )}
            </div>

            {options && (
                <GhostButton leadingIcon={EllipsisVertical} disabled={editing} aria-label="Más opciones" title="Más opciones">
                    {null}
                </GhostButton>
            )}
            <GhostButton leadingIcon={X} onClick={onClose} aria-label="Cerrar" title="Cerrar">
                {null}
            </GhostButton>
        </div>
    )
}

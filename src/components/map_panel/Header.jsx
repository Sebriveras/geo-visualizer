import { EllipsisVertical, FolderInput, Trash2, Undo2, X } from 'lucide-preact'
import { useState } from 'preact/hooks'
import { GhostButton } from '../buttons/GhostButton'
import { InputTitle } from './InputTitle'
import { DropdownMenu, MenuDivider, MenuItem } from '../menu/DropdownMenu'
import { useLayerActions } from '../layer_manager/useLayerActions'

// options = false oculta el botón "Más opciones" (p. ej. en las mediciones)
// layer: la capa del panel; con ella "Más opciones" abre el menú Mover a carpeta / Borrar
// onUndo: si se pasa, "Deshacer" reemplaza a "Más opciones" (al crear o editar una forma); canUndo lo habilita
export function Header({ icon: Icon, name, layer, editing = false, options = true, onNameInput, onClose, onUndo, canUndo = false }){
    const [anchor, setAnchor] = useState(null)
    const { canMove, askMove, askDelete, dialogs } = useLayerActions()
    const act = (action) => {
        setAnchor(null)
        action(layer)
    }

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

            {onUndo && (
                <GhostButton leadingIcon={Undo2} disabled={!canUndo} onClick={onUndo} aria-label="Deshacer" title="Deshacer">
                    {null}
                </GhostButton>
            )}
            {options && !onUndo && (
                <GhostButton leadingIcon={EllipsisVertical} disabled={editing} aria-label="Más opciones" title="Más opciones" aria-haspopup="menu" aria-expanded={Boolean(anchor)} data-menu-trigger onClick={(event) => setAnchor(anchor ? null : event.currentTarget)}>
                    {null}
                </GhostButton>
            )}
            <GhostButton leadingIcon={X} onClick={onClose} aria-label="Cerrar" title="Cerrar">
                {null}
            </GhostButton>

            {anchor && layer && (
                <DropdownMenu anchor={anchor} onClose={() => setAnchor(null)}>
                    <MenuItem icon={FolderInput} disabled={!canMove(layer)} onClick={() => act(askMove)}>Mover a carpeta</MenuItem>
                    <MenuDivider/>
                    <MenuItem icon={Trash2} tone="danger" onClick={() => act(askDelete)}>Borrar</MenuItem>
                </DropdownMenu>
            )}
            {dialogs}
        </div>
    )
}

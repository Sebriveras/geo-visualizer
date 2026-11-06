import { useState } from 'preact/hooks'
import { Plus, Trash2 } from 'lucide-preact'
import { GhostButton } from '../buttons/GhostButton'
import { ConfirmDialog } from '../dialog/ConfirmDialog'
import { TextArea } from '../input/TextArea'

// Sección de edición: campo de observación (si está agregado), los selectores (children) y la fila de componentes
// que se agregan con botones. Cada componente agregado cambia su botón "+" por uno de eliminar, que pide confirmación.
// Vista: solo el texto de la observación (si existe).
//
// extraActions: componentes agregables además de la observación (imagen, buffer…), cada uno
//   { id, label, active, onAdd, onRemove, confirm?: { title, message } }
// confirm = null elimina sin advertencia (no se pierde nada).
export function Observation ({ editing = false, open = false, value = '', onOpen, onClose, onInput, extraActions = [], children }) {
    // Acción que se está por eliminar, a la espera de confirmación
    const [removing, setRemoving] = useState(null)

    if (editing) {
        const actions = [
            {
                id: 'observation',
                label: 'Observación',
                active: open,
                onAdd: onOpen,
                onRemove: onClose,
                // Una observación vacía se quita sin advertencia
                confirm: value.trim() ? { title: 'Eliminar observación', message: '¿Deseas eliminar la observación de esta capa?' } : null
            },
            ...extraActions.filter(Boolean)
        ]
        const remove = (action) => action.confirm ? setRemoving(action) : action.onRemove()

        return (
            <div class="flex w-full flex-col gap-2 overflow-clip border-b border-slate-200 p-3">
                {open && (
                    <TextArea
                        autoFocus
                        label="Observación"
                        value={value}
                        onInput={(event) => onInput(event.currentTarget.value)}
                    />
                )}

                {children}

                <div class="flex w-full flex-wrap items-center gap-1">
                    {actions.filter((action) => !action.active).map((action) => (
                        <GhostButton key={action.id} size="xs" leadingIcon={Plus} onClick={action.onAdd}>{action.label}</GhostButton>
                    ))}
                    {actions.filter((action) => action.active).map((action) => (
                        <GhostButton key={action.id} size="xs" tone="danger" leadingIcon={Trash2} onClick={() => remove(action)}>{action.label}</GhostButton>
                    ))}
                </div>

                {removing && (
                    <ConfirmDialog
                        title={removing.confirm.title}
                        message={removing.confirm.message}
                        onCancel={() => setRemoving(null)}
                        onConfirm={() => {
                            removing.onRemove()
                            setRemoving(null)
                        }}
                    />
                )}
            </div>
        )
    }

    if (!value) return null

    return (
        <div class="flex w-full px-4 py-3">
            <p class="min-w-px flex-1 whitespace-pre-wrap break-words text-sm text-slate-700">{value}</p>
        </div>
    )
}

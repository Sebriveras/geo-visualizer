import { OutlineButton } from '../buttons/OutlineButton'
import { TonalButton } from '../buttons/TonalButton'
import { Dialog } from './Dialog'

// Advertencia modal para acciones destructivas. El foco empieza en "Cancelar" para que Enter nunca confirme por accidente.
export function ConfirmDialog ({ title, message, confirmLabel = 'Eliminar', cancelLabel = 'Cancelar', onConfirm, onCancel }) {
    return (
        <Dialog title={title} role="alertdialog" onCancel={onCancel}>
            <div class="w-full px-6 py-3">
                <p class="break-words text-center text-base leading-normal text-slate-700">{message}</p>
            </div>

            <div class="flex w-full items-center gap-2 p-6">
                <OutlineButton class="flex-1" onClick={onCancel}>{cancelLabel}</OutlineButton>
                <TonalButton tone="destructive" class="flex-1" onClick={onConfirm}>{confirmLabel}</TonalButton>
            </div>
        </Dialog>
    )
}

import { useRef, useState } from 'preact/hooks'
import { OutlineButton } from '../buttons/OutlineButton'
import { TonalButton } from '../buttons/TonalButton'
import { SelectField } from '../input/SelectField'
import { Dialog } from './Dialog'

// Mueve una capa a otra carpeta. folders: [{ value, label }]. El botón Mover se habilita al elegir destino;
// tras elegirlo el foco pasa a Mover, así que Enter confirma.
// count > 1: se mueven varias capas (la selección múltiple) y el texto habla de todas
export function MoveDialog ({ layerName, count = 1, folders, onConfirm, onCancel }) {
    const [target, setTarget] = useState(null)
    const actionsRef = useRef(null)

    return (
        <Dialog title="Mover a carpeta" onCancel={onCancel}>
            <div class="flex w-full flex-col gap-5 px-6 py-3">
                <p class="break-words text-center text-base leading-normal text-slate-700">
                    Selecciona la carpeta a la que quieres mover {count > 1
                        ? <>las <b class="font-semibold">{count} capas seleccionadas</b></>
                        : <>la capa <b class="font-semibold">{layerName}</b></>}
                </p>

                <SelectField
                    label="Carpeta"
                    required
                    placeholder="Selecciona una carpeta"
                    options={folders}
                    value={target}
                    data-autofocus
                    onChange={(value) => {
                        setTarget(value)
                        setTimeout(() => actionsRef.current?.lastElementChild.focus())
                    }}
                />
            </div>

            <div ref={actionsRef} class="flex w-full items-center gap-2 p-6">
                <OutlineButton class="flex-1" onClick={onCancel}>Cancelar</OutlineButton>
                <TonalButton class="flex-1" disabled={target === null} onClick={() => onConfirm(target)}>Mover</TonalButton>
            </div>
        </Dialog>
    )
}

import { useState } from 'preact/hooks'
import { OutlineButton } from '../buttons/OutlineButton'
import { TonalButton } from '../buttons/TonalButton'
import { TextField } from '../input/TextField'
import { Dialog } from './Dialog'

// Pide un valor personalizado (opacidad, grosor, color). parse(texto) devuelve el valor o null si no es válido;
// Aceptar (o Enter) valida y, si falla, marca el campo en rojo.
export function ValueDialog ({ title, label, placeholder, initial = '', parse, onAccept, onCancel, errorText = 'Ingresa un valor válido' }) {
    const [text, setText] = useState(initial)
    const [error, setError] = useState(false)

    const submit = (event) => {
        event.preventDefault()
        const value = parse(text)
        if (value === null) return setError(true)
        onAccept(value)
    }

    return (
        <Dialog title={title} onCancel={onCancel}>
            <form class="flex w-full flex-col" onSubmit={submit} noValidate>
                <div class="w-full px-6 py-3">
                    <TextField
                        data-autofocus
                        label={label}
                        required
                        value={text}
                        placeholder={placeholder}
                        error={error}
                        supportingText={error ? errorText : undefined}
                        onInput={(event) => {
                            setText(event.currentTarget.value)
                            setError(false)
                        }}
                    />
                </div>

                <div class="flex w-full items-center gap-2 p-6">
                    <OutlineButton class="flex-1" onClick={onCancel}>Cancelar</OutlineButton>
                    <TonalButton type="submit" class="flex-1">Aceptar</TonalButton>
                </div>
            </form>
        </Dialog>
    )
}

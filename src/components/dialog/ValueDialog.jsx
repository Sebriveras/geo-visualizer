import { useState } from 'preact/hooks'
import { OutlineButton } from '../buttons/OutlineButton'
import { TonalButton } from '../buttons/TonalButton'
import { TextField } from '../input/TextField'
import { Dialog } from './Dialog'

// Pide un valor personalizado (grosor, buffer). parse(texto) devuelve el valor o null si no es válido;
// Seleccionar (o Enter) valida y, si falla, marca el campo en rojo. Compacto y sin encabezado.
// preview(valor): vista previa opcional a la izquierda del campo (90×32 px); sigue al último valor válido.
// current: valor vigente, con el que arranca la vista previa.
export function ValueDialog ({ title, placeholder, initial = '', current, preview, parse, onAccept, onCancel, errorText = 'Ingresa un valor válido' }) {
    const [text, setText] = useState(initial)
    const [error, setError] = useState(false)
    const [valid, setValid] = useState(parse(initial) ?? current)

    const type = (value) => {
        setText(value)
        setError(false)
        const parsed = parse(value)
        if (parsed !== null) setValid(parsed)
    }

    const submit = (event) => {
        event.preventDefault()
        const value = parse(text)
        if (value === null) return setError(true)
        onAccept(value)
    }

    return (
        <Dialog title={title} headless width="w-72" onCancel={onCancel}>
            <form class="flex w-full flex-col" onSubmit={submit} noValidate>
                <div class="flex w-full items-start gap-2 px-4 pt-4">
                    {preview && (
                        <span class="flex h-8 w-22.5 shrink-0 items-center justify-center overflow-clip rounded-lg bg-slate-100">
                            {valid !== undefined && preview(valid)}
                        </span>
                    )}
                    <TextField
                        size="sm"
                        data-autofocus
                        aria-label={title}
                        value={text}
                        placeholder={placeholder}
                        error={error}
                        supportingText={error ? errorText : undefined}
                        onInput={(event) => type(event.currentTarget.value)}
                    />
                </div>

                <div class="flex w-full items-center gap-2 p-4">
                    <OutlineButton size="sm" class="flex-1" onClick={onCancel}>Cancelar</OutlineButton>
                    <TonalButton size="sm" type="submit" class="flex-1">Seleccionar</TonalButton>
                </div>
            </form>
        </Dialog>
    )
}

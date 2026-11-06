import { useState } from 'preact/hooks'
import { HexColorPicker } from 'react-colorful'
import { OutlineButton } from '../buttons/OutlineButton'
import { TonalButton } from '../buttons/TonalButton'
import { TextField } from '../input/TextField'
import { Dialog } from './Dialog'

// Color personalizado: selector visual (cuadro de saturación y barra de matiz) pegado al borde del diálogo, y debajo
// una muestra del color con el campo del código HEX, sincronizados en los dos sentidos. Sin encabezado.
// Mismas props que ValueDialog; parse(texto) devuelve "#RRGGBB" o null.
export function ColorDialog ({ title, placeholder, initial = '', parse, onAccept, onCancel, errorText = 'Ingresa un valor válido' }) {
    const [text, setText] = useState(initial)
    const [error, setError] = useState(false)
    // Último color válido: el selector y la muestra lo conservan mientras el texto está incompleto o es inválido
    const [color, setColor] = useState(parse(initial) ?? '#FF557F')

    const typeText = (value) => {
        setText(value)
        setError(false)
        const parsed = parse(value)
        if (parsed) setColor(parsed)
    }

    const pick = (hex) => {
        const parsed = parse(hex)
        setColor(parsed)
        setText(parsed)
        setError(false)
    }

    const submit = (event) => {
        event.preventDefault()
        const value = parse(text)
        if (value === null) return setError(true)
        onAccept(value)
    }

    return (
        <Dialog title={title} headless onCancel={onCancel}>
            <form class="flex w-full flex-col" onSubmit={submit} noValidate>
                <HexColorPicker color={color} onChange={pick} />

                <div class="flex w-full items-start gap-3 px-6 py-3">
                    <span class="mt-2.25 size-5.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                    <TextField
                        data-autofocus
                        aria-label="Código HEX"
                        value={text}
                        placeholder={placeholder}
                        error={error}
                        supportingText={error ? errorText : undefined}
                        onInput={(event) => typeText(event.currentTarget.value)}
                    />
                </div>

                <div class="flex w-full items-center gap-2 p-6">
                    <OutlineButton class="flex-1" onClick={onCancel}>Cancelar</OutlineButton>
                    <TonalButton type="submit" class="flex-1">Seleccionar</TonalButton>
                </div>
            </form>
        </Dialog>
    )
}

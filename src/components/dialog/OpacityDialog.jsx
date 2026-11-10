import { useState } from 'preact/hooks'
import { RgbaColorPicker } from 'react-colorful'
import { OutlineButton } from '../buttons/OutlineButton'
import { TonalButton } from '../buttons/TonalButton'
import { TextField } from '../input/TextField'
import { Dialog } from './Dialog'

const percent = (fraction) => `${+(fraction * 100).toFixed(1)}%`

const rgb = (hex) => ({ r: parseInt(hex.slice(1, 3), 16), g: parseInt(hex.slice(3, 5), 16), b: parseInt(hex.slice(5, 7), 16) })

// Opacidad personalizada: solo la barra de alpha de react-colorful (el resto del selector se oculta con CSS) dentro de un marco
// de 16 px, y debajo una muestra del color de la forma con el campo en %, sincronizados en los dos sentidos.
// color: el color de la forma ("#RRGGBB") · current: la opacidad vigente (fracción) · parse(texto) devuelve una fracción o null.
export function OpacityDialog ({ title, placeholder, parse, color = '#000000', current = 1, onAccept, onCancel, errorText = 'Ingresa un valor válido' }) {
    const [text, setText] = useState(percent(current))
    const [error, setError] = useState(false)
    // Última opacidad válida: la barra y la muestra la conservan mientras el texto está incompleto o es inválido
    const [opacity, setOpacity] = useState(current)

    const typeText = (value) => {
        setText(value)
        setError(false)
        const parsed = parse(value)
        if (parsed !== null) setOpacity(parsed)
    }

    const pick = ({ a }) => {
        // La barra trabaja en pasos de 1 %
        const parsed = Number((Math.round(a * 100) / 100).toFixed(2))
        setOpacity(parsed)
        setText(percent(parsed))
        setError(false)
    }

    const submit = (event) => {
        event.preventDefault()
        const value = parse(text)
        if (value === null) return setError(true)
        onAccept(value)
    }

    return (
        <Dialog title={title} headless width="w-96" onCancel={onCancel}>
            <form class="flex w-full flex-col" onSubmit={submit} noValidate>
                <div class="flex w-full flex-col gap-3 px-4 pt-4">
                    <RgbaColorPicker className="alpha-only" color={{ ...rgb(color), a: opacity }} onChange={pick} />

                    <div class="flex w-full items-start gap-2">
                        <span class="checker h-8 w-15 shrink-0 overflow-clip rounded-lg">
                            <span class="block size-full" style={{ backgroundColor: color, opacity }} />
                        </span>
                        <TextField
                            size="sm"
                            data-autofocus
                            aria-label="Valor de opacidad"
                            value={text}
                            placeholder={placeholder}
                            error={error}
                            supportingText={error ? errorText : undefined}
                            onInput={(event) => typeText(event.currentTarget.value)}
                        />
                    </div>
                </div>

                <div class="flex w-full items-center gap-2 px-4 pb-4 pt-6">
                    <OutlineButton size="sm" class="flex-1" onClick={onCancel}>Cancelar</OutlineButton>
                    <TonalButton size="sm" type="submit" class="flex-1">Seleccionar</TonalButton>
                </div>
            </form>
        </Dialog>
    )
}

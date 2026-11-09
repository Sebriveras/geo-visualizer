import { useEffect, useRef, useState } from 'preact/hooks'
import { ChevronLeft, ChevronRight, ImagePlus, Trash2 } from 'lucide-preact'
import { FloatingButton } from '../buttons/FloatingButton'
import { TonalButton } from '../buttons/TonalButton'
import { ConfirmDialog } from '../dialog/ConfirmDialog'

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024

// Imágenes de una capa mientras se edita su panel: [{ id, url, name }]. Viven en memoria (URL de objeto).
// `input` es el selector de archivos oculto: debe renderizarse en el panel; `openPicker` lo abre.
export function useImages (initial = []) {
    const [images, setImages] = useState(initial)
    const [error, setError] = useState('')
    const inputRef = useRef(null)

    const add = (files) => {
        const accepted = files.filter((file) => file.type.startsWith('image/'))
        const tooBig = accepted.filter((file) => file.size > MAX_IMAGE_BYTES)
        const valid = accepted.filter((file) => file.size <= MAX_IMAGE_BYTES)

        setError(tooBig.length > 0 ? `${tooBig.map((file) => file.name).join(', ')}: supera 10 MB y no se agregó.` : '')
        if (valid.length > 0) {
            setImages((current) => [...current, ...valid.map((file) => ({ id: crypto.randomUUID(), url: URL.createObjectURL(file), name: file.name }))])
        }
    }

    const input = (
        <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(event) => {
                add(Array.from(event.currentTarget.files))
                // Permite volver a elegir el mismo archivo
                event.currentTarget.value = ''
            }}
        />
    )

    return {
        images,
        error,
        input,
        openPicker: () => inputRef.current.click(),
        removeImage: (id) => setImages((current) => current.filter((image) => image.id !== id)),
        clearImages: () => setImages([])
    }
}

// Componente "Imagen" de la fila de botones del panel: agrega imágenes o, si ya hay, las elimina todas (con advertencia)
export function imagesAction ({ images, openPicker, clearImages }) {
    return {
        id: 'images',
        label: 'Imagen',
        active: images.length > 0,
        onAdd: openPicker,
        onRemove: clearImages,
        confirm: images.length > 0
            ? { title: 'Eliminar imágenes', message: images.length === 1 ? '¿Deseas eliminar la imagen de esta capa?' : `¿Deseas eliminar las ${images.length} imágenes de esta capa?` }
            : null
    }
}

// Carrusel de imágenes (ajustadas dentro de un contenedor de tamaño fijo). Sin imágenes no se muestra.
// onAdd / onRemove: botones "Imagen" y eliminar, solo al editar. Vuelve al inicio al pasar de la última.
export function ImageCarousel ({ images, onAdd, onRemove }) {
    const [index, setIndex] = useState(0)
    // Imagen que se está por eliminar, a la espera de confirmación
    const [removing, setRemoving] = useState(null)
    const count = images.length
    const previousCount = useRef(count)

    // Al agregar se muestra la primera imagen nueva; al borrar se queda en una que exista
    useEffect(() => {
        setIndex((current) => count > previousCount.current ? previousCount.current : Math.min(current, Math.max(count - 1, 0)))
        previousCount.current = count
    }, [count])

    if (count === 0) return null

    const current = images[Math.min(index, count - 1)]
    const go = (step) => setIndex((Math.min(index, count - 1) + step + count) % count)

    return (
        <div class="relative flex h-64 w-full shrink-0 flex-col items-end justify-between bg-slate-100 p-2">
            <img src={current.url} alt={current.name} class="absolute inset-0 size-full object-contain" />

            <p class="relative flex h-8 items-center rounded-lg bg-black/65 px-2 text-xs font-semibold text-white">
                {Math.min(index, count - 1) + 1} de {count}
            </p>

            <div class="relative flex w-full items-center justify-between">
                <FloatingButton icon={ChevronLeft} disabled={count < 2} onClick={() => go(-1)} aria-label="Imagen anterior" />
                <FloatingButton icon={ChevronRight} disabled={count < 2} onClick={() => go(1)} aria-label="Imagen siguiente" />
            </div>

            <div class="relative flex h-8 items-center gap-1">
                {onAdd && <TonalButton size="xs" leadingIcon={ImagePlus} onClick={onAdd}>Imagen</TonalButton>}
                {onRemove && <TonalButton size="xs" tone="destructive" leadingIcon={Trash2} aria-label="Eliminar imagen" title="Eliminar imagen" onClick={() => setRemoving(current)}>{null}</TonalButton>}
            </div>

            {removing && (
                <ConfirmDialog
                    title="Eliminar imagen"
                    message={<>¿Deseas eliminar la imagen <b class="font-semibold">{removing.name}</b>?</>}
                    onCancel={() => setRemoving(null)}
                    onConfirm={() => {
                        onRemove(removing.id)
                        setRemoving(null)
                    }}
                />
            )}
        </div>
    )
}

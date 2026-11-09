import { useState } from 'preact/hooks'
import { ConfirmDialog } from '../dialog/ConfirmDialog'
import { MoveDialog } from '../dialog/MoveDialog'
import { useLayers } from '../../context/LayersContext'

// Valor del destino «raíz» en el selector de carpetas
const ROOT = '__root__'

// null = raíz, undefined = no encontrado
function findParentId (layers, id, parentId = null) {
    for (const layer of layers) {
        if (layer.id === id) return parentId
        if (layer.children) {
            const found = findParentId(layer.children, id, layer.id)
            if (found !== undefined) return found
        }
    }
    return undefined
}

// Acciones "Mover a carpeta" y "Borrar" de una capa, con sus diálogos. Las comparten el menú del árbol y el de los paneles del mapa.
// Devuelve { canMove(layer), askMove(layer), askDelete(layer), dialogs }: `dialogs` debe renderizarse donde se use.
export function useLayerActions () {
    const { layers, deleteLayer, moveLayer } = useLayers()
    const [moving, setMoving] = useState(null)
    const [deleting, setDeleting] = useState(null)

    // Destinos válidos: todas las carpetas en lista plana, con su ruta (salvo la propia capa, su contenido y su carpeta actual)
    // y la raíz si la capa está dentro de una carpeta
    const moveTargets = (layer) => {
        const parentId = findParentId(layers, layer.id)
        const collect = (list, path) => list.flatMap((item) => {
            if (!item.children || item.id === layer.id) return []
            const label = [...path, item.name].join(' / ')
            return [...(item.id === parentId ? [] : [{ value: item.id, label }]), ...collect(item.children, [...path, item.name])]
        })
        const folders = collect(layers, [])
        return parentId === null ? folders : [...folders, { value: ROOT, label: 'Sin carpeta (raíz)' }]
    }

    const dialogs = (
        <>
            {moving && (
                <MoveDialog
                    layerName={moving.name}
                    folders={moveTargets(moving)}
                    onCancel={() => setMoving(null)}
                    onConfirm={(target) => {
                        moveLayer(moving.id, target === ROOT ? null : target, 'last-child')
                        setMoving(null)
                    }}
                />
            )}

            {deleting && (
                <ConfirmDialog
                    title={deleting.children ? 'Eliminar carpeta' : 'Eliminar capa'}
                    message={deleting.children?.length > 0
                        ? <>¿Deseas eliminar la carpeta <b class="font-semibold">{deleting.name}</b> y todo su contenido?</>
                        : <>¿Deseas eliminar {deleting.children ? 'la carpeta' : 'la capa'} <b class="font-semibold">{deleting.name}</b>?</>}
                    onCancel={() => setDeleting(null)}
                    onConfirm={() => {
                        deleteLayer(deleting.id)
                        setDeleting(null)
                    }}
                />
            )}
        </>
    )

    return { canMove: (layer) => moveTargets(layer).length > 0, askMove: setMoving, askDelete: setDeleting, dialogs }
}

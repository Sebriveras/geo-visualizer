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

const asList = (layerOrList) => Array.isArray(layerOrList) ? layerOrList : [layerOrList]

// Acciones "Mover a carpeta" y "Borrar", con sus diálogos, sobre una capa o sobre varias (la selección múltiple).
// Las comparten el menú del árbol y el de los paneles del mapa.
// Devuelve { canMove(capa | capas), askMove(capa | capas), askDelete(capa | capas), dialogs }: `dialogs` debe renderizarse donde se use.
export function useLayerActions () {
    const { layers, deleteLayers, moveLayers } = useLayers()
    const [moving, setMoving] = useState(null)
    const [deleting, setDeleting] = useState(null)

    // Destinos válidos: todas las carpetas en lista plana, con su ruta (salvo las capas movidas, su contenido y, si todas
    // comparten carpeta, esa carpeta actual) y la raíz si alguna capa está dentro de una carpeta
    const moveTargets = (selected) => {
        const list = asList(selected)
        const ids = list.map((layer) => layer.id)
        const parents = list.map((layer) => findParentId(layers, layer.id))
        const sharedParent = parents.every((parent) => parent === parents[0]) ? parents[0] : undefined

        const collect = (items, path) => items.flatMap((item) => {
            if (!item.children || ids.includes(item.id)) return []
            const label = [...path, item.name].join(' / ')
            return [...(item.id === sharedParent ? [] : [{ value: item.id, label }]), ...collect(item.children, [...path, item.name])]
        })
        const folders = collect(layers, [])
        return sharedParent === null ? folders : [...folders, { value: ROOT, label: 'Sin carpeta (raíz)' }]
    }

    const hasContent = (list) => list.some((layer) => layer.children?.length > 0)

    const dialogs = (
        <>
            {moving && (
                <MoveDialog
                    layerName={moving[0].name}
                    count={moving.length}
                    folders={moveTargets(moving)}
                    onCancel={() => setMoving(null)}
                    onConfirm={(target) => {
                        moveLayers(moving.map((layer) => layer.id), target === ROOT ? null : target, 'last-child')
                        setMoving(null)
                    }}
                />
            )}

            {deleting && (
                <ConfirmDialog
                    title={deleting.length > 1 ? 'Eliminar capas' : deleting[0].children ? 'Eliminar carpeta' : 'Eliminar capa'}
                    message={deleting.length > 1
                        ? <>¿Deseas eliminar las <b class="font-semibold">{deleting.length} capas seleccionadas</b>{hasContent(deleting) ? ' y todo el contenido de sus carpetas' : ''}?</>
                        : deleting[0].children?.length > 0
                            ? <>¿Deseas eliminar la carpeta <b class="font-semibold">{deleting[0].name}</b> y todo su contenido?</>
                            : <>¿Deseas eliminar {deleting[0].children ? 'la carpeta' : 'la capa'} <b class="font-semibold">{deleting[0].name}</b>?</>}
                    onCancel={() => setDeleting(null)}
                    onConfirm={() => {
                        deleteLayers(deleting.map((layer) => layer.id))
                        setDeleting(null)
                    }}
                />
            )}
        </>
    )

    return {
        canMove: (selected) => moveTargets(selected).length > 0,
        askMove: (selected) => setMoving(asList(selected)),
        askDelete: (selected) => setDeleting(asList(selected)),
        dialogs
    }
}

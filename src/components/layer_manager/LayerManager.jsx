import { Fragment } from 'preact'
import { useRef, useState } from 'preact/hooks'
import { DragDropProvider, DragOverlay, KeyboardSensor, PointerSensor, useDraggable } from '@dnd-kit/react'
import { PointerActivationConstraints } from '@dnd-kit/dom'
import { DoorOpen, Folder, MapPin, Pencil, Spline, Trash2, TreePine, UtilityPole, VectorSquare } from 'lucide-preact'
import { Layer } from './Layer'
import { LayersActionPanel } from './LayersActionPanel'
import { LayerHeader } from './LayerHeader'
import { ConfirmDialog } from '../dialog/ConfirmDialog'
import { DropdownMenu, MenuDivider, MenuItem } from '../menu/DropdownMenu'
import { useLayers } from '../../context/LayersContext'

const TYPE_ICONS = { line: Spline, polygon: VectorSquare }
// El icono de un punto en el árbol sigue al icono elegido en el panel
const POINT_ICONS = { pin: MapPin, tree: TreePine, entrance: DoorOpen, pole: UtilityPole }

const layerIcon = (layer) => {
    if (layer.children) return Folder
    return layer.type === 'point' ? POINT_ICONS[layer.icon] ?? MapPin : TYPE_ICONS[layer.type]
}

// Capas visibles en pantalla, en orden, con su nivel de anidación
function flatten (layers, collapsed, level = 0) {
    return layers.flatMap((layer) => [
        { layer, level },
        ...(layer.children && !collapsed.has(layer.id) ? flatten(layer.children, collapsed, level + 1) : [])
    ])
}

const contains = (layer, id) => Boolean(layer.children?.some((child) => child.id === id || contains(child, id)))

// Destino del soltado según la posición vertical del puntero sobre las filas.
// Carpeta: borde superior = antes · centro = dentro · (cerrada) borde inferior = después.
// Carpeta abierta: todo lo que no sea el borde superior entra como primer hijo.
// Devuelve { targetId, placement } · null = sin destino válido
function resolveDrop (flat, collapsed, dragged, container, y) {
    const rows = [...container.querySelectorAll('[data-layer-id]')]
    if (rows.length === 0) return null

    const first = rows[0].getBoundingClientRect()
    const last = rows[rows.length - 1].getBoundingClientRect()
    if (y < first.top) return { targetId: rows[0].dataset.layerId, placement: 'before' }
    if (y >= last.bottom) return { targetId: null, placement: 'last-child' }

    const row = rows.find((element) => {
        const rect = element.getBoundingClientRect()
        return y >= rect.top && y < rect.bottom
    })
    if (!row) return null

    const id = row.dataset.layerId
    if (id === dragged.id || contains(dragged, id)) return null

    const rect = row.getBoundingClientRect()
    const ratio = (y - rect.top) / rect.height
    const target = flat.find(({ layer }) => layer.id === id).layer

    if (!target.children) return { targetId: id, placement: ratio < 0.5 ? 'before' : 'after' }
    if (ratio < 0.25) return { targetId: id, placement: 'before' }
    if (!collapsed.has(id)) return { targetId: id, placement: 'first-child' }
    return { targetId: id, placement: ratio < 0.75 ? 'last-child' : 'after' }
}

// Qué dibuja la fila `layer` para mostrar el destino: línea arriba/abajo o resaltado "dentro"
function indicatorFor (layer, level, drop, lastId) {
    if (!drop) return undefined
    if (drop.targetId === null) return layer.id === lastId ? { edge: 'bottom', level: 0 } : undefined
    if (drop.targetId !== layer.id) return undefined

    if (drop.placement === 'before') return { edge: 'top', level }
    if (drop.placement === 'after') return { edge: 'bottom', level }
    if (drop.placement === 'first-child') return { edge: 'bottom', level: level + 1 }
    return { inside: true }
}

function DraggableLayer (props) {
    const { ref, handleRef, isDragSource } = useDraggable({ id: props.id })

    return <Layer {...props} rowRef={ref} gripRef={handleRef} dragging={isDragSource}/>
}

function LayerTree ({ layers, level = 0, activeId, onSelect, collapsed, onToggle, onToggleVisible, onFocus, menuId, onMenu, drop, lastId }) {
    return layers.map((layer) => {
        const isFolder = Boolean(layer.children)
        const isCollapsed = collapsed.has(layer.id)

        return (
            <Fragment key={layer.id}>
                <DraggableLayer
                    id={layer.id}
                    name={layer.name}
                    count={isFolder ? '0' : ''}
                    level={level}
                    checked={layer.visible}
                    onCheckedChange={() => onToggleVisible(layer.id)}
                    icon={layerIcon(layer)}
                    active={activeId === layer.id}
                    expanded={isFolder ? !isCollapsed : undefined}
                    onToggle={isFolder ? () => onToggle(layer.id) : undefined}
                    onClick={() => onSelect(layer.id)}
                    onDoubleClick={() => onFocus(layer.id)}
                    menuOpen={menuId === layer.id}
                    onMenu={(trigger) => onMenu(layer.id, trigger)}
                    indicator={indicatorFor(layer, level, drop, lastId)}
                />
                {isFolder && !isCollapsed && (
                    <LayerTree
                        layers={layer.children}
                        level={level + 1}
                        activeId={activeId}
                        onSelect={onSelect}
                        collapsed={collapsed}
                        onToggle={onToggle}
                        onToggleVisible={onToggleVisible}
                        onFocus={onFocus}
                        menuId={menuId}
                        onMenu={onMenu}
                        drop={drop}
                        lastId={lastId}
                    />
                )}
            </Fragment>
        )
    })
}

export function LayerManger () {
    const { layers, activeId, collapsed, openLayer, startEditing, deleteLayer, toggleFolder, toggleVisible, focusLayer, moveLayer } = useLayers()
    // { id, anchor }: capa con el menú abierto y el botón elipsis que lo abrió
    const [menu, setMenu] = useState(null)
    // Capa que se está por borrar, a la espera de confirmación
    const [deleting, setDeleting] = useState(null)

    // Arrastre desde el grip: `drop` es el destino bajo el puntero y `draggedId` la capa en movimiento
    const [draggedId, setDraggedId] = useState(null)
    const [drop, setDrop] = useState(null)
    const dropRef = useRef(null)
    const treeRef = useRef(null)

    const flat = flatten(layers, collapsed)
    const dragged = draggedId ? flat.find(({ layer }) => layer.id === draggedId)?.layer : null

    const updateDrop = (event) => {
        const source = event.operation.source
        const layer = source && flat.find((item) => item.layer.id === source.id)?.layer
        const next = layer ? resolveDrop(flat, collapsed, layer, treeRef.current, event.operation.position.current.y) : null
        dropRef.current = next
        setDrop(next)
    }

    const endDrag = (event) => {
        const { source } = event.operation
        if (!event.canceled && source && dropRef.current) moveLayer(source.id, dropRef.current.targetId, dropRef.current.placement)
        dropRef.current = null
        setDrop(null)
        setDraggedId(null)
    }

    const toggleMenu = (id, trigger) => {
        if (menu?.id === id) return setMenu(null)

        setMenu({ id, anchor: trigger })
    }

    const runAction = (action) => {
        const { id } = menu
        setMenu(null)
        action(id)
    }

    return (
        <div class="flex h-full w-80 shrink-0 flex-col">
            <LayerHeader/>
            <LayersActionPanel/>

            <DragDropProvider
                sensors={[PointerSensor.configure({ activationConstraints: [new PointerActivationConstraints.Distance({ value: 4 })] }), KeyboardSensor]}
                onDragStart={(event) => {
                    setMenu(null)
                    setDraggedId(event.operation.source.id)
                }}
                onDragMove={updateDrop}
                onDragEnd={endDrag}
            >
                <div ref={treeRef} class="min-h-0 flex-1 overflow-y-auto py-2">
                    <LayerTree
                        layers={layers}
                        activeId={activeId}
                        onSelect={openLayer}
                        collapsed={collapsed}
                        onToggle={toggleFolder}
                        onToggleVisible={toggleVisible}
                        onFocus={focusLayer}
                        menuId={menu?.id}
                        onMenu={toggleMenu}
                        drop={drop}
                        lastId={flat[flat.length - 1]?.layer.id}
                    />
                </div>

                <DragOverlay dropAnimation={null}>
                    {dragged && (
                        <Layer
                            name={dragged.name}
                            count={dragged.children ? '0' : ''}
                            checked={dragged.visible}
                            icon={layerIcon(dragged)}
                            active={activeId === dragged.id}
                            expanded={dragged.children ? !collapsed.has(dragged.id) : undefined}
                            overlay
                        />
                    )}
                </DragOverlay>
            </DragDropProvider>

            {menu && (
                <DropdownMenu anchor={menu.anchor} onClose={() => setMenu(null)}>
                    <MenuItem icon={Pencil} onClick={() => runAction(startEditing)}>Editar</MenuItem>
                    <MenuDivider/>
                    <MenuItem icon={Trash2} tone="danger" onClick={() => runAction((id) => setDeleting(flat.find(({ layer }) => layer.id === id).layer))}>Borrar</MenuItem>
                </DropdownMenu>
            )}

            {deleting && (
                <ConfirmDialog
                    title={deleting.children ? 'Eliminar carpeta' : 'Eliminar capa'}
                    message={deleting.children?.length > 0
                        ? `¿Deseas eliminar la carpeta ${deleting.name} y todo su contenido?`
                        : `¿Deseas eliminar ${deleting.children ? 'la carpeta' : 'la capa'} ${deleting.name}?`}
                    onCancel={() => setDeleting(null)}
                    onConfirm={() => {
                        deleteLayer(deleting.id)
                        setDeleting(null)
                    }}
                />
            )}
        </div>
    )
}

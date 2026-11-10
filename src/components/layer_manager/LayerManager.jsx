import { Fragment } from 'preact'
import { useRef, useState } from 'preact/hooks'
import { DragDropProvider, DragOverlay, KeyboardSensor, PointerSensor, useDraggable } from '@dnd-kit/react'
import { PointerActivationConstraints } from '@dnd-kit/dom'
import { DoorOpen, Folder, FolderInput, MapPin, Pencil, Spline, Trash2, TreePine, UtilityPole, VectorSquare } from 'lucide-preact'
import { Layer } from './Layer'
import { LayersActionPanel } from './LayersActionPanel'
import { LayerHeader } from './LayerHeader'
import { useLayerActions } from './useLayerActions'
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

// Sin tildes ni mayúsculas, para que "poligono" encuentre "Polígono"
const normalize = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

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
    const { layers, activeId, collapsed, openLayer, startEditing, toggleFolder, toggleVisible, focusLayer, moveLayer } = useLayers()
    // { id, anchor }: capa con el menú abierto y el botón elipsis que lo abrió
    const [menu, setMenu] = useState(null)
    // Texto del filtro de capas
    const [query, setQuery] = useState('')
    const { canMove, askMove, askDelete, dialogs } = useLayerActions()

    // Arrastre desde el grip: `drop` es el destino bajo el puntero y `draggedId` la capa en movimiento
    const [draggedId, setDraggedId] = useState(null)
    const [drop, setDrop] = useState(null)
    const dropRef = useRef(null)
    const treeRef = useRef(null)

    const flat = flatten(layers, collapsed)
    // Todas las capas, también las de carpetas cerradas: los resultados del filtro y el menú las necesitan
    const all = flatten(layers, new Set())
    const needle = normalize(query.trim())
    // Con filtro activo: lista plana de las capas cuyo nombre coincide (sin sus carpetas), sin arrastre
    const results = needle ? all.filter(({ layer }) => normalize(layer.name).includes(needle)).map(({ layer }) => layer) : null
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
            <LayersActionPanel query={query} onQuery={setQuery}/>

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
                    {results ? (
                        results.length === 0 ? (
                            <div class="flex h-full items-center justify-center">
                                <div class="flex w-53.5 flex-col gap-1 text-center">
                                    <p class="truncate text-base font-semibold leading-normal text-slate-700">Sin resultados</p>
                                    <p class="text-sm text-slate-600">No hay resultados disponibles para esta búsqueda</p>
                                </div>
                            </div>
                        ) : results.map((layer) => (
                            <Layer
                                key={layer.id}
                                id={layer.id}
                                name={layer.name}
                                count={layer.children ? '0' : ''}
                                checked={layer.visible}
                                onCheckedChange={() => toggleVisible(layer.id)}
                                icon={layerIcon(layer)}
                                active={activeId === layer.id}
                                onClick={() => openLayer(layer.id)}
                                onDoubleClick={() => focusLayer(layer.id)}
                                menuOpen={menu?.id === layer.id}
                                onMenu={(trigger) => toggleMenu(layer.id, trigger)}
                            />
                        ))
                    ) : (
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
                    )}
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
                    <MenuItem icon={FolderInput} disabled={!canMove(all.find(({ layer }) => layer.id === menu.id).layer)} onClick={() => runAction((id) => askMove(all.find(({ layer }) => layer.id === id).layer))}>Mover a carpeta</MenuItem>
                    <MenuDivider/>
                    <MenuItem icon={Trash2} tone="danger" onClick={() => runAction((id) => askDelete(all.find(({ layer }) => layer.id === id).layer))}>Borrar</MenuItem>
                </DropdownMenu>
            )}

            {dialogs}
        </div>
    )
}

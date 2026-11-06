import { createContext } from 'preact'
import { useContext, useEffect, useRef, useState } from 'preact/hooks'
import area from '@turf/area'
import turfDistance from '@turf/distance'
import { useMap } from './MapContext'
import { DEFAULT_COLOR } from '../components/map_panel/ColorPicker'
import { DEFAULT_OPACITY } from '../components/map_panel/OpacityPicker'
import { DEFAULT_WIDTH } from '../components/map_panel/WidthPicker'
import { DEFAULT_BUFFER_OPACITY } from '../components/map_panel/BufferPicker'
import { DEFAULT_ICON } from '../components/map_panel/IconPicker'

const DEFAULT_FOLDER_NAME = 'Nueva carpeta'
const DEFAULT_NAMES = { folder: DEFAULT_FOLDER_NAME, point: 'Nuevo punto', line: 'Nueva línea', polygon: 'Nuevo polígono' }
// Puntos con los que la forma se cierra y pasa directo a edición
const AUTO_EDIT_POINTS = { point: 1, line: 2, polygon: 3 }
// Puntos mínimos para que la forma exista; con menos, un trazado nuevo vuelve a la fase de trazar
const MIN_POINTS = { point: 1, line: 2, polygon: 3 }

// Las mediciones siempre van en negro
const MEASURE_COLOR = '#0f172b'

const LayersContext = createContext(null)

function findNode (layers, id) {
    for (const layer of layers) {
        if (layer.id === id) return layer
        if (layer.children) {
            const found = findNode(layer.children, id)
            if (found) return found
        }
    }
    return null
}

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

function findSiblings (layers, id) {
    if (layers.some((layer) => layer.id === id)) return layers
    for (const layer of layers) {
        if (layer.children) {
            const found = findSiblings(layer.children, id)
            if (found) return found
        }
    }
    return null
}

function updateNode (layers, id, update) {
    return layers.map((layer) => {
        if (layer.id === id) return update(layer)
        if (layer.children) return { ...layer, children: updateNode(layer.children, id, update) }
        return layer
    })
}

function removeNode (layers, id) {
    return layers
        .filter((layer) => layer.id !== id)
        .map((layer) => layer.children ? { ...layer, children: removeNode(layer.children, id) } : layer)
}

function addChild (layers, parentId, node) {
    if (parentId === null) return [...layers, node]
    return updateNode(layers, parentId, (parent) => ({ ...parent, children: [...parent.children, node] }))
}

// Mueve `id` junto a `targetId`. placement: 'before' | 'after' | 'first-child' | 'last-child'
// (targetId null + 'last-child' = al final de la raíz). No hace nada si el destino queda dentro de la propia capa.
function moveNode (layers, id, targetId, placement) {
    const node = findNode(layers, id)
    if (!node || id === targetId) return layers
    if (targetId !== null && (!findNode(layers, targetId) || (node.children && findNode(node.children, targetId)))) return layers

    const rest = removeNode(layers, id)
    if (targetId === null) return [...rest, node]

    if (placement === 'first-child' || placement === 'last-child') {
        return updateNode(rest, targetId, (parent) => ({
            ...parent,
            children: placement === 'first-child' ? [node, ...parent.children] : [...parent.children, node]
        }))
    }

    const insert = (list) => {
        const index = list.findIndex((layer) => layer.id === targetId)
        if (index === -1) return list.map((layer) => layer.children ? { ...layer, children: insert(layer.children) } : layer)
        const next = [...list]
        next.splice(placement === 'before' ? index : index + 1, 0, node)
        return next
    }
    return insert(rest)
}

function uniqueName (siblings, baseName, excludeId) {
    const taken = new Set(siblings.filter((layer) => layer.id !== excludeId).map((layer) => layer.name))
    if (!taken.has(baseName)) return baseName

    let index = 2
    while (taken.has(`${baseName} (${index})`)) index++
    return `${baseName} (${index})`
}

// Los puntos son { lng, lat }; las medidas son geodésicas (metros y metros cuadrados)
const toCoordinates = (point) => [point.lng, point.lat]

const meters = (a, b) => turfDistance(toCoordinates(a), toCoordinates(b), { units: 'meters' })

// Distancia en pantalla (píxeles), para decidir qué lado del polígono queda más cerca de un clic
const distance = (a, b) => Math.hypot(b.x - a.x, b.y - a.y)

function pathLength (points, closed = false) {
    let total = 0
    for (let i = 1; i < points.length; i++) total += meters(points[i - 1], points[i])
    if (closed && points.length > 2) total += meters(points[points.length - 1], points[0])
    return total
}

function polygonArea (points) {
    if (points.length < 3) return 0
    const ring = [...points, points[0]].map(toCoordinates)
    return area({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ring] } })
}

// Medidas derivadas de los puntos (en metros / metros cuadrados)
function measureOf (type, points) {
    if (type === 'polygon') return { area: polygonArea(points), perimeter: pathLength(points, true) }
    if (type === 'point') return {}
    // Circunferencia: puntos = centro y borde, así que el diámetro es el doble de esa distancia
    if (type === 'circle') return { length: pathLength(points) * 2 }
    return { length: pathLength(points) }
}

// Lado del polígono más cercano a `point` (ambos en píxeles de pantalla): devuelve el índice del vértice donde empieza
function nearestEdge (points, point) {
    let best = { index: 0, gap: Infinity }
    points.forEach((a, index) => {
        const b = points[(index + 1) % points.length]
        const lengthSquared = (b.x - a.x) ** 2 + (b.y - a.y) ** 2
        const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, ((point.x - a.x) * (b.x - a.x) + (point.y - a.y) * (b.y - a.y)) / lengthSquared))
        const gap = distance(point, { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) })
        if (gap < best.gap) best = { index, gap }
    })
    return best.index
}

function collectFolderIds (layers) {
    return layers.flatMap((layer) => layer.children ? [layer.id, ...collectFolderIds(layer.children)] : [])
}

// Área del mapa que queda libre al centrar una capa: el panel ocupa el lado derecho (px)
const FOCUS_PADDING = { top: 60, bottom: 60, left: 60, right: 420 }
const POINT_FOCUS_ZOOM = 17
const MAX_FOCUS_ZOOM = 19
const TILE_SIZE = 512
const METERS_PER_DEGREE = 111320

// Coordenada vertical de la proyección Mercator (radianes) de una latitud en grados
const mercatorY = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))

function collectShapes (layers) {
    return layers.flatMap((layer) => layer.children ? collectShapes(layer.children) : layer.points ? [layer] : [])
}

// Dentro de la carpeta seleccionada; si hay una capa seleccionada, junto a ella; si no, en la raíz
function targetParentId (layers, activeId) {
    const active = activeId ? findNode(layers, activeId) : null
    if (!active) return null
    return active.children ? active.id : findParentId(layers, activeId)
}

// draft = { name, observation, color?, icon? }; una observación vacía equivale a no tener observación
function commitInto (layers, id, { name, observation, color, width, opacity, buffer, icon, images }) {
    const layer = findNode(layers, id)
    const fallback = DEFAULT_NAMES[layer.children ? 'folder' : layer.type]
    const finalName = uniqueName(findSiblings(layers, id), name.trim() || fallback, id)
    return updateNode(layers, id, (current) => ({
        ...current,
        name: finalName,
        observation: observation.trim(),
        ...(color !== undefined && { color }),
        ...(width !== undefined && { width }),
        ...(opacity !== undefined && { opacity }),
        ...(buffer !== undefined && { buffer }),
        ...(icon !== undefined && { icon }),
        ...(images !== undefined && { images })
    }))
}

// Una capa en creación no entra al árbol hasta que se guarda o se cancela en edición
function commitPending (layers, shape, { name, observation, color, width, opacity, buffer, icon, images }) {
    const { parentId, ...layer } = shape
    const siblings = parentId === null ? layers : findNode(layers, parentId).children
    return addChild(layers, parentId, {
        ...layer,
        name: uniqueName(siblings, name.trim() || DEFAULT_NAMES[shape.type]),
        observation: observation.trim(),
        ...(color !== undefined && { color }),
        ...(width !== undefined && { width }),
        ...(opacity !== undefined && { opacity }),
        ...(buffer !== undefined && { buffer }),
        ...(icon !== undefined && { icon }),
        ...(images !== undefined && { images })
    })
}

export function LayersProvider ({ children }) {
    const { map } = useMap()
    const [layers, setLayers] = useState([])
    const [activeId, setActiveId] = useState(null)
    const [collapsed, setCollapsed] = useState(new Set())
    // { layerId, mode: 'draw' | 'edit' | 'view' } mientras el panel del mapa está abierto
    const [panel, setPanel] = useState(null)
    // Línea o polígono que se está creando; hasta guardarlo no forma parte de `layers`
    const [pending, setPending] = useState(null)
    // Unidad elegida por tipo de medida: longitud (línea y perímetro), área, elevación y formato de coordenadas
    const [units, setUnits] = useState({ length: 'm', area: 'm2', elevation: 'm', coordinates: 'dms' })
    // { layerId, color?, width?, opacity?, buffer?, icon? }: lo que se está probando en el panel, antes de guardarlo
    const [preview, setPreview] = useState(null)
    // Medición en curso { id, type, points, ...medidas }: temporal, nunca entra a `layers`
    const [measure, setMeasure] = useState(null)
    // Deshacer de la forma que se crea o edita: estados anteriores de sus puntos (el último = el más reciente)
    const [history, setHistory] = useState({ layerId: null, stack: [] })
    // Borrador del panel en edición, para poder conservarlo si se cambia de capa
    const draftRef = useRef(null)

    const setUnit = (kind, id) => setUnits({ ...units, [kind]: id })

    const toggleFolder = (id) => {
        const next = new Set(collapsed)
        next.has(id) ? next.delete(id) : next.add(id)
        setCollapsed(next)
    }

    const collapseAll = () => setCollapsed(new Set(collectFolderIds(layers)))

    // Ocultar una carpeta oculta todo su contenido; mostrar una capa también muestra sus carpetas
    const toggleVisible = (id) => {
        const visible = !findNode(layers, id).visible
        const setSubtree = (node) => ({
            ...node,
            visible,
            ...(node.children && { children: node.children.map(setSubtree) })
        })

        let next = updateNode(layers, id, setSubtree)
        if (visible) {
            for (let parentId = findParentId(next, id); parentId; parentId = findParentId(next, parentId)) {
                next = updateNode(next, parentId, (parent) => ({ ...parent, visible: true }))
            }
        }
        setLayers(next)
    }

    // Cierra lo que esté abierto antes de empezar otra cosa y devuelve las capas resultantes
    const settleCurrent = () => {
        if (pending) {
            setPending(null)
            return layers
        }
        if (panel?.mode === 'edit') return commitInto(layers, panel.layerId, draftRef.current)
        return layers
    }

    const createFolder = () => {
        const base = settleCurrent()
        setMeasure(null)
        const parentId = targetParentId(base, activeId)
        const siblings = parentId === null ? base : findNode(base, parentId).children

        const folder = {
            id: crypto.randomUUID(),
            name: uniqueName(siblings, DEFAULT_FOLDER_NAME),
            observation: '',
            visible: true,
            children: []
        }

        setLayers(addChild(base, parentId, folder))
        if (parentId !== null && collapsed.has(parentId)) toggleFolder(parentId)
        setActiveId(folder.id)
        setPanel({ layerId: folder.id, mode: 'edit' })
    }

    // type: 'point' | 'line' | 'polygon'. Volver a pulsar la misma herramienta cancela el flujo;
    // pulsar la otra cierra el trazado actual y empieza el nuevo.
    const startShape = (type) => {
        if (pending?.type === type) return closePanel(draftRef.current)

        const base = settleCurrent()
        setMeasure(null)
        const parentId = targetParentId(base, activeId)
        const shape = {
            id: crypto.randomUUID(),
            type,
            name: DEFAULT_NAMES[type],
            observation: '',
            visible: true,
            ...(type === 'point' ? { icon: DEFAULT_ICON } : { color: DEFAULT_COLOR, width: DEFAULT_WIDTH, opacity: type === 'polygon' ? DEFAULT_OPACITY : DEFAULT_BUFFER_OPACITY, ...(type === 'line' && { buffer: null }) }),
            // Vértices { lng, lat }; las medidas se derivan de ellos
            points: [],
            ...measureOf(type, []),
            parentId
        }

        setLayers(base)
        if (parentId !== null && collapsed.has(parentId)) toggleFolder(parentId)
        setPending(shape)
        setPanel({ layerId: shape.id, mode: 'draw' })
    }

    // Aplica `update` a una línea o polígono, esté en creación o ya guardado
    const updateShape = (id, update) => {
        const apply = (shape) => {
            const points = update(shape.points)
            return { ...shape, points, ...measureOf(shape.type, points) }
        }

        if (pending?.id === id) setPending(apply(pending))
        else setLayers(updateNode(layers, id, apply))
    }

    // type: 'line' | 'circle' | 'profile' (perfil de elevación). Volver a pulsar la herramienta la cancela; empezarla cierra lo que esté abierto
    const startMeasure = (type) => {
        // Pulsar la misma herramienta la cancela; pulsar otra la reemplaza
        if (measure?.type === type) return setMeasure(null)

        setLayers(settleCurrent())
        setPanel(null)
        setMeasure({ id: 'measure', type, points: [], ...measureOf(type, []) })
    }

    // "Volver a medir": descarta los puntos y empieza la misma medición de nuevo
    const restartMeasure = () => setMeasure({ ...measure, points: [], ...measureOf(measure.type, []) })

    // La circunferencia son dos puntos (centro y borde); después de ellos los clics no hacen nada
    const addMeasurePoint = (point) => {
        if (measure.type === 'circle' && measure.points.length >= 2) return
        const points = [...measure.points, point]
        setMeasure({ ...measure, points, ...measureOf(measure.type, points) })
    }

    // Guarda los puntos actuales de la forma `id` para poder volver a ellos
    const remember = (id, points) => {
        setHistory((current) => ({ layerId: id, stack: [...(current.layerId === id ? current.stack : []), points] }))
    }

    const currentShape = (id) => pending?.id === id ? pending : findNode(layers, id)

    // Al empezar a arrastrar un vértice o un punto: todo el arrastre se deshace de una vez
    const beginMove = (id) => remember(id, currentShape(id).points)

    // Deshace la última acción sobre los puntos; un trazado nuevo que baja del mínimo vuelve a la fase de trazar
    const undo = () => {
        const { layerId, stack } = history
        if (stack.length === 0 || panel?.layerId !== layerId) return

        const points = stack[stack.length - 1]
        setHistory({ layerId, stack: stack.slice(0, -1) })
        updateShape(layerId, () => points)
        if (pending?.id === layerId && points.length < MIN_POINTS[pending.type]) setPanel({ layerId, mode: 'draw' })
    }

    // Al salir de la edición (o cambiar de capa) ya no hay nada que deshacer
    useEffect(() => {
        setHistory((current) => panel && panel.mode !== 'view' && current.layerId === panel.layerId ? current : { layerId: null, stack: [] })
    }, [panel?.layerId, panel?.mode])

    const addPoint = (point) => {
        // Poner el punto no se deshace (solo sus movimientos); en líneas y polígonos cada vértice sí
        if (pending.type !== 'point') remember(pending.id, pending.points)
        const points = [...pending.points, point]
        setPending({ ...pending, points, ...measureOf(pending.type, points) })
        // Al tener los puntos mínimos (punto 1, línea 2, polígono 3) pasa directo a edición
        if (points.length >= AUTO_EDIT_POINTS[pending.type]) {
            setPanel({ layerId: pending.id, mode: 'edit' })
        }
    }

    // En una línea, un clic la prolonga por el final
    const appendPoint = (id, point) => {
        remember(id, currentShape(id).points)
        updateShape(id, (points) => [...points, point])
    }

    // En un polígono cerrado, un clic agrega un vértice en el lado más cercano
    const insertPoint = (id, point) => {
        remember(id, currentShape(id).points)
        updateShape(id, (points) => {
            // Se compara en pantalla: con el mapa inclinado la cercanía real es la que se ve
            const project = ({ lng, lat }) => map.project([lng, lat])
            const index = nearestEdge(points.map(project), project(point))
            return [...points.slice(0, index + 1), point, ...points.slice(index + 1)]
        })
    }

    // Clic sobre el mapa: coloca puntos mientras se traza; en edición agrega vértices (polígono: en el lado más cercano; línea: al final)
    const mapClick = (point) => {
        if (measure) return addMeasurePoint(point)
        if (panel?.mode === 'draw') return addPoint(point)

        const shape = panel?.mode === 'edit' ? (pending?.id === panel.layerId ? pending : findNode(layers, panel.layerId)) : null
        if (shape?.type === 'polygon') insertPoint(shape.id, point)
        if (shape?.type === 'line') appendPoint(shape.id, point)
    }

    // Mover un punto aplica de inmediato; cancelar la edición conserva la forma como quedó
    const movePoint = (id, index, point) => {
        updateShape(id, (points) => points.map((current, i) => i === index ? point : current))
    }

    const saveLayer = (id, draft) => {
        if (pending?.id === id) {
            setLayers(commitPending(layers, pending, draft))
            setPending(null)
            setActiveId(id)
        } else {
            setLayers(commitInto(layers, id, draft))
        }
        setPanel({ layerId: id, mode: 'view' })
    }

    const openLayer = (id, mode = 'view') => {
        setMeasure(null)
        let next = layers
        if (pending) {
            next = settleCurrent()
        } else if (panel?.mode === 'edit') {
            if (panel.layerId === id) return
            next = commitInto(layers, panel.layerId, draftRef.current)
        }
        setLayers(next)
        setActiveId(id)
        setPanel({ layerId: id, mode })
    }

    // Doble clic en una capa: centra el mapa en su geometría (en una carpeta, en todo lo que contiene).
    // Deja libre el lado derecho, donde se abre el panel.
    const focusLayer = (id) => {
        // Los buffers cuentan: cada punto de una línea con buffer se extiende esa distancia hacia los cuatro lados
        const points = collectShapes([findNode(layers, id)]).flatMap((shape) => {
            if (!shape.buffer) return shape.points
            return shape.points.flatMap(({ lng, lat }) => {
                const dLat = shape.buffer / METERS_PER_DEGREE
                const dLng = dLat / Math.cos(lat * Math.PI / 180)
                return [{ lng: lng - dLng, lat: lat - dLat }, { lng: lng + dLng, lat: lat + dLat }]
            })
        })
        if (!map || points.length === 0) return

        const lngs = points.map(({ lng }) => lng)
        const lats = points.map(({ lat }) => lat)
        const [west, east, south, north] = [Math.min(...lngs), Math.max(...lngs), Math.min(...lats), Math.max(...lats)]
        // El área libre no está centrada en el mapa: se compensa con el desplazamiento del destino
        const offset = [(FOCUS_PADDING.left - FOCUS_PADDING.right) / 2, (FOCUS_PADDING.top - FOCUS_PADDING.bottom) / 2]

        if (west === east && south === north) {
            map.flyTo({ center: [west, south], zoom: Math.max(map.getZoom(), POINT_FOCUS_ZOOM), offset })
            return
        }

        // Zoom que hace caber el recuadro en el área libre. Se calcula aquí y no con fitBounds: con el relieve
        // activo, Mapbox tiene en cuenta la elevación y alejaba el mapa mucho más de lo necesario.
        const { clientWidth, clientHeight } = map.getCanvas()
        const width = Math.max(clientWidth - FOCUS_PADDING.left - FOCUS_PADDING.right, 100)
        const height = Math.max(clientHeight - FOCUS_PADDING.top - FOCUS_PADDING.bottom, 100)
        const spanX = (east - west) / 360
        const spanY = (mercatorY(north) - mercatorY(south)) / (2 * Math.PI)
        const zoom = Math.min(MAX_FOCUS_ZOOM, Math.log2(Math.min(width / spanX, height / spanY) / TILE_SIZE))

        map.easeTo({ center: [(west + east) / 2, (south + north) / 2], zoom, offset })
    }

    // Desde el menú de la capa: la selecciona y abre su panel en modo edición
    const startEditing = (id) => openLayer(id, 'edit')

    // Arrastrar y soltar en el árbol; soltar dentro de una carpeta cerrada la abre
    const moveLayer = (id, targetId, placement) => {
        setLayers(moveNode(layers, id, targetId, placement))
        if (targetId !== null && placement.endsWith('-child') && collapsed.has(targetId)) toggleFolder(targetId)
    }

    const deleteLayer = (id) => {
        const base = settleCurrent()
        const next = removeNode(base, id)

        setLayers(next)
        if (activeId && !findNode(next, activeId)) setActiveId(null)
        if (panel && !findNode(next, panel.layerId)) setPanel(null)
    }

    const editLayer = (id) => setPanel({ layerId: id, mode: 'edit' })

    // Una geometría nueva solo existe al pulsar Guardar: salir del trazado o de su primera edición la descarta.
    // Cancelar la edición de una capa ya guardada conserva lo escrito.
    const closePanel = (draft) => {
        if (pending) {
            setPending(null)
        } else if (panel?.mode === 'edit') {
            setLayers(commitInto(layers, panel.layerId, draft))
        }
        setPanel(null)
    }

    useEffect(() => {
        if (!pending && !measure) return

        const onKeyDown = (event) => {
            if (event.key !== 'Escape') return
            if (measure) setMeasure(null)
            else closePanel(draftRef.current)
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [pending, measure, panel, layers])

    const panelLayer = !panel ? null : pending?.id === panel.layerId ? pending : findNode(layers, panel.layerId)

    const value = {
        layers,
        activeId,
        collapsed,
        panel,
        panelLayer,
        // Herramienta de dibujo en curso: 'point' | 'line' | 'polygon' | null
        // Herramienta de dibujo en curso (incluye 'measure')
        activeTool: measure ? (measure.type === 'profile' ? 'profile' : 'measure') : pending?.type ?? null,
        measure,
        placingPoints: Boolean(measure) || (Boolean(pending) && panel?.mode === 'draw'),
        // Con una línea o polígono en edición, un clic en el mapa agrega vértices
        // Deshacer de la forma que se crea o edita (se muestra en el panel); activo solo si hay algo que deshacer
        canUndo: panel?.layerId === history.layerId && history.stack.length > 0,
        undo,
        beginMove,
        // Con una línea en edición, cada clic la prolonga: se dibuja el tramo hacia el cursor, como al trazar
        extendingLine: panel?.mode === 'edit' && panelLayer?.type === 'line',
        insertingPoints: panel?.mode === 'edit' && (panelLayer?.type === 'polygon' || panelLayer?.type === 'line'),
        pointCount: measure ? measure.points.length : pending?.points.length ?? 0,
        // Formas a pintar sobre el mapa; `handles` = se muestran sus puntos (trazando o editando)
        // Las capas de arriba en el árbol se dibujan encima: el SVG pinta en orden, así que va al revés
        mapShapes: [...collectShapes(layers).filter((shape) => shape.visible).reverse(), ...(pending ? [pending] : [])].map((shape) => ({
            id: shape.id,
            type: shape.type,
            points: shape.points,
            color: preview?.layerId === shape.id && preview.color ? preview.color : shape.color,
            width: preview?.layerId === shape.id && preview.width ? preview.width : shape.width,
            opacity: preview?.layerId === shape.id && preview.opacity !== undefined ? preview.opacity : shape.opacity,
            buffer: preview?.layerId === shape.id && preview.buffer !== undefined ? preview.buffer : shape.buffer,
            icon: preview?.layerId === shape.id && preview.icon ? preview.icon : shape.icon,
            handles: panel?.layerId === shape.id && panel.mode !== 'view',
            movable: panel?.layerId === shape.id && panel.mode === 'edit'
        })).concat(measure ? [{ id: measure.id, type: measure.type, points: measure.points, color: MEASURE_COLOR, handles: true, movable: false }] : []),
        setPreview,
        startMeasure,
        restartMeasure,
        movePoint,
        units,
        setUnit,
        draftRef,
        openLayer,
        focusLayer,
        startEditing,
        deleteLayer,
        moveLayer,
        toggleFolder,
        collapseAll,
        toggleVisible,
        createFolder,
        startShape,
        mapClick,
        saveLayer,
        editLayer,
        closePanel
    }

    return <LayersContext.Provider value={value}>{children}</LayersContext.Provider>
}

export function useLayers () {
    return useContext(LayersContext)
}

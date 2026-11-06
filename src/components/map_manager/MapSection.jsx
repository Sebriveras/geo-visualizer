import { useEffect, useRef, useState } from "preact/hooks"
import { h, render } from "preact"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { InfoSection } from "./InfoSection"
import { FloatingSection } from "./FloatingSection"
import { useLayers } from "../../context/LayersContext"
import { setCursorLocation, useMap, useProfileHover } from "../../context/MapContext"
import { findIcon } from "../map_panel/IconPicker"
import { DEFAULT_BUFFER_OPACITY } from "../map_panel/BufferPicker"
import buffer from "@turf/buffer"

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

// Satelital con calles y relieve; vista inicial en la zona del diseño, en 2D (sin inclinar ni rotar), aunque se puede inclinar
const MAP_OPTIONS = {
    style: 'mapbox://styles/mapbox/satellite-streets-v12',
    center: [-77.9425, 0.5525],
    zoom: 15.5,
    pitch: 0,
    bearing: 0,
    maxPitch: 80,
    antialias: true
}
const TERRAIN_EXAGGERATION = 1.3

// Grosor del trazo (px) y opacidad del relleno de las formas que no los traen (la medición); las capas llevan los suyos
const DEFAULT_WIDTH = 1.5
const DEFAULT_OPACITY = 0.15

const SHAPES = 'kmz-shapes'
const BUFFERS = 'kmz-buffers'
const PROFILE_HOVER = 'kmz-profile-hover'
const HANDLES = 'kmz-handles'

// El icono (40×40) se apoya con su base sobre la coordenada: su centro queda 10 px por encima
const MARKER_OFFSET = [0, -10]

// Dibuja el icono de un marcador. Va en un microtask: estos efectos pueden ejecutarse en pleno render de
// MapSection, y un render anidado de Preact lo deja sin su componente actual ("Hook can only be invoked...")
const paint = (vnode, element) => queueMicrotask(() => render(vnode, element))

const toLngLat = ({ lng, lat }) => ({ lng, lat })
const coordinates = (points) => points.map(({ lng, lat }) => [lng, lat])
const emptyCollection = { type: 'FeatureCollection', features: [] }

const CIRCLE_STEPS = 128
const EARTH_RADIUS = 6371008.8

// Anillo de la circunferencia geodésica de centro `center` que pasa por `edge`
function circleRing (center, edge) {
    const radius = new mapboxgl.LngLat(center.lng, center.lat).distanceTo(new mapboxgl.LngLat(edge.lng, edge.lat)) / EARTH_RADIUS
    const lat = center.lat * Math.PI / 180
    const lng = center.lng * Math.PI / 180

    const ring = Array.from({ length: CIRCLE_STEPS }, (_, step) => {
        const bearing = 2 * Math.PI * step / CIRCLE_STEPS
        const pointLat = Math.asin(Math.sin(lat) * Math.cos(radius) + Math.cos(lat) * Math.sin(radius) * Math.cos(bearing))
        const pointLng = lng + Math.atan2(Math.sin(bearing) * Math.sin(radius) * Math.cos(lat), Math.cos(radius) - Math.sin(lat) * Math.sin(pointLat))
        return [pointLng * 180 / Math.PI, pointLat * 180 / Math.PI]
    })
    return [...ring, ring[0]]
}

// Líneas, polígonos y circunferencias como GeoJSON; `trail` = coordenada hacia la que se estira el último tramo mientras se traza
function shapeFeatures (shapes, trail) {
    return shapes.flatMap(({ id, type, points, color, handles, width = DEFAULT_WIDTH, opacity = DEFAULT_OPACITY }) => {
        if (type === 'point') return []

        const properties = { id, color, width, opacity }

        // Circunferencia: centro + punto del borde (o el cursor mientras se elige); se dibuja el círculo y su radio
        if (type === 'circle') {
            const edge = points[1] ?? (handles && trail)
            if (!points[0] || !edge) return []
            return [
                { type: 'Feature', properties, geometry: { type: 'Polygon', coordinates: [circleRing(points[0], edge)] } },
                { type: 'Feature', properties, geometry: { type: 'LineString', coordinates: coordinates([points[0], edge]) } }
            ]
        }

        const path = handles && trail && points.length > 0 ? [...points, trail] : points

        if (type === 'polygon' && points.length >= 3) {
            return [{ type: 'Feature', properties, geometry: { type: 'Polygon', coordinates: [[...coordinates(points), [points[0].lng, points[0].lat]]] } }]
        }
        if (path.length >= 2) return [{ type: 'Feature', properties, geometry: { type: 'LineString', coordinates: coordinates(path) } }]
        return []
    })
}

// Buffers de las líneas (zona a `buffer` metros a cada lado) como polígonos. Calcularlos es costoso y esta función
// corre en cada movimiento del cursor mientras se traza, así que se reutiliza el último resultado por línea.
const bufferCache = new Map()

function bufferFeatures (shapes) {
    const present = new Set()

    const features = shapes.flatMap(({ id, type, points, color, buffer: meters, opacity = DEFAULT_BUFFER_OPACITY }) => {
        if (type !== 'line' || !meters || points.length < 2) return []
        present.add(id)

        let cached = bufferCache.get(id)
        if (!cached || cached.points !== points || cached.meters !== meters) {
            const area = buffer({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coordinates(points) } }, meters, { units: 'meters' })
            cached = { points, meters, geometry: area?.geometry }
            bufferCache.set(id, cached)
        }
        return cached.geometry ? [{ type: 'Feature', properties: { id, color, opacity }, geometry: cached.geometry }] : []
    })

    bufferCache.forEach((_, id) => present.has(id) || bufferCache.delete(id))
    return features
}

// Vértices visibles (trazando o editando); `movable` permite arrastrarlos
function handleFeatures (shapes) {
    return shapes.flatMap(({ id, type, points, color, handles, movable }) => {
        if (type === 'point' || !handles) return []
        // En la circunferencia solo se marca el centro
        return (type === 'circle' ? points.slice(0, 1) : points).map((point, index) => ({
            type: 'Feature',
            properties: { id, index, color, movable },
            geometry: { type: 'Point', coordinates: [point.lng, point.lat] }
        }))
    })
}

function addMapContent (map) {
    map.addSource('mapbox-dem', { type: 'raster-dem', url: 'mapbox://mapbox.mapbox-terrain-dem-v1', tileSize: 512, maxzoom: 14 })
    map.setTerrain({ source: 'mapbox-dem', exaggeration: TERRAIN_EXAGGERATION })
    map.setFog({})
    map.addLayer({
        id: 'sky',
        type: 'sky',
        paint: { 'sky-type': 'atmosphere', 'sky-atmosphere-sun': [0.0, 0.0], 'sky-atmosphere-sun-intensity': 15 }
    })

    map.addSource(SHAPES, { type: 'geojson', data: emptyCollection })
    map.addSource(HANDLES, { type: 'geojson', data: emptyCollection })
    map.addSource(BUFFERS, { type: 'geojson', data: emptyCollection })

    // El buffer va debajo de todo lo demás: solo es el área, sin borde propio
    map.addLayer({
        id: 'kmz-buffer-fill',
        type: 'fill',
        source: BUFFERS,
        paint: { 'fill-color': ['get', 'color'], 'fill-opacity': ['get', 'opacity'] }
    })

    map.addLayer({
        id: 'kmz-fill',
        type: 'fill',
        source: SHAPES,
        filter: ['==', ['geometry-type'], 'Polygon'],
        paint: { 'fill-color': ['get', 'color'], 'fill-opacity': ['get', 'opacity'] }
    })
    map.addLayer({
        id: 'kmz-line',
        type: 'line',
        source: SHAPES,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': ['get', 'color'], 'line-width': ['get', 'width'] }
    })
    map.addSource(PROFILE_HOVER, { type: 'geojson', data: emptyCollection })
    map.addLayer({
        id: HANDLES,
        type: 'circle',
        source: HANDLES,
        paint: { 'circle-radius': 6, 'circle-color': ['get', 'color'], 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 3 }
    })
    // Punto de la línea del perfil de elevación sobre el que está el cursor en la gráfica (va encima de todo)
    map.addLayer({
        id: 'kmz-profile-hover',
        type: 'circle',
        source: PROFILE_HOVER,
        paint: { 'circle-radius': 7, 'circle-color': '#5ab0e0', 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 2.5 }
    })
}

export function MapSection(){
    const { placingPoints, insertingPoints, extendingLine, pointCount, mapClick, movePoint, beginMove, mapShapes, openLayer, panel } = useLayers()
    const { setMap } = useMap()
    const containerRef = useRef(null)
    const mapRef = useRef(null)
    const markersRef = useRef(new Map())
    // Vértice que se está arrastrando: { id, index }
    const dragRef = useRef(null)
    // Un arrastre que termina en un clic no debe contar como clic sobre el mapa
    const justDraggedRef = useRef(false)
    const [ready, setReady] = useState(false)
    // Posición del cursor sobre el mapa mientras se traza: { x, y (píxeles), lng, lat }
    const [cursor, setCursor] = useState(null)
    const profileHover = useProfileHover()

    // Los listeners del mapa se registran una sola vez; leen siempre lo último desde aquí
    const latest = useRef({})
    latest.current = { mapClick, movePoint, beginMove, placingPoints, insertingPoints, extendingLine, openLayer, panel }

    useEffect(() => {
        if (!TOKEN) return

        mapboxgl.accessToken = TOKEN
        const map = new mapboxgl.Map({ container: containerRef.current, ...MAP_OPTIONS })
        mapRef.current = map

        map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'bottom-right')
        map.addControl(new mapboxgl.GeolocateControl({ trackUserLocation: false }), 'bottom-right')
        map.addControl(new mapboxgl.ScaleControl({ unit: 'metric' }), 'bottom-left')

        map.on('style.load', () => {
            addMapContent(map)
            setMap(map)
            setReady(true)
        })

        // Abre el panel de la línea o polígono bajo el cursor (con un margen para alcanzar los trazos finos);
        // la forma que se está editando se ignora: ahí el clic agrega vértices
        const shapeAt = (point) => {
            const box = [[point.x - 5, point.y - 5], [point.x + 5, point.y + 5]]
            const { panel } = latest.current
            const editing = panel?.mode === 'edit' ? panel.layerId : null
            return map.queryRenderedFeatures(box, { layers: ['kmz-line', 'kmz-fill'] })
                .map((feature) => feature.properties.id)
                .find((id) => id !== 'measure' && id !== editing)
        }
        const openShapeAt = (point) => {
            const id = shapeAt(point)
            if (id === undefined) return false
            latest.current.openLayer(id)
            return true
        }

        map.on('click', (event) => {
            if (justDraggedRef.current) return
            if (map.queryRenderedFeatures(event.point, { layers: [HANDLES] }).length > 0) return
            if (!latest.current.placingPoints && openShapeAt(event.point)) return
            latest.current.mapClick(toLngLat(event.lngLat))
        })

        map.on('mousemove', (event) => {
            if (dragRef.current) return latest.current.movePoint(dragRef.current.id, dragRef.current.index, toLngLat(event.lngLat))
            setCursorLocation(toLngLat(event.lngLat))
            if (latest.current.placingPoints || latest.current.extendingLine) {
                return setCursor({ x: event.point.x, y: event.point.y, ...toLngLat(event.lngLat) })
            }
            if (!map.isMoving() && !latest.current.insertingPoints) {
                map.getCanvas().style.cursor = shapeAt(event.point) === undefined ? '' : 'pointer'
            }
        })
        map.on('mouseout', () => {
            setCursor(null)
            setCursorLocation(null)
        })

        // Arrastrar vértices: mientras dura, el mapa no se desplaza
        const startDrag = (event) => {
            const { id, index, movable } = event.features[0].properties
            if (movable !== true && movable !== 'true') return
            event.preventDefault()
            latest.current.beginMove(id)
            // Mientras se arrastra un vértice no hay tramo hacia el cursor
            setCursor(null)
            dragRef.current = { id, index }
            map.dragPan.disable()
        }
        const endDrag = () => {
            if (!dragRef.current) return
            dragRef.current = null
            map.dragPan.enable()
            justDraggedRef.current = true
            setTimeout(() => { justDraggedRef.current = false }, 50)
        }
        map.on('mousedown', HANDLES, startDrag)
        map.on('touchstart', HANDLES, startDrag)
        map.on('mouseup', endDrag)
        map.on('touchend', endDrag)
        map.on('mouseenter', HANDLES, (event) => {
            const { movable } = event.features[0].properties
            if (movable === true || movable === 'true') map.getCanvas().style.cursor = 'move'
        })
        map.on('mouseleave', HANDLES, () => {
            map.getCanvas().style.cursor = latest.current.placingPoints || latest.current.insertingPoints ? 'crosshair' : ''
        })

        return () => {
            markersRef.current.forEach(({ marker, element }) => {
                marker.remove()
                paint(null, element)
            })
            markersRef.current.clear()
            map.remove()
            mapRef.current = null
            setMap(null)
            setReady(false)
        }
    }, [])

    // Al terminar de trazar no queda cursor que seguir
    useEffect(() => {
        if (!placingPoints && !extendingLine) setCursor(null)
    }, [placingPoints, extendingLine])

    useEffect(() => {
        if (!ready) return
        mapRef.current.getCanvas().style.cursor = placingPoints || insertingPoints ? 'crosshair' : ''
    }, [ready, placingPoints, insertingPoints])

    // Formas y vértices
    useEffect(() => {
        if (!ready) return
        const map = mapRef.current
        const trail = (placingPoints || extendingLine) && cursor ? [cursor.lng, cursor.lat] : null
        map.getSource(SHAPES).setData({
            type: 'FeatureCollection',
            features: shapeFeatures(mapShapes, trail && { lng: trail[0], lat: trail[1] })
        })
        map.getSource(BUFFERS).setData({ type: 'FeatureCollection', features: bufferFeatures(mapShapes) })
        map.getSource(HANDLES).setData({ type: 'FeatureCollection', features: handleFeatures(mapShapes) })
    }, [ready, mapShapes, placingPoints, extendingLine, cursor])

    // Marcador del perfil de elevación
    useEffect(() => {
        if (!ready) return
        mapRef.current.getSource(PROFILE_HOVER).setData(profileHover
            ? { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [profileHover.lng, profileHover.lat] } }
            : emptyCollection)
    }, [ready, profileHover])

    // Puntos: un marcador con el icono elegido, que se arrastra en edición
    useEffect(() => {
        if (!ready) return
        const map = mapRef.current
        const markers = markersRef.current
        const present = new Set()

        mapShapes.forEach(({ id, type, points, icon, movable }) => {
            if (type !== 'point' || points.length === 0) return
            present.add(id)

            let entry = markers.get(id)
            if (!entry) {
                const element = document.createElement('div')
                const marker = new mapboxgl.Marker({ element, anchor: 'center', offset: MARKER_OFFSET })
                    .setLngLat([points[0].lng, points[0].lat])
                    .addTo(map)
                marker.on('dragstart', () => latest.current.beginMove(id))
                marker.on('drag', () => latest.current.movePoint(id, 0, toLngLat(marker.getLngLat())))
                entry = { marker, element }
                markers.set(id, entry)
            }

            entry.marker.setLngLat([points[0].lng, points[0].lat])
            entry.marker.setDraggable(movable)
            // El icono se toca para abrir su panel, salvo al trazar o insertar vértices: ahí no debe tapar esos clics
            const clickable = movable || !(placingPoints || insertingPoints)
            entry.element.style.pointerEvents = clickable ? 'auto' : 'none'
            entry.element.style.cursor = movable ? 'move' : clickable ? 'pointer' : ''
            entry.element.onclick = (event) => {
                event.stopPropagation()
                latest.current.openLayer(id)
            }
            paint(h(findIcon(icon).component, {}), entry.element)
        })

        markers.forEach(({ marker, element }, id) => {
            if (present.has(id)) return
            marker.remove()
            paint(null, element)
            markers.delete(id)
        })
    }, [ready, mapShapes, placingPoints, insertingPoints])

    return(
        <div class="relative w-full flex-1 min-h-0 bg-slate-600">
            {/* El CSS de Mapbox fija position: relative en su contenedor, así que el que llena el área es este envoltorio */}
            <div class="absolute inset-0">
                <div ref={containerRef} class="size-full" />
            </div>

            {!TOKEN && (
                <p class="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-slate-50">
                    Falta el token de Mapbox: define VITE_MAPBOX_TOKEN en .env.local y reinicia el servidor.
                </p>
            )}

            {placingPoints && pointCount === 0 && cursor && (
                <p
                    class="pointer-events-none absolute z-10 whitespace-nowrap rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-white"
                    style={{ left: `${cursor.x + 10}px`, top: `${cursor.y + 10}px` }}
                >
                    Clic para poner un punto
                </p>
            )}
            <FloatingSection/>
            <InfoSection/>
        </div>
    )
}

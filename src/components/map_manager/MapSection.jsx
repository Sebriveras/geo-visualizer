import { useEffect, useRef, useState } from "preact/hooks"
import { h, render } from "preact"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { InfoSection } from "./InfoSection"
import { FloatingSection } from "./FloatingSection"
import { useLayers } from "../../context/LayersContext"
import { useMap } from "../../context/MapContext"
import { findIcon } from "../map_panel/IconPicker"

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

// Satelital con calles y relieve 3D; vista inicial en la zona del diseño, inclinada para apreciar el terreno
const MAP_OPTIONS = {
    style: 'mapbox://styles/mapbox/satellite-streets-v12',
    center: [-77.9425, 0.5525],
    zoom: 15.5,
    pitch: 60,
    bearing: -20,
    maxPitch: 80,
    antialias: true
}
const TERRAIN_EXAGGERATION = 1.3

const SHAPES = 'kmz-shapes'
const HANDLES = 'kmz-handles'

// El icono (40×40) se apoya con su base sobre la coordenada: su centro queda 10 px por encima
const MARKER_OFFSET = [0, -10]

const toLngLat = ({ lng, lat }) => ({ lng, lat })
const coordinates = (points) => points.map(({ lng, lat }) => [lng, lat])
const emptyCollection = { type: 'FeatureCollection', features: [] }

// Líneas y polígonos como GeoJSON; `trail` = coordenada hacia la que se estira el último tramo mientras se traza
function shapeFeatures (shapes, trail) {
    return shapes.flatMap(({ id, type, points, color, handles }) => {
        if (type === 'point') return []

        const path = handles && trail && points.length > 0 ? [...points, trail] : points
        const properties = { id, color }

        if (type === 'polygon' && points.length >= 3) {
            return [{ type: 'Feature', properties, geometry: { type: 'Polygon', coordinates: [[...coordinates(points), [points[0].lng, points[0].lat]]] } }]
        }
        if (path.length >= 2) return [{ type: 'Feature', properties, geometry: { type: 'LineString', coordinates: coordinates(path) } }]
        return []
    })
}

// Vértices visibles (trazando o editando); `movable` permite arrastrarlos
function handleFeatures (shapes) {
    return shapes.flatMap(({ id, type, points, color, handles, movable }) => {
        if (type === 'point' || !handles) return []
        return points.map((point, index) => ({
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

    map.addLayer({
        id: 'kmz-fill',
        type: 'fill',
        source: SHAPES,
        filter: ['==', ['geometry-type'], 'Polygon'],
        paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.25 }
    })
    // Contorno blanco bajo cada trazo para que se distinga sobre la imagen satelital
    map.addLayer({
        id: 'kmz-line-casing',
        type: 'line',
        source: SHAPES,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#ffffff', 'line-width': 6, 'line-opacity': 0.7 }
    })
    map.addLayer({
        id: 'kmz-line',
        type: 'line',
        source: SHAPES,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': ['get', 'color'], 'line-width': 3 }
    })
    map.addLayer({
        id: HANDLES,
        type: 'circle',
        source: HANDLES,
        paint: { 'circle-radius': 6, 'circle-color': ['get', 'color'], 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 3 }
    })
}

export function MapSection(){
    const { placingPoints, insertingPoints, pointCount, mapClick, movePoint, mapShapes } = useLayers()
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

    // Los listeners del mapa se registran una sola vez; leen siempre lo último desde aquí
    const latest = useRef({})
    latest.current = { mapClick, movePoint, placingPoints, insertingPoints }

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

        map.on('click', (event) => {
            if (justDraggedRef.current) return
            if (map.queryRenderedFeatures(event.point, { layers: [HANDLES] }).length > 0) return
            latest.current.mapClick(toLngLat(event.lngLat))
        })

        map.on('mousemove', (event) => {
            if (dragRef.current) return latest.current.movePoint(dragRef.current.id, dragRef.current.index, toLngLat(event.lngLat))
            if (latest.current.placingPoints) setCursor({ x: event.point.x, y: event.point.y, ...toLngLat(event.lngLat) })
        })
        map.on('mouseout', () => setCursor(null))

        // Arrastrar vértices: mientras dura, el mapa no se desplaza
        const startDrag = (event) => {
            const { id, index, movable } = event.features[0].properties
            if (movable !== true && movable !== 'true') return
            event.preventDefault()
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
                render(null, element)
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
        if (!placingPoints) setCursor(null)
    }, [placingPoints])

    useEffect(() => {
        if (!ready) return
        mapRef.current.getCanvas().style.cursor = placingPoints || insertingPoints ? 'crosshair' : ''
    }, [ready, placingPoints, insertingPoints])

    // Formas y vértices
    useEffect(() => {
        if (!ready) return
        const map = mapRef.current
        const trail = placingPoints && cursor ? [cursor.lng, cursor.lat] : null
        map.getSource(SHAPES).setData({
            type: 'FeatureCollection',
            features: shapeFeatures(mapShapes, trail && { lng: trail[0], lat: trail[1] })
        })
        map.getSource(HANDLES).setData({ type: 'FeatureCollection', features: handleFeatures(mapShapes) })
    }, [ready, mapShapes, placingPoints, cursor])

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
                marker.on('drag', () => latest.current.movePoint(id, 0, toLngLat(marker.getLngLat())))
                entry = { marker, element }
                markers.set(id, entry)
            }

            entry.marker.setLngLat([points[0].lng, points[0].lat])
            entry.marker.setDraggable(movable)
            // Solo se puede tocar el icono en edición: así no tapa los clics que colocan puntos
            entry.element.style.pointerEvents = movable ? 'auto' : 'none'
            entry.element.style.cursor = movable ? 'move' : ''
            render(h(findIcon(icon).component, {}), entry.element)
        })

        markers.forEach(({ marker, element }, id) => {
            if (present.has(id)) return
            marker.remove()
            render(null, element)
            markers.delete(id)
        })
    }, [ready, mapShapes])

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

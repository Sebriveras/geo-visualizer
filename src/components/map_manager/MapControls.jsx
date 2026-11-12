import { useEffect, useRef, useState } from 'preact/hooks'
import { LocateFixed, Minus, Plus } from 'lucide-preact'
import mapboxgl from 'mapbox-gl'
import { GhostButton } from '../buttons/GhostButton'
import { useMap } from '../../context/MapContext'

// Ancho (px) sobre el que se mide la escala
const SCALE_WIDTH = 100
// Zoom mínimo al que va "Mi ubicación"
const LOCATE_ZOOM = 16

const POD = 'flex items-center justify-center overflow-clip rounded-2xl bg-white shadow-[0_1px_3px_#0000002e,0_1px_2px_-1px_#0000002e]'

// Escala redondeada (1, 2 o 5 × 10ⁿ) que cabe en SCALE_WIDTH px, al centro vertical del mapa: "500m", "2km"
function scaleLabel (map) {
    const y = map.getContainer().clientHeight / 2
    const meters = map.unproject([0, y]).distanceTo(map.unproject([SCALE_WIDTH, y]))
    if (!Number.isFinite(meters) || meters <= 0) return ''

    const power = 10 ** Math.floor(Math.log10(meters))
    const digit = meters / power
    const nice = (digit >= 5 ? 5 : digit >= 2 ? 2 : 1) * power
    return nice >= 1000 ? `${+(nice / 1000).toFixed(3)}km` : `${+nice.toFixed(3)}m`
}

// Flecha del norte: la mitad oscura apunta al norte
function NorthArrow () {
    return (
        <svg width="8" height="20" viewBox="0 0 8 20" fill="none" aria-hidden="true">
            <path d="M4 0L7.4641 9H0.535898L4 0Z" fill="#1D293D" />
            <path d="M4 20L0.535898 11H7.4641L4 20Z" fill="#CAD5E2" />
        </svg>
    )
}

// Controles flotantes del mapa, abajo a la derecha sobre la barra de información: brújula, mi ubicación, acercar/alejar y escala.
// Reemplazan a los controles nativos de Mapbox (el crédito y el logo de Mapbox se conservan).
export function MapControls () {
    const { map } = useMap()
    const [, refresh] = useState(0)
    const locationMarker = useRef(null)

    useEffect(() => {
        if (!map) return
        const update = () => refresh((count) => count + 1)
        map.on('move', update)
        map.on('resize', update)
        return () => {
            map.off('move', update)
            map.off('resize', update)
            locationMarker.current?.remove()
            locationMarker.current = null
        }
    }, [map])

    if (!map) return null

    const locate = () => {
        if (!navigator.geolocation) return
        navigator.geolocation.getCurrentPosition(({ coords }) => {
            const center = [coords.longitude, coords.latitude]
            if (!locationMarker.current) {
                const dot = document.createElement('div')
                dot.className = 'size-4 rounded-full border-2 border-white bg-[#1d6df2] shadow-[0_0_0_4px_#1d6df233]'
                locationMarker.current = new mapboxgl.Marker({ element: dot })
            }
            locationMarker.current.setLngLat(center).addTo(map)
            map.flyTo({ center, zoom: Math.max(map.getZoom(), LOCATE_ZOOM) })
        })
    }

    const label = scaleLabel(map)

    return (
        <div class="pointer-events-none absolute bottom-11 right-3 z-10 flex items-end justify-end gap-2 *:pointer-events-auto">
            <div class={`${POD} w-8`}>
                <GhostButton size="xs" aria-label="Restablecer el norte" title="Restablecer el norte" onClick={() => map.resetNorthPitch()}>
                    {/* Como la brújula de Mapbox: gira con el rumbo y se inclina en perspectiva con la inclinación del mapa */}
                    <span class="flex h-5 items-center" style={{ perspective: '200px' }}>
                        <span class="flex h-5 items-center" style={{ transformStyle: 'preserve-3d', transform: `scale(${1 / Math.sqrt(Math.cos(map.getPitch() * Math.PI / 180))}) rotateX(${map.getPitch()}deg) rotateZ(${-map.getBearing()}deg)` }}>
                            <NorthArrow />
                        </span>
                    </span>
                </GhostButton>
            </div>

            <div class={POD}>
                <GhostButton size="xs" iconSize={16} leadingIcon={LocateFixed} aria-label="Mi ubicación" title="Mi ubicación" onClick={locate}>{null}</GhostButton>
            </div>

            <div class={POD}>
                <GhostButton size="xs" iconSize={16} leadingIcon={Plus} aria-label="Acercar" title="Acercar" onClick={() => map.zoomIn()}>{null}</GhostButton>
                <span class="h-8 w-px shrink-0 bg-slate-300" />
                <GhostButton size="xs" iconSize={16} leadingIcon={Minus} aria-label="Alejar" title="Alejar" onClick={() => map.zoomOut()}>{null}</GhostButton>
            </div>

            {label && (
                <div class={POD} title="Escala">
                    <span class="flex h-8 min-w-14.25 items-center justify-center px-2 text-sm font-semibold text-[#2c2039]">{label}</span>
                </div>
            )}
        </div>
    )
}

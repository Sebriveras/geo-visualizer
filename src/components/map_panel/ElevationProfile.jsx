import { useEffect, useMemo, useState } from 'preact/hooks'
import { ELEVATION_UNITS } from './geo'
import { LINE_LENGTH_UNITS } from './MeasureContent'
import { sampleProfile } from './profile'
import { setProfileHover, useMap } from '../../context/MapContext'
import { useLayers } from '../../context/LayersContext'

const WIDTH = 352
const HEIGHT = 240
const PAD = { top: 28, right: 6, bottom: 44, left: 78 }
const TICKS = 4
const LINE = '#5ab0e0'
// Relleno bajo la curva (con opacidad), igual al color de las mediciones y del trazado del perfil en el mapa
const FILL = '#FF5303'

const number = (value, decimals) => value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })

// Gráfica simple del perfil de elevación de una polilínea (puntos { lng, lat }). Al pasar el cursor por ella,
// marca ese punto de la gráfica y del trazado en el mapa. Sin datos de relieve muestra un aviso.
export function ElevationProfile ({ points }) {
    const { map } = useMap()
    const { units } = useLayers()
    const [hover, setHover] = useState(null)
    // El relieve se carga por teselas: al terminar de cargar el mapa se vuelve a muestrear
    const [version, setVersion] = useState(0)

    useEffect(() => {
        if (!map) return
        const refresh = () => setVersion((current) => current + 1)
        map.on('idle', refresh)
        return () => map.off('idle', refresh)
    }, [map])

    // Al salir de la gráfica (o del panel) no queda marcador en el mapa
    useEffect(() => () => setProfileHover(null), [])

    const { total, samples } = useMemo(() => sampleProfile(map, points), [map, points, version])
    const valid = samples.filter((sample) => sample.elevation !== null)

    const elevationUnit = ELEVATION_UNITS.find((unit) => unit.id === units.elevation)
    const lengthUnit = LINE_LENGTH_UNITS.find((unit) => unit.id === units.length)
    const elevationText = (meters) => `${number(meters * elevationUnit.factor, 1)} ${elevationUnit.symbol}`
    const distanceText = (meters) => `${number(meters * lengthUnit.factor, lengthUnit.id === 'm' ? 1 : 2)} ${lengthUnit.symbol}`

    if (valid.length < 2) {
        return (
            <div class="flex h-60 w-full shrink-0 items-center justify-center bg-[#1d293d] px-6 text-center text-sm text-slate-300">
                {samples.length === 0 ? 'Pon otro punto para ver el perfil.' : 'Sin datos de relieve en este trazado.'}
            </div>
        )
    }

    const elevations = valid.map((sample) => sample.elevation)
    const min = Math.min(...elevations)
    // Un terreno plano no puede dibujarse con rango 0
    const max = Math.max(...elevations, min + 1)
    const plotWidth = WIDTH - PAD.left - PAD.right
    const plotHeight = HEIGHT - PAD.top - PAD.bottom
    const x = (distance) => PAD.left + distance / total * plotWidth
    const y = (elevation) => PAD.top + (max - elevation) / (max - min) * plotHeight

    const line = valid.map((sample, index) => `${index === 0 ? 'M' : 'L'}${x(sample.distance).toFixed(1)},${y(sample.elevation).toFixed(1)}`).join(' ')
    const area = `${line} L${x(valid[valid.length - 1].distance).toFixed(1)},${PAD.top + plotHeight} L${x(valid[0].distance).toFixed(1)},${PAD.top + plotHeight} Z`

    const move = (event) => {
        const bounds = event.currentTarget.getBoundingClientRect()
        const at = (event.clientX - bounds.left) / bounds.width * WIDTH
        const distance = Math.min(Math.max((at - PAD.left) / plotWidth, 0), 1) * total
        const nearest = valid.reduce((best, sample) => Math.abs(sample.distance - distance) < Math.abs(best.distance - distance) ? sample : best)
        setHover(nearest)
        setProfileHover({ lng: nearest.lng, lat: nearest.lat })
    }
    const leave = () => {
        setHover(null)
        setProfileHover(null)
    }

    return (
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width={WIDTH} height={HEIGHT} class="block w-full shrink-0 bg-[#1d293d] text-white" role="img" aria-label="Perfil de elevación">
            {Array.from({ length: TICKS }, (_, index) => {
                const elevation = max - (max - min) * index / (TICKS - 1)
                return (
                    <g key={index}>
                        <line x1={PAD.left} x2={WIDTH} y1={y(elevation)} y2={y(elevation)} stroke="currentColor" stroke-opacity="0.15" />
                        <text x={PAD.left - 8} y={y(elevation) + 4} text-anchor="end" font-size="11" fill="currentColor">{elevationText(elevation)}</text>
                    </g>
                )
            })}

            <path d={area} fill={FILL} fill-opacity="0.2" />
            <path d={line} fill="none" stroke={LINE} stroke-width="2" stroke-linejoin="round" />

            {[0, 0.5, 1].map((fraction) => (
                <text
                    key={fraction}
                    x={PAD.left + plotWidth * fraction}
                    y={HEIGHT - 16}
                    text-anchor={fraction === 0 ? 'start' : fraction === 1 ? 'end' : 'middle'}
                    font-size="11"
                   
                    fill="currentColor"
                >
                    {fraction === 0 ? `0 ${lengthUnit.symbol}` : distanceText(total * fraction)}
                </text>
            ))}

            {hover && (
                <g pointer-events="none">
                    <line x1={x(hover.distance)} x2={x(hover.distance)} y1={PAD.top} y2={PAD.top + plotHeight} stroke="white" stroke-opacity="0.9" />
                    <circle cx={x(hover.distance)} cy={y(hover.elevation)} r="4.5" fill={LINE} stroke="white" stroke-width="1.5" />
                </g>
            )}

            <rect x={PAD.left} y={0} width={plotWidth + PAD.right} height={PAD.top + plotHeight} fill="transparent" onMouseMove={move} onMouseLeave={leave} />
        </svg>
    )
}

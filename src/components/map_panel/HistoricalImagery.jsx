import { useEffect, useRef, useState } from 'preact/hooks'
import { ChevronFirst, ChevronLast, History } from 'lucide-preact'
import { useLayers } from '../../context/LayersContext'
import { useMap } from '../../context/MapContext'
import { GhostButton } from '../buttons/GhostButton'
import { Header } from './Header'
import { findAvailableYears, tileKey } from './wayback'

// Marcador con el año elegido: globo lila con la punta hacia la barra (forma y sombra del diseño); no recibe el puntero
function Marker ({ year, position }) {
    return (
        <div class="pointer-events-none absolute bottom-[calc(100%-5px)] z-10 h-6.5 w-10.25 -translate-x-1/2" style={{ left: `${position}%` }}>
            <svg width="41" height="25.83" viewBox="2 1 41 25.83" fill="none" aria-hidden="true" class="absolute inset-0 drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
                <path d="M2 6C2 3.239 4.239 1 7 1H38C40.761 1 43 3.239 43 6V17.763C43 20.036 41.467 22.023 39.269 22.6L23.769 26.667C22.937 26.885 22.063 26.885 21.231 26.667L5.731 22.6C3.533 22.023 2 20.036 2 17.763V6Z" fill="#f3e8ff" />
            </svg>
            <span class="absolute inset-x-0 top-0 flex h-5.25 items-center justify-center text-xs font-semibold leading-none text-[#7c33dc]">{year}</span>
        </div>
    )
}

// Barra con una línea por año disponible; el marcador salta de una a otra al arrastrarlo, pulsar la barra o usar el teclado
function YearBar ({ years, current, onSelect }) {
    const trackRef = useRef(null)
    const dragging = useRef(false)
    const first = years[0].year
    const last = years[years.length - 1].year
    const position = (year) => last === first ? 100 : (year - first) / (last - first) * 100

    const pick = (clientX) => {
        const rect = trackRef.current.getBoundingClientRect()
        const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1)
        const target = first + ratio * (last - first)
        onSelect(years.reduce((best, entry) => Math.abs(entry.year - target) < Math.abs(best.year - target) ? entry : best))
    }

    const step = (offset) => {
        const index = years.findIndex((entry) => entry.year === current)
        const next = years[Math.min(Math.max(index + offset, 0), years.length - 1)]
        if (next) onSelect(next)
    }

    const onKeyDown = (event) => {
        const moves = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }
        if (event.key === 'Home') onSelect(years[0])
        else if (event.key === 'End') onSelect(years[years.length - 1])
        else if (event.key in moves) step(moves[event.key])
        else return
        event.preventDefault()
    }

    return (
        <div class="min-w-px flex-1 select-none">
            <div
                role="slider"
                tabIndex={0}
                aria-label="Año de la imagen"
                aria-valuemin={first}
                aria-valuemax={last}
                aria-valuenow={current}
                class="relative -mt-6 cursor-pointer touch-none pt-6 outline-none"
                onKeyDown={onKeyDown}
                onPointerDown={(event) => {
                    dragging.current = true
                    event.currentTarget.setPointerCapture(event.pointerId)
                    pick(event.clientX)
                }}
                onPointerMove={(event) => dragging.current && pick(event.clientX)}
                onPointerUp={() => { dragging.current = false }}
                onPointerCancel={() => { dragging.current = false }}
            >
                <div class="flex h-3 items-center rounded-sm border border-[#62748e] bg-white px-5">
                    <div ref={trackRef} class="relative h-full w-full bg-slate-200">
                        {years.map(({ year }) => (
                            <span key={year} class="absolute inset-y-0 w-px -translate-x-1/2 bg-slate-500" style={{ left: `${position(year)}%` }} />
                        ))}
                        <Marker year={current} position={position(current)} />
                    </div>
                </div>
            </div>

            <div class="mt-1 flex items-center justify-between px-1.5 text-xs text-slate-600">
                <span>{first}</span>
                <span>{last}</span>
            </div>
        </div>
    )
}

// Panel "Imágenes históricas": elige el año de la imagen satelital que se muestra en el mapa.
// El año más reciente es la imagen actual del mapa (historyRelease = null); los demás se dibujan encima (MapSection).
export function HistoricalImagery () {
    const { historyOpen, historyRelease, setHistoryRelease, closeHistory } = useLayers()
    const { map } = useMap()
    // null mientras carga por primera vez; después, los años disponibles en el centro del mapa
    const [years, setYears] = useState(null)
    const [failed, setFailed] = useState(false)
    const selected = useRef(historyRelease)
    selected.current = historyRelease

    useEffect(() => {
        if (!historyOpen || !map) return

        let controller = null
        let timer = null
        let loadedKey = null

        const load = () => {
            const { lng, lat } = map.getCenter()
            const key = tileKey(lng, lat, map.getZoom())
            if (key === loadedKey) return

            loadedKey = key
            controller?.abort()
            controller = new AbortController()
            findAvailableYears(lng, lat, map.getZoom(), controller.signal)
                .then((list) => {
                    setFailed(false)
                    setYears(list)
                    // Conserva el año elegido si sigue disponible aquí; si no, vuelve a la imagen actual
                    const current = selected.current && list.find((entry) => entry.year === selected.current.year)
                    if (!current || current === list[list.length - 1]) setHistoryRelease(null)
                    else if (current.id !== selected.current.id) setHistoryRelease(current)
                })
                .catch((error) => {
                    if (error.name === 'AbortError') return
                    loadedKey = null
                    setFailed(true)
                })
        }
        const onMoveEnd = () => {
            clearTimeout(timer)
            timer = setTimeout(load, 500)
        }

        load()
        map.on('moveend', onMoveEnd)
        return () => {
            map.off('moveend', onMoveEnd)
            clearTimeout(timer)
            controller?.abort()
        }
    }, [historyOpen, map])

    if (!historyOpen) return null

    const latest = years?.[years.length - 1]
    const current = historyRelease?.year ?? latest?.year
    const index = years ? years.findIndex((entry) => entry.year === current) : -1
    const select = (entry) => setHistoryRelease(entry === latest ? null : entry)
    const usable = years && years.length > 1

    return (
        <div class="pointer-events-auto flex w-96 max-w-full flex-col overflow-clip rounded-2xl bg-white shadow-lg">
            <Header icon={History} name="Imágenes históricas" options={false} onClose={closeHistory} />

            <div class="flex items-center gap-3 border-b border-slate-200 px-4 pb-2 pt-6">
                {usable ? (
                    <>
                        <GhostButton size="xs" leadingIcon={ChevronFirst} iconSize={16} disabled={index <= 0} onClick={() => select(years[index - 1])} aria-label="Año anterior" title="Año anterior">{null}</GhostButton>
                        <YearBar years={years} current={current} onSelect={select} />
                        <GhostButton size="xs" leadingIcon={ChevronLast} iconSize={16} disabled={index >= years.length - 1} onClick={() => select(years[index + 1])} aria-label="Año siguiente" title="Año siguiente">{null}</GhostButton>
                    </>
                ) : (
                    <p class="w-full pb-4 text-center text-sm text-slate-600">
                        {failed
                            ? 'No se pudieron cargar las imágenes históricas'
                            : years ? 'No hay imágenes históricas distintas en esta zona' : 'Buscando imágenes disponibles…'}
                    </p>
                )}
            </div>
        </div>
    )
}

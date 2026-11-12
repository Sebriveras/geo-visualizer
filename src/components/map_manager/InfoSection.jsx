import { useEffect, useState } from 'preact/hooks'
import { useLayers } from '../../context/LayersContext'
import { useCursorLocation, useMap } from '../../context/MapContext'
import { COORDINATE_FORMATS, ELEVATION_UNITS, elevationAt, formatCoordinates } from '../map_panel/geo'

// Coordenadas y elevación del terreno bajo el cursor (o del centro del mapa si el cursor está fuera), en las unidades elegidas
export function InfoSection(){
    const { map } = useMap()
    const { units } = useLayers()
    const cursor = useCursorLocation()
    const [, refresh] = useState(0)

    // Sin cursor sobre el mapa, los valores son los del centro y cambian al moverlo
    useEffect(() => {
        if (!map) return
        const update = () => refresh((count) => count + 1)
        map.on('move', update)
        return () => map.off('move', update)
    }, [map])

    const location = cursor ?? map?.getCenter()
    const format = COORDINATE_FORMATS.find((item) => item.id === units.coordinates)
    const unit = ELEVATION_UNITS.find((item) => item.id === units.elevation)
    const elevation = location ? elevationAt(map, location) : null

    return(
        <div class="absolute inset-x-0 bottom-0 flex items-center justify-end gap-2 bg-black/80 px-2.5 py-1.5">
            {/* Fecha fija mientras no haya datos reales */}
            <p class="mr-auto truncate text-sm text-slate-50">Última actualización: 03/11/2026</p>
            <p class="truncate text-right text-sm text-slate-50">{location ? formatCoordinates(location, format.id) : '—'}</p>
            <p class="truncate text-right text-sm text-slate-50">
                {elevation === null ? '—' : `${Math.round(elevation * unit.factor).toLocaleString('en-US')} ${unit.symbol}`}
            </p>
        </div>
    )
}

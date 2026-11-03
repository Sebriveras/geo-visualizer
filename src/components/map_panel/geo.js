export const COORDINATE_FORMATS = [
    { id: 'dms', label: 'Grados, minutos, segundos', symbol: '' },
    { id: 'decimal', label: 'Grados decimales', symbol: '' }
]

export const ELEVATION_UNITS = [
    { id: 'm', label: 'Metros', symbol: 'm', factor: 1, decimals: 0 },
    { id: 'ft', label: 'Pies', symbol: 'ft', factor: 3.28084, decimals: 0 }
]

function toDms (value, positive, negative) {
    const abs = Math.abs(value)
    const degrees = Math.floor(abs)
    const minutes = Math.floor((abs - degrees) * 60)
    const seconds = ((abs - degrees) * 60 - minutes) * 60
    return `${degrees}°${String(minutes).padStart(2, '0')}'${seconds.toFixed(2).padStart(5, '0')}"${value >= 0 ? positive : negative}`
}

// point: { lng, lat }
export function formatCoordinates ({ lng, lat }, format) {
    if (format === 'decimal') return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    return `${toDms(lat, 'N', 'S')} ${toDms(lng, 'E', 'W')}`
}

// Elevación del terreno en metros (sin exageración) o null si el mapa aún no tiene el relieve cargado
export function elevationAt (map, { lng, lat }) {
    const elevation = map?.queryTerrainElevation([lng, lat], { exaggerated: false })
    return typeof elevation === 'number' ? elevation : null
}

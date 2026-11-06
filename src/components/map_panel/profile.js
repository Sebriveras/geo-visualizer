import { elevationAt } from './geo'

const EARTH_RADIUS = 6371008.8

function distance (a, b) {
    const toRad = (degrees) => degrees * Math.PI / 180
    const dLat = toRad(b.lat - a.lat)
    const dLng = toRad(b.lng - a.lng)
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
    return 2 * EARTH_RADIUS * Math.asin(Math.sqrt(h))
}

// Perfil de elevación a lo largo de una polilínea: `count` muestras repartidas a igual distancia, cada una
// { distance (m desde el inicio), lng, lat, elevation (m, null si el relieve de ese punto aún no está cargado) }.
// Las posiciones se interpolan linealmente entre vértices (suficiente para tramos de pocos kilómetros).
export function sampleProfile (map, points, count = 120) {
    const legs = points.slice(1).map((point, index) => distance(points[index], point))
    const total = legs.reduce((sum, leg) => sum + leg, 0)
    if (total === 0) return { total, samples: [] }

    const samples = Array.from({ length: count }, (_, step) => {
        const at = total * step / (count - 1)

        let covered = 0
        let leg = 0
        while (leg < legs.length - 1 && covered + legs[leg] < at) {
            covered += legs[leg]
            leg += 1
        }

        const t = legs[leg] === 0 ? 0 : (at - covered) / legs[leg]
        const from = points[leg]
        const to = points[leg + 1]
        const lng = from.lng + (to.lng - from.lng) * t
        const lat = from.lat + (to.lat - from.lat) * t

        return { distance: at, lng, lat, elevation: elevationAt(map, { lng, lat }) }
    })

    return { total, samples }
}

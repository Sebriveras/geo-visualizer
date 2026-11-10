// Imágenes históricas de Esri World Imagery Wayback: una lista pública de versiones (con fecha) y, por cada una,
// un servicio de teselas. Si una tesela no cambió desde una versión anterior, el servicio redirige a la versión
// en la que cambió por última vez; eso permite saber en qué fechas la imagen cambió realmente en un lugar.
const CONFIG_URL = 'https://s3-us-west-2.amazonaws.com/config.maptiles.arcgis.com/waybackconfig.json'

// Zoom máximo de las teselas de Wayback (a más zoom, Mapbox amplía la última disponible)
export const WAYBACK_MAX_ZOOM = 18
export const WAYBACK_ATTRIBUTION = 'Esri, Maxar, Earthstar Geographics'

let releasesPromise = null

// Versiones ordenadas por fecha: [{ id, date: 'AAAA-MM-DD', year, template }]. Se descarga una vez; si falla, se reintenta la próxima vez.
function loadReleases () {
    releasesPromise ??= fetch(CONFIG_URL)
        .then((response) => {
            if (!response.ok) throw new Error(`Wayback respondió ${response.status}`)
            return response.json()
        })
        .then((config) => Object.entries(config)
            .map(([id, release]) => {
                const date = release.itemTitle.match(/\d{4}-\d{2}-\d{2}/)?.[0]
                return { id, date, year: Number(date?.slice(0, 4)), template: release.itemURL }
            })
            .filter((release) => release.date)
            .sort((a, b) => a.date.localeCompare(b.date)))
        .catch((error) => {
            releasesPromise = null
            throw error
        })

    return releasesPromise
}

// URL de teselas para Mapbox ({z}/{x}/{y}); el servicio las pide como nivel/fila/columna
export const tileTemplate = (release) => release.template.replace('{level}', '{z}').replace('{row}', '{y}').replace('{col}', '{x}')

function tileOf (lng, lat, zoom) {
    const scale = 2 ** zoom
    const sin = Math.sin(lat * Math.PI / 180)
    return {
        x: Math.floor((lng + 180) / 360 * scale),
        y: Math.floor((0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale)
    }
}

const levelFor = (zoom) => Math.min(Math.max(Math.round(zoom), 8), 16)

// Identifica la tesela que se consulta: mientras no cambie al mover el mapa, los años disponibles siguen siendo los mismos
export function tileKey (lng, lat, zoom) {
    const level = levelFor(zoom)
    const { x, y } = tileOf(lng, lat, level)
    return `${level}/${x}/${y}`
}

// Años en los que la imagen cambió en el punto dado: [{ id, year, date, template }] del más antiguo al más reciente.
// Solo consulta una tesela por año (la de su última versión), así que son pocas peticiones.
export async function findAvailableYears (lng, lat, zoom, signal) {
    const releases = await loadReleases()
    const byId = new Map(releases.map((release) => [release.id, release]))
    const level = levelFor(zoom)
    const { x, y } = tileOf(lng, lat, level)

    const lastOfYear = new Map()
    releases.forEach((release) => lastOfYear.set(release.year, release))

    const results = await Promise.all([...lastOfYear.values()].map(async (release) => {
        const url = release.template.replace('{level}', level).replace('{row}', y).replace('{col}', x)
        try {
            // HEAD basta: la versión real de la tesela está en la URL a la que redirige
            const response = await fetch(url, { method: 'HEAD', signal })
            if (!response.ok) return null
            return response.url.match(/\/tile\/(\d+)\//)?.[1] ?? null
        } catch (error) {
            if (error.name === 'AbortError') throw error
            return null
        }
    }))

    // Cada versión distinta es una imagen distinta; por año se conserva la más reciente
    const byYear = new Map()
    new Set(results.filter(Boolean)).forEach((id) => {
        const release = byId.get(id)
        if (!release) return
        const current = byYear.get(release.year)
        if (!current || release.date > current.date) byYear.set(release.year, release)
    })

    return [...byYear.values()].sort((a, b) => a.year - b.year)
}

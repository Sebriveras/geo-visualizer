// Lee unas coordenadas escritas a mano y devuelve { lat, lng }, o null si no son válidas. Acepta:
//   decimales: "0.5525, -77.9425" · "0.5525 -77.9425" (latitud primero)
//   con letras: "0.5525N 77.9425W" · "N 0.5525, W 77.9425" (la letra decide cuál es la latitud)
//   grados, minutos y segundos: 0°33'08.91"N 77°56'33.27"W
const NUMBER = '\\d+(?:\\.\\d+)?'
const COMPONENT = new RegExp(`(?:([NSEW])\\s*)?(-?${NUMBER})\\s*°?\\s*(?:(${NUMBER})\\s*')?\\s*(?:(${NUMBER})\\s*")?\\s*([NSEW])?`, 'y')

export function parseCoordinates (text) {
    const source = text
        .toUpperCase()
        .replace(/[′’‘]/g, "'")
        .replace(/[″”“]/g, '"')
        .replace(/[º˚]/g, '°')
        .trim()
    if (!source) return null

    const parts = []
    let position = 0
    while (position < source.length) {
        const separator = /[\s,;]*/y
        separator.lastIndex = position
        separator.exec(source)
        position = separator.lastIndex
        if (position >= source.length) break

        COMPONENT.lastIndex = position
        const match = COMPONENT.exec(source)
        if (!match || match[0] === '') return null
        position = COMPONENT.lastIndex

        const [, before, degrees, minutes = '0', seconds = '0', after] = match
        const letter = before ?? after
        if (before && after) return null
        if (Number(minutes) >= 60 || Number(seconds) >= 60) return null

        const magnitude = Math.abs(Number(degrees)) + Number(minutes) / 60 + Number(seconds) / 3600
        const negative = letter ? letter === 'S' || letter === 'W' : degrees.startsWith('-')
        parts.push({ letter, value: negative ? -magnitude : magnitude })
    }
    if (parts.length !== 2) return null

    const [first, second] = parts
    let lat = first.value
    let lng = second.value
    if (first.letter || second.letter) {
        // Con letras, N/S marca la latitud y E/W la longitud, en cualquier orden
        const isLat = (part) => part.letter === 'N' || part.letter === 'S'
        const isLng = (part) => part.letter === 'E' || part.letter === 'W'
        if (isLat(first) && isLng(second)) { lat = first.value; lng = second.value }
        else if (isLng(first) && isLat(second)) { lat = second.value; lng = first.value }
        else return null
    }

    return Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? { lat, lng } : null
}

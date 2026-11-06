import { createContext } from 'preact'
import { useContext, useEffect, useState } from 'preact/hooks'

const MapContext = createContext(null)

// Guarda la instancia de Mapbox que crea MapSection para que el resto de la app pueda consultarla
// (proyectar coordenadas, elevación del terreno, centro). Es null hasta que el mapa existe.
export function MapProvider ({ children }) {
    const [map, setMap] = useState(null)

    return <MapContext.Provider value={{ map, setMap }}>{children}</MapContext.Provider>
}

export function useMap () {
    return useContext(MapContext)
}

// Coordenada bajo el cursor ({ lng, lat } o null). Vive fuera del contexto para que, al moverse el mouse,
// solo se vuelva a pintar quien la usa y no toda la app.
let cursorLocation = null
const cursorListeners = new Set()

export function setCursorLocation (location) {
    cursorLocation = location
    cursorListeners.forEach((listener) => listener(location))
}

export function useCursorLocation (enabled = true) {
    const [location, setLocation] = useState(cursorLocation)

    useEffect(() => {
        if (!enabled) return
        setLocation(cursorLocation)
        cursorListeners.add(setLocation)
        return () => cursorListeners.delete(setLocation)
    }, [enabled])

    return enabled ? location : null
}

// Punto del trazado del perfil de elevación sobre el que está el cursor en la gráfica ({ lng, lat } o null);
// el mapa lo dibuja como un marcador sobre la línea.
let profileHover = null
const profileHoverListeners = new Set()

export function setProfileHover (location) {
    profileHover = location
    profileHoverListeners.forEach((listener) => listener(location))
}

export function useProfileHover () {
    const [location, setLocation] = useState(profileHover)

    useEffect(() => {
        setLocation(profileHover)
        profileHoverListeners.add(setLocation)
        return () => profileHoverListeners.delete(setLocation)
    }, [])

    return location
}

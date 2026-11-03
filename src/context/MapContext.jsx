import { createContext } from 'preact'
import { useContext, useState } from 'preact/hooks'

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

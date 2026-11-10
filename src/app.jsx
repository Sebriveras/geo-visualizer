import { useState } from "preact/hooks"
import { LayersProvider } from "./context/LayersContext"
import { MapProvider } from "./context/MapContext"
import { LayerManger } from "./components/layer_manager/LayerManager"
import { LayerHeader } from "./components/layer_manager/LayerHeader"
import { MapActionPanel } from "./components/map_manager/MapActionPanel"
import { MapManager } from "./components/map_manager/MapManager"

const STORAGE_KEY = 'kmz.sidebarCollapsed'

// El panel de capas puede ocultarse con la pestaña del mapa; se recuerda entre visitas
function useSidebarCollapsed () {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })

  const toggle = () => {
    const next = !collapsed
    setCollapsed(next)
    try {
      localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
    } catch {}
  }

  return [collapsed, toggle]
}

export function App() {
  const [sidebarCollapsed, toggleSidebar] = useSidebarCollapsed()

  return (
    <MapProvider>
    <LayersProvider>
      <div class="flex flex-col h-screen overflow-hidden">

        <div class="flex flex-col flex-1 min-h-0 w-full">{/*Content*/}
          {/* Fila superior: título del proyecto y herramientas; siempre visible */}
          <div class="flex w-full shrink-0">
            <LayerHeader/>
            <MapActionPanel/>
          </div>

          {/* Fila inferior: capas (colapsable) y mapa */}
          <div class="flex flex-1 min-h-0 w-full">
            <LayerManger collapsed={sidebarCollapsed}/>

            <MapManager sidebarCollapsed={sidebarCollapsed} onToggleSidebar={toggleSidebar}/>
          </div>
        </div>
      </div>
    </LayersProvider>
    </MapProvider>
  )
}

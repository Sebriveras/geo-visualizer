import { useState } from "preact/hooks"
import { LayersProvider } from "./context/LayersContext"
import { MapProvider } from "./context/MapContext"
import { LayerManger } from "./components/layer_manager/LayerManager"
import { LayerHeader } from "./components/layer_manager/LayerHeader"
import { MapActionPanel } from "./components/map_manager/MapActionPanel"
import { MapManager } from "./components/map_manager/MapManager"
import { Sidebar } from "./components/sidebar/Sidebar"
import { Header } from "./components/header/Header"

// Un interruptor (oculto / visible) que se recuerda entre visitas
function usePersistedFlag (key) {
  const [on, setOn] = useState(() => {
    try {
      return localStorage.getItem(key) === '1'
    } catch {
      return false
    }
  })

  const toggle = () => {
    const next = !on
    setOn(next)
    try {
      localStorage.setItem(key, next ? '1' : '0')
    } catch {}
  }

  return [on, toggle]
}

export function App() {
  // El panel de capas se oculta con la pestaña del mapa; la barra lateral de iconos, con el botón del encabezado
  const [sidebarCollapsed, toggleSidebar] = usePersistedFlag('kmz.sidebarCollapsed')
  const [menuHidden, toggleMenu] = usePersistedFlag('kmz.menuHidden')

  return (
    <MapProvider>
    <LayersProvider>
      <div class="flex flex-col h-screen overflow-hidden">
        <Header menuHidden={menuHidden} onToggleMenu={toggleMenu}/>

        <div class="flex flex-row flex-1 min-h-0 w-full">{/*Content*/}
          {/* Barra lateral de iconos (se desliza al ocultarla) */}
          <div class={`h-full shrink-0 overflow-hidden transition-[width] duration-200 ease-out motion-reduce:transition-none ${menuHidden ? 'w-0' : 'w-13'}`} inert={menuHidden}>
            <Sidebar/>
          </div>

          <div class="flex flex-col flex-1 min-w-0 min-h-0">
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
      </div>
    </LayersProvider>
    </MapProvider>
  )
}

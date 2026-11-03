import { LayersProvider } from "./context/LayersContext"
import { MapProvider } from "./context/MapContext"
import { LayerManger } from "./components/layer_manager/LayerManager"
import { MapManager } from "./components/map_manager/MapManager"
import { Sidebar } from "./components/sidebar/Sidebar"
import { Header } from "./components/header/Header"

export function App() {

  return (
    <MapProvider>
    <LayersProvider>
      <div class="flex flex-col h-screen overflow-hidden">
        <Header/>
        <div class="flex flex-row flex-1 min-h-0 w-full">{/*Content*/}
          <Sidebar/>

          <LayerManger/>

          <MapManager/>

        </div>
      </div>
    </LayersProvider>
    </MapProvider>
  )
}

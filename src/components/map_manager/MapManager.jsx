import { MapActionPanel } from "./MapActionPanel"
import { MapSection } from "./MapSection"

export function MapManager () {
    return(
        <div class="flex flex-col flex-1 min-w-0 h-full">

          <MapActionPanel/>

          <MapSection/>
          
        </div>
    )
}
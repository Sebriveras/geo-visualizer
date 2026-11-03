import { MapPanel } from "../map_panel/MapPanel"

export function FloatingSection(){
    return(
        <div class="pointer-events-none absolute inset-0 flex flex-col items-end p-3">
            <MapPanel/>
        </div>
    )
}

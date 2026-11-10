import { MapPanel } from "../map_panel/MapPanel"
import { HistoricalImagery } from "../map_panel/HistoricalImagery"

export function FloatingSection(){
    return(
        <div class="pointer-events-none absolute inset-0 flex flex-col items-end p-3 pb-46">
            <MapPanel/>
            <div class="absolute left-0 top-0 p-3">
                <HistoricalImagery/>
            </div>
        </div>
    )
}

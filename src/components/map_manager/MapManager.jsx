import { MapSection } from "./MapSection"

// collapsed / onToggleCollapsed: estado de la pestaña que oculta el panel de capas
export function MapManager ({ sidebarCollapsed, onToggleSidebar }) {
    return(
        <div class="flex flex-col flex-1 min-w-0 h-full">
          <MapSection sidebarCollapsed={sidebarCollapsed} onToggleSidebar={onToggleSidebar}/>
        </div>
    )
}

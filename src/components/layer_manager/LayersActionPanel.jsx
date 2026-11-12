import { FolderPlus, ListChevronsDownUp } from 'lucide-preact'
import { GhostButton } from '../buttons/GhostButton'
import { Tooltip } from '../tooltip/Tooltip'
import { SearchField } from '../input/SearchField'
import { useLayers } from '../../context/LayersContext'

// query / onQuery: el texto del filtro de capas, que vive en LayerManager
export function LayersActionPanel ({ query, onQuery }) {
    const { createFolder, collapseAll } = useLayers()

    const ACTIONS = [
        // Una carpeta nueva podría quedar fuera de un filtro activo: se limpia para verla
        { label: 'Nueva carpeta', tooltip: 'Crear carpeta', icon: FolderPlus, onClick: () => { onQuery(''); createFolder() } },
        { label: 'Colapsar todo', tooltip: 'Colapsar capas', icon: ListChevronsDownUp, onClick: collapseAll }
    ]

    return (
        <div class="flex h-12 w-full shrink-0 items-center gap-1 border-b border-slate-200 pl-3 pr-2">
            <SearchField value={query} onInput={onQuery} placeholder="Filtrar capas" class="flex-1" />

            {ACTIONS.map(({ label, tooltip, icon, onClick }) => (
                <Tooltip key={label} label={tooltip}>
                    <GhostButton
                        size="sm"
                        iconSize={14}
                        leadingIcon={icon}
                        aria-label={label}
                        onClick={onClick}
                    >
                        {null}
                    </GhostButton>
                </Tooltip>
            ))}
        </div>
    )
}

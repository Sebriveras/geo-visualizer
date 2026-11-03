import { FolderPlus, ListChevronsDownUp, RefreshCw, Search } from 'lucide-preact'
import { GhostButton } from '../buttons/GhostButton'
import { useLayers } from '../../context/LayersContext'

export function LayersActionPanel () {
    const { createFolder, collapseAll } = useLayers()

    const ACTIONS = [
        { label: 'Buscar', icon: Search },
        { label: 'Actualizar', icon: RefreshCw },
        { label: 'Nueva carpeta', icon: FolderPlus, onClick: createFolder },
        { label: 'Colapsar todo', icon: ListChevronsDownUp, onClick: collapseAll }
    ]

    return (
        <div class="flex h-13 w-full items-center gap-1 border-b border-slate-200 py-2 pl-3 pr-2">
            <p class="min-w-px flex-1 text-base font-semibold leading-normal text-slate-700">Capas</p>

            {ACTIONS.map(({ label, icon, onClick }) => (
                <GhostButton
                    key={label}
                    size="sm"
                    iconSize={14}
                    leadingIcon={icon}
                    aria-label={label}
                    title={label}
                    onClick={onClick}
                >
                    {null}
                </GhostButton>
            ))}
        </div>
    )
}

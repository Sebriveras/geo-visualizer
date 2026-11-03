import { ArrowLeft } from 'lucide-preact'
import { GhostButton } from '../buttons/GhostButton'

// Solo visual: botón de volver y nombre del proyecto
export function LayerHeader ({ title = 'COLLAGT3' }){
    return(
        <div class="flex h-13 w-full shrink-0 items-center gap-2 bg-slate-50 px-2">
            <GhostButton size="sm" iconSize={14} leadingIcon={ArrowLeft} aria-label="Volver" title="Volver">
                {null}
            </GhostButton>
            <h1 class="min-w-px flex-1 truncate text-xl font-semibold leading-normal text-gray-700">{title}</h1>
        </div>
    )
}

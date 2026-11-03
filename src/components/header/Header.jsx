import { Bell, CircleHelp, PanelLeft, Settings } from 'lucide-preact'
import { GhostButton } from '../buttons/GhostButton'
import UnergyIcon from '../../assets/UnergyIcon'

function IconButton ({ label, icon, ...props }) {
    return (
        <GhostButton size="xs" iconSize={14} leadingIcon={icon} aria-label={label} title={label} {...props}>
            {null}
        </GhostButton>
    )
}

export function Header(){
    return(
        <header class="flex h-12 w-full shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-4">
            <div class="flex min-w-px flex-1 items-center gap-1">
                <UnergyIcon aria-label="Unergy" />
                <div class="flex h-4 w-6 shrink-0 items-center justify-center" aria-hidden="true">
                    <div class="h-full w-px bg-slate-200" />
                </div>
                <IconButton label="Mostrar u ocultar menú" icon={PanelLeft} />
            </div>

            <IconButton label="Ayuda" icon={CircleHelp} />
            <IconButton label="Configuración" icon={Settings} />
            <IconButton label="Notificaciones" icon={Bell} showAlertDot />
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700" title="Usuario">AV</div>
        </header>
    )
}

import { useState } from 'preact/hooks'
import { Bell, BookOpen, Calendar, ChartColumn, FileText, FolderOpen, Layers, Map, MapPin, Settings, Users, Wrench, Zap } from 'lucide-preact'

// Solo visual: grupos de ejemplo con icono de título y cuatro accesos cada uno
const GROUPS = [
    { id: 'main', title: Layers, items: [
        { id: 'layers', label: 'Capas', icon: Map },
        { id: 'places', label: 'Lugares', icon: MapPin },
        { id: 'files', label: 'Archivos', icon: FolderOpen },
        { id: 'reports', label: 'Reportes', icon: FileText }
    ] },
    { id: 'data', title: ChartColumn, items: [
        { id: 'stats', label: 'Estadísticas', icon: ChartColumn },
        { id: 'energy', label: 'Energía', icon: Zap },
        { id: 'calendar', label: 'Calendario', icon: Calendar },
        { id: 'docs', label: 'Documentación', icon: BookOpen }
    ] },
    { id: 'admin', title: Settings, items: [
        { id: 'users', label: 'Usuarios', icon: Users },
        { id: 'alerts', label: 'Alertas', icon: Bell },
        { id: 'tools', label: 'Herramientas', icon: Wrench },
        { id: 'settings', label: 'Ajustes', icon: Settings }
    ] }
]

function SidebarTitle ({ icon: Icon }) {
    return (
        <div class="flex size-8 shrink-0 items-center justify-center rounded-lg text-[#2c2039]">
            <Icon size={12} />
        </div>
    )
}

function SidebarMenuItem ({ icon: Icon, label, active, onClick }) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            aria-current={active ? 'page' : undefined}
            onClick={onClick}
            class={`flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-lg px-2 ${active ? 'bg-[#e8e8ff] text-[#2c2039]' : 'text-slate-500 hover:bg-slate-100'}`}
        >
            <Icon size={14} />
        </button>
    )
}

export function Sidebar(){
    const [activeId, setActiveId] = useState('layers')

    return(
        <nav aria-label="Menú principal" class="flex h-full w-13 shrink-0 flex-col items-center gap-1 border-r border-slate-200 bg-slate-50 py-2">
            {GROUPS.map((group) => (
                <div key={group.id} class="flex flex-col items-center gap-1">
                    <SidebarTitle icon={group.title} />
                    <div class="flex flex-col items-start gap-1">
                        {group.items.map((item) => (
                            <SidebarMenuItem
                                key={item.id}
                                icon={item.icon}
                                label={item.label}
                                active={activeId === item.id}
                                onClick={() => setActiveId(item.id)}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </nav>
    )
}

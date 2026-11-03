const COORDINATES = `0°33'08.91"N 77°56'33.27"W`
const ELEVATION = '2,981 m'

export function InfoSection(){
    return(
        <div class="absolute inset-x-0 bottom-0 flex items-center justify-end gap-2 bg-black/80 px-2.5 py-1.5">
            <p class="truncate text-right text-sm text-slate-50">{COORDINATES}</p>
            <p class="truncate text-right text-sm text-slate-50">{ELEVATION}</p>
        </div>
    )
}

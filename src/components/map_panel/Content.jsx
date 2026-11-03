export function Content({ name, value, trailing }) {
    return(
        <div class="relative flex w-full items-center gap-1 border-b border-slate-200 px-4 py-3">
            <div class="flex min-w-px flex-1 flex-col gap-1.5">
                <p class="truncate text-sm font-semibold text-slate-600">{name}</p>
                <p class="text-sm text-slate-700">{value}</p>
            </div>
            {trailing}
        </div>
    )
}

import { TonalButton } from '../buttons/TonalButton'
import { OutlineButton } from '../buttons/OutlineButton'

export function Footer({ icon, label, onClick, variant = 'tonal' }){
    const Button = variant === 'outline' ? OutlineButton : TonalButton

    return(
        <div class="flex w-full shrink-0 items-center justify-end gap-2 bg-slate-100 p-3">
            <Button leadingIcon={icon} onClick={onClick}>{label}</Button>
        </div>
    )
}

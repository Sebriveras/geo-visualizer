import { useEffect, useRef } from 'preact/hooks'

export function InputTitle({ autoFocus = false, class: className = '', ...props }){
    const inputRef = useRef(null)

    useEffect(() => {
        if (autoFocus) {
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [])

    return(
        <input
            ref={inputRef}
            type="text"
            class={`min-w-px rounded-sm border-[1.5px] border-transparent px-1 text-base font-semibold leading-normal text-slate-700 outline-none selection:bg-blue-100 hover:border-slate-300 focus:border-[#51a2ff] ${className}`}
            {...props}
        />
    )
}

import { useEffect } from "react"

const useOnClickOutside = (ref: React.MutableRefObject<HTMLElement | null>, handler: () => void) => {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            if(!ref.current || ref.current.contains(event.target as Node | null)) {
                return
            }

            handler()
        }

        document.addEventListener('mousedown', listener)
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        }
    }, [handler, ref])
}

export default useOnClickOutside;
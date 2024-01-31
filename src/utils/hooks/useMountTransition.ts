import { useEffect, useState } from "react";

type UseMountTransitionProps = {
    isMounted: boolean;
    mountDelay?: number;
}

const useMountTransition = ({ isMounted, mountDelay = 1000 }: UseMountTransitionProps) => {
    const [isTransitioning, setIsTransitioning] = useState<boolean>(false)

    
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if(isMounted && !isTransitioning) {
            setIsTransitioning(true);
        } else if(!isMounted && isTransitioning) {
            timeoutId = setTimeout(() => setIsTransitioning(false), mountDelay)
        }

        return () => {
            if(timeoutId) clearTimeout(timeoutId);
        }

    }, [isMounted, isTransitioning, mountDelay])

    return isTransitioning;
}

export default useMountTransition;
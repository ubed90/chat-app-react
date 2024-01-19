import { useEffect, useState } from "react";

type WindowSize = {
    width: number;
    height: number;
}

const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState<WindowSize>({ width: window.innerWidth, height: window.innerHeight });

    const handleResize = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }

    useEffect(() => {
      window.addEventListener('resize', handleResize);
    
      return () => {
        window.removeEventListener('resize', handleResize);
      }
    }, [])
    
    return windowSize
}

export default useWindowSize;
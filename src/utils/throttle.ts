/* eslint-disable @typescript-eslint/no-explicit-any */
const throttle = (fn: any, delay = 500) => {
    let inThrottle = false;
    let shouldRunAgain: any[] | undefined;

    const timerFunc = () => {
        if(shouldRunAgain === undefined) {
            inThrottle = false;
        } else {
            fn(...shouldRunAgain);
            shouldRunAgain = undefined
            setTimeout(timerFunc, delay);
        }
    }
    
    return (...args: any[]) => {
        if(inThrottle) {
            shouldRunAgain = args
            return;
        }

        fn(...args);
        inThrottle = true;

        setTimeout(timerFunc, delay);
    }
}

export default throttle;
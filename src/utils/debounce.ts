/* eslint-disable @typescript-eslint/no-explicit-any */
const debounce = (fn: any, delay = 300) => {
    let timeoutID: NodeJS.Timeout;
    
    return (...args: any[]) => {
        clearTimeout(timeoutID);
        timeoutID = setTimeout(() => {
            fn(...args)
        }, delay)
    }
}

export default debounce;
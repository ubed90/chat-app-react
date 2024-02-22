const formatTime = (time: number) => {
    if(isNaN(time)) return "00:00";

    const minutes = Math.floor(time / 60);

    const seconds = Math.floor(time % 60);

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export default formatTime;
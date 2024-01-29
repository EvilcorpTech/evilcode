export function formatTimeAsSeconds(datetime: number) {
    return Math.round(datetime / 1000)
}

export function isDateTimeElapsed(time: number, elapsedTime: number): boolean {
    return Date.now() > (time + elapsedTime)
}

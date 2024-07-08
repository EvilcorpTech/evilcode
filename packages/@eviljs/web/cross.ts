export const FullscreenEvents = 'fullscreenchange webkitfullscreenchange MSFullscreenChange'

export function addFullscreenChangeListener(
    target: FullscreenDocument,
    callback: EventListener,
    capture?: undefined | boolean,
): void {
    FullscreenEvents.split(' ').forEach(event => {
        target.addEventListener(event, callback, capture ?? false)
    })
}

export function removeFullscreenChangeListener(
    target: FullscreenDocument,
    callback: EventListener,
    capture?: undefined | boolean,
): void {
    FullscreenEvents.split(' ').forEach(event => {
        target.removeEventListener(event, callback, capture ?? false)
    })
}

export function fullscreenElement(target: FullscreenDocument): undefined | Element {
    const element =
        target.fullscreenElement
        || target.webkitFullscreenElement
        || target.msFullscreenElement

    return element ?? undefined
}

export function exitFullscreen(target: FullscreenDocument): undefined | Promise<void> {
    const iface =
        target.exitFullscreen
        || target.webkitExitFullscreen
        || target.msExitFullscreen

    if (! iface) {
        return
    }

    return iface.apply(target)
}

export function requestFullscreen(target: FullscreenElement): undefined | Promise<void> {
    const iface =
        target.requestFullscreen
        || target.webkitRequestFullscreen
        || target.msRequestFullscreen

    if (! iface) {
        return
    }

    return iface.apply(target)
}

// Types ///////////////////////////////////////////////////////////////////////

export type FullscreenDocument = HTMLDocument & {
    webkitFullscreenElement?: HTMLDocument['fullscreenElement']
    msFullscreenElement?: HTMLDocument['fullscreenElement']
    webkitExitFullscreen?: HTMLDocument['exitFullscreen']
    msExitFullscreen?: HTMLDocument['exitFullscreen']
}

export type FullscreenElement = HTMLElement & {
    webkitRequestFullscreen?: HTMLElement['requestFullscreen']
    msRequestFullscreen?: HTMLElement['requestFullscreen']
}

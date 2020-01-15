export const FullscreenEvents = 'fullscreenchange webkitfullscreenchange MSFullscreenChange'

export function addFullscreenChangeListener(target: FullscreenDocument, callback: EventListener, capture = false) {
    FullscreenEvents.split(' ').forEach(event => {
        target.addEventListener(event, callback, capture)
    })
}

export function removeFullscreenChangeListener(target: FullscreenDocument, callback: EventListener, capture = false) {
    FullscreenEvents.split(' ').forEach(event => {
        target.removeEventListener(event, callback, capture)
    })
}

export function fullscreenElement(target: FullscreenDocument) {
    const element =
        target.fullscreenElement
        || target.webkitFullscreenElement
        || target.msFullscreenElement

    return element
}

export function exitFullscreen(target: FullscreenDocument) {
    const iface =
        target.exitFullscreen
        || target.webkitExitFullscreen
        || target.msExitFullscreen

    if (! iface) {
        return
    }

    return iface.apply(target)
}

export function requestFullscreen(target: FullscreenElement) {
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
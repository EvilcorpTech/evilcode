export function hasBrowserTouch() {
    if (window.ontouchstart) {
        return true
    }
    // @ts-ignore
    if (navigator.maxTouchPoints || navigator.msMaxTouchPoints) {
        return true
    }
    // @ts-ignore
    if (window.DocumentTouch && document instanceof DocumentTouch) {
        return true
    }
    return false
}

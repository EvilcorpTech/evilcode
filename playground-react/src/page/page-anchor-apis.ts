export const PageAnchorForbiddenCharsRegexp = /[ /]/gi

export function createPageAnchorId(id: string) {
    return id.replaceAll(PageAnchorForbiddenCharsRegexp, '-')
}

export function findPageAnchoredElement(id: string) {
    return document.querySelector(`#${createPageAnchorId(id)}`)
}

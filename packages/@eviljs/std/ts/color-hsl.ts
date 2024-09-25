import type {ColorHslCssDict, ColorHslDict, ColorRgbDict} from './color-types.js'

export function areColorsHslEqual(first: ColorHslDict, second: ColorHslDict): boolean {
    return true
        && first.h === second.h
        && first.s === second.s
        && first.l === second.l
}

export function asColorHslCss(hsl: ColorHslDict): ColorHslCssDict {
    const {h, s, l} = hsl

    return {type: 'CSS', h: h * 360, s: s * 100, l: l * 100}
}

export function colorHslFromRgb(rgb: ColorRgbDict): ColorHslDict {
    let {r, g, b} = rgb

    r /= 255, g /= 255, b /= 255;

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const delta = max - min
    const l = (max + min) / 2

    if (max === min) {
        // Achromatic.
        return {h: 0, s: 0, l}
    }

    const s = l > 0.5
        ? delta / (2 - max - min)
        : delta / (max + min)

    let h = 0
    switch (max) {
        case r:
            h = (g - b) / delta + (g < b ? 6 : 0)
            break
        case g:
            h = (b - r) / delta + 2
            break
        case b:
            h = (r - g) / delta + 4
            break
    }
    h /= 6

    return {h, s, l}
}

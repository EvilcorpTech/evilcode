// https://css-tricks.com/converting-color-spaces-in-javascript/
// https://gist.github.com/mjackson/5311256

import type {ColorHslDict, ColorRgbDict} from './color-types.js'

export function areColorsRgbEqual(first: ColorRgbDict, second: ColorRgbDict): boolean {
    return true
        && first.r === second.r
        && first.g === second.g
        && first.b === second.b
}

export function colorRgbFromHsl(hsl: ColorHslDict): ColorRgbDict {
    const {h, s, l} = hsl

    if (s == 0) {
        // Achromatic.
        return {r: l, g: l, b: l}

    }
    function hue2rgb(p: number, q: number, t: number) {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    const r = hue2rgb(p, q, h + 1 / 3) * 255
    const g = hue2rgb(p, q, h) * 255
    const b = hue2rgb(p, q, h - 1 / 3) * 255

    return {r, g, b}
}

export function colorRgbFromRgbHexString(rgbHexString: string): ColorRgbDict {
    const [hash, r1, r2, g1, g2, b1, b2] = rgbHexString
    const r = parseInt(r1! + r2!, 16)
    const g = parseInt(g1! + g2!, 16)
    const b = parseInt(b1! + b2!, 16)
    return {r, g, b}
}

export function colorRgbToRgbHexString(rgb: ColorRgbDict): string {
    const {r, g, b} = rgb

    let rx = Math.round(r).toString(16)
    let gx = Math.round(g).toString(16)
    let bx = Math.round(b).toString(16)

    if (rx.length == 1) rx = '0' + rx
    if (gx.length == 1) gx = '0' + gx
    if (bx.length == 1) bx = '0' + bx

    return '#' + rx + gx + bx
}

// https://css-tricks.com/converting-color-spaces-in-javascript/
// https://gist.github.com/mjackson/5311256

export function rgbFromHexString(rgbHex: string) {
    const [hash, r1, r2, g1, g2, b1, b2] = rgbHex
    const r = parseInt(r1 + r2, 16)
    const g = parseInt(g1 + g2, 16)
    const b = parseInt(b1 + b2, 16)
    return [r, g, b] as const
}

export function rgbToHexString(r: number, g: number, b: number) {
    let rx = Math.round(r).toString(16)
    let gx = Math.round(g).toString(16)
    let bx = Math.round(b).toString(16)

    if (rx.length == 1) rx = '0' + rx
    if (gx.length == 1) gx = '0' + gx
    if (bx.length == 1) bx = '0' + bx

    return '#' + rx + gx + bx
}

export function hslFromRgb(r: number, g: number, b: number) {
    r /= 255, g /= 255, b /= 255;

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const delta = max - min
    const l = (max + min) / 2

    if (max === min) {
        // Achromatic.
        return [0, 0, l] as const
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

    return [h, s, l] as const
}

export function rgbFromHsl(h: number, s: number, l: number) {
      if (s == 0) {
        // Achromatic.
        return [l, l, l] as const

    }
    function hue2rgb(p: number, q: number, t: number) {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1/6) return p + (q - p) * 6 * t
        if (t < 1/2) return q
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
        return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    const r = hue2rgb(p, q, h + 1/3)
    const g = hue2rgb(p, q, h)
    const b = hue2rgb(p, q, h - 1/3)

    return [r * 255, g * 255, b * 255] as const
}
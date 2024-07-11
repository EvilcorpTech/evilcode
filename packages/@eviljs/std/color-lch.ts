import type {ColorLchDict, ColorRgbDict} from './color-types.js'

export function areColorsLchEqual(first: ColorLchDict, second: ColorLchDict): boolean {
    return true
        && first.l === second.l
        && first.c === second.c
        && first.h === second.h
}

export function colorLchFromRgb(rgb: ColorRgbDict): ColorLchDict {
    // ChatGPT code.
    function sRGBtoLinear(value: number) {
        if (value <= 0.04045) {
            return value / 12.92
        }
        else {
            return Math.pow((value + 0.055) / 1.055, 2.4)
        }
    }
    function rgbToLinearRGB(r: number, g: number, b: number): [number, number, number] {
        return [
            sRGBtoLinear(r / 255),
            sRGBtoLinear(g / 255),
            sRGBtoLinear(b / 255),
        ]
    }
    function linearRGBtoXYZ([r, g, b]: [number, number, number]): [number, number, number] {
        // Conversion matrix from linear sRGB to XYZ.
        const X = r * 0.4122214708 + g * 0.5363325363 + b * 0.0514459929
        const Y = r * 0.2119034982 + g * 0.6806995451 + b * 0.1073969566
        const Z = r * 0.0883024619 + g * 0.2817188376 + b * 0.6299787005
        return [X, Y, Z]
    }
    function xyzToOklab([X, Y, Z]: [number, number, number]): [number, number, number] {
        const Xn = 0.95047
        const Yn = 1.00000
        const Zn = 1.08883

        const x = X / Xn
        const y = Y / Yn
        const z = Z / Zn

        const l = Math.cbrt(0.2104542553 * x + 0.7936177850 * y - 0.0040720468 * z)
        const m = Math.cbrt(1.9779984951 * x - 2.4285922050 * y + 0.4505937099 * z)
        const s = Math.cbrt(0.0259040371 * x + 0.7827717662 * y - 0.8086757660 * z)

        const L = 0.2104542553 * l + 0.7936177850 * m + 0.0040720468 * s
        const a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s
        const b = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s

        return [L, a, b]
    }
    function oklabToOklch([L, a, b]: [number, number, number]): [number, number, number] {
        const C = Math.sqrt(a * a + b * b)
        const h = Math.atan2(b, a) * 180 / Math.PI
        const H = h < 0 ? h + 360 : h  // Ensure hue is non-negative
        return [L, C, H]
    }
    function rgbToOklch([r, g, b]: [number, number, number]): [number, number, number] {
        const linearRGB = rgbToLinearRGB(r, g, b)
        const xyz = linearRGBtoXYZ(linearRGB)
        const oklab = xyzToOklab(xyz)
        const oklch = oklabToOklch(oklab)
        return oklch
    }

    const [l, c, h] = rgbToOklch([rgb.r, rgb.g, rgb.b])

    return {l, c, h}
}

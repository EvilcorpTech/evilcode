import {colorHslFromRgb} from './color-hsl.js'
import {colorLchFromRgb} from './color-lch.js'
import {colorRgbFromHsl, colorRgbFromRgbHexString, colorRgbToRgbHexString} from './color-rgb.js'
import type {ColorHslDict, ColorLchDict} from './color-types.js'

export function colorHslFromRgbHexString(rgbHexString: string): ColorHslDict {
    return colorHslFromRgb(colorRgbFromRgbHexString(rgbHexString))
}

export function colorRgbHexStringFromHsl(hsl: ColorHslDict): string {
    return colorRgbToRgbHexString(colorRgbFromHsl(hsl))
}

export function colorLchFromRgbHexString(rgbHexString: string): ColorLchDict {
    return colorLchFromRgb(colorRgbFromRgbHexString(rgbHexString))
}

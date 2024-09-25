import {colorHslFromRgbHexString, colorLchFromRgbHexString} from './color-bridge.js'
import {areColorsHslEqual, asColorHslCss, colorHslFromRgb} from './color-hsl.js'
import {areColorsLchEqual, colorLchFromRgb} from './color-lch.js'
import {areColorsRgbEqual, colorRgbFromHsl, colorRgbFromRgbHexString, colorRgbToRgbHexString} from './color-rgb.js'
import type {ColorHslDict, ColorLchDict, ColorRgbDict} from './color-types.js'

export const ColorRgb: {
    areEqual(first: ColorRgbDict, second: ColorRgbDict): boolean
    fromHsl(hsl: ColorHslDict): ColorRgbDict
    fromRgbHexString(rgbHex: string): ColorRgbDict
    toRgbHexString(rgb: ColorRgbDict): string
} = {
    areEqual: areColorsRgbEqual,
    fromHsl: colorRgbFromHsl,
    fromRgbHexString: colorRgbFromRgbHexString,
    toRgbHexString: colorRgbToRgbHexString,
}

export const ColorHsl: {
    areEqual(first: ColorHslDict, second: ColorHslDict): boolean
    fromRgb(rgb: ColorRgbDict): ColorHslDict
    fromRgbHexString(rgbHexString: string): ColorHslDict
    toHslCss(hsl: ColorHslDict): ColorHslDict
} = {
    areEqual: areColorsHslEqual,
    fromRgb: colorHslFromRgb,
    fromRgbHexString: colorHslFromRgbHexString,
    toHslCss: asColorHslCss,
}

export const ColorLch: {
    areEqual(first: ColorLchDict, second: ColorLchDict): boolean
    fromRgb(rgb: ColorRgbDict): ColorLchDict
    fromRgbHexString(rgbHexString: string): ColorLchDict
} = {
    areEqual: areColorsLchEqual,
    fromRgb: colorLchFromRgb,
    fromRgbHexString: colorLchFromRgbHexString,
}

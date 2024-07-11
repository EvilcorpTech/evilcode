// Types ///////////////////////////////////////////////////////////////////////

export interface ColorRgbDict {
    r: number
    g: number
    b: number
}

export interface ColorHslDict {
    /** A number between 0 and 1. */
    h: number
    /** A number between 0 and 1. */
    s: number
    /** A number between 0 and 1. */
    l: number
}
export interface ColorHslCssDict {
    type: 'CSS'
    /** A number between 0 and 360. */
    h: number
    /** A number between 0 and 100. */
    s: number
    /** A number between 0 and 100. */
    l: number
}

export interface ColorLchDict {
    l: number
    c: number
    h: number
}

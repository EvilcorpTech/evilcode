import type {Io} from './fn-type.js'

/**
* The linear scale returns NaN if input/output interval has same start and end values.
*/
export function createLinearScale(inputInterval: [number, number], outputInterval: [number, number]): Io<number, number> {
    const [inputStart, inputEnd] = inputInterval
    const [outputStart, outputEnd] = outputInterval

    function map(inputValue: number) {
        // InputInterval:   2     8
        //                  [-*---]
        // InputValue:        4
        //                     \ * -3.3
        // OutputValue:         -3.1
        // OutputInterval: [------*-----------]
        //                 -10                10
        const inputDistance = distanceBetween(inputStart, inputEnd) // 2, 8 = 6
        const outputDistance = distanceBetween(outputStart, outputEnd) // 10, -10 = 20
        const inputValueDistance = distanceBetween(inputStart, inputValue) // 2, 4 = 2
        const scaleDirection = directionOf(outputStart, outputEnd) // 10, -10 = -1
        const scaleFactor = outputDistance / inputDistance // 20 / 6 = 3.3
        const scale = scaleFactor * scaleDirection // 3.3 * -1 = -3.3
        const outputValueDistance = inputValueDistance * scale // 2 * -3.3 = -6.6
        const outputValue = outputStart + outputValueDistance // 10 + -6.6 = 3.4

        return outputValue
    }

    return map
}

export function distanceBetween(x1: number, x2: number): number {
    return Math.abs(x1 - x2)
}

export function directionOf(x1: number, x2: number): number {
    return x1 < x2 ? 1 : -1
}

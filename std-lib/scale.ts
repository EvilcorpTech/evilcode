export function createLinearScale(inputInterval: readonly [number, number], outputInterval: readonly [number, number]) {
    const [ inputStart, inputEnd ] = inputInterval
    const [ outputStart, outputEnd ] = outputInterval

    function map(inputValue: number) {
        // InputInterval:   2     8
        //                  [-*---]
        // InputValue:        4
        //                     \
        //                      \ * -3.3
        //                       \
        // OutputValue:           -3.1
        // OutputInterval: [------*-----------]
        //                 -10                10
        const inputDistance = computeDistance(inputStart, inputEnd) // 2, 8 = 6
        const outputDistance = computeDistance(outputStart, outputEnd) // 10, -10 = 20
        const inputValueDistance = computeDistance(inputStart, inputValue) // 2, 6 = 4
        const scaleDirection = computeDirection(outputStart, outputEnd) // 10, -10 = -1
        const scaleFactor = outputDistance / inputDistance // 20 / 6 = 3.3
        const scale = scaleFactor * scaleDirection // 3.3 * -1 = -3.3
        const outputValueDistance = inputValueDistance * scale // 4 * -3.3 = -13.2
        const outputValue = outputStart + outputValueDistance // 10 + -13.2 = -3.1

        return outputValue
    }

    return map
}

export function computeDistance(x1: number, x2: number) {
    return Math.abs(x1 - x2)
}

export function computeDirection(x1: number, x2: number) {
    return x1 < x2 ? 1 : -1
}

// Types ///////////////////////////////////////////////////////////////////////

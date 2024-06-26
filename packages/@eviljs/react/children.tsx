export function decoratingElement(sides: {
    before?: undefined | React.ReactNode
    after?: undefined | React.ReactNode
}) {
    function decorator(element: React.ReactNode) {
        return <>
            {sides?.before}
            {element}
            {sides?.after}
        </>
    }

    return decorator
}

export function decoratingElementBefore(children: React.ReactNode) {
    return decoratingElement({before: children})
}

export function decoratingElementAfter(children: React.ReactNode) {
    return decoratingElement({after: children})
}

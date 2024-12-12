export function decoratingElement(args: {
    before?: undefined | React.ReactNode
    after?: undefined | React.ReactNode
}): (children: React.ReactNode) => React.JSX.Element {
    function decorator(children: React.ReactNode) {
        return <>
            {args?.before}
            {children}
            {args?.after}
        </>
    }

    return decorator
}

export function decoratingElementBefore(children: React.ReactNode): (children: React.ReactNode) => React.JSX.Element {
    return decoratingElement({before: children})
}

export function decoratingElementAfter(children: React.ReactNode): (children: React.ReactNode) => React.JSX.Element {
    return decoratingElement({after: children})
}

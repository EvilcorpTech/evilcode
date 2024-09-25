export function formatBigNumber(bigNumber: number, fractionDigitsOptional?: undefined | number): string {
    const fractionDigits = fractionDigitsOptional ?? 0
    const unit =
        bigNumber >= 1_000 && bigNumber < 1_000_000 ? 'K'
        : bigNumber >= 1_000_000 && bigNumber < 1_000_000_000 ? 'M'
        : ''
    const smallNumber = bigNumber / (
        unit === 'K' ? 1_000
        : unit === 'M' ? 1_000_000
        : 1
    )

    const formattedNumber = smallNumber.toLocaleString(void undefined, {
        maximumFractionDigits: fractionDigits,
    })

    return formattedNumber + (unit ? `${unit}` : '')
}

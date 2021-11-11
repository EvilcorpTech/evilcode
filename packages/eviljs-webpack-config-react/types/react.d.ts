export {}

declare global {
    namespace JSX {
        interface IntrinsicAttributes {
            invisible?: undefined | null | string
        }
    }
    namespace React {
        interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
            invisible?: undefined | null | string
        }
    }
}

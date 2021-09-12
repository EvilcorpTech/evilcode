export {}

declare global {
    namespace JSX {
        interface IntrinsicAttributes {
            invisible?: null | string
        }
    }
    namespace React {
        interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
            invisible?: null | string
        }
    }
}

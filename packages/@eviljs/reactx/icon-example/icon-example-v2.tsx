import {defineSvg} from '@eviljs/react/svg.js'

export const ExampleIcon = defineSvg({
    name: 'ExampleIcon',
    className: 'std-icon std-icon-color',
    viewBox: '0 0 24 24',
    children: <>
        <path
            fill="none"
            strokeWidth="var(--stroke-size, 2)"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z"
        />
        <path
            strokeWidth="var(--stroke-size, 2)"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.5 17.5L13.875 13.875"
        />
    </>,
})

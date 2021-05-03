import {defineIcon, Fragment} from '@eviljs/std-react/icon.js'

export const ExampleIcon = defineIcon({
    name: 'ExampleIcon',
    className: 'std-icon',
    viewBox: '0 0 512 512',
    children:
    <Fragment>
        <path
            fill="none"
            strokeWidth="var(--stroke-width, 2)"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z"
        />
        <path
            strokeWidth="var(--stroke-width, 2)"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.5 17.5L13.875 13.875"
        />
    </Fragment>,
})

import {tryOrNull} from '@eviljs/std/try'
import Background1 from ':/lib/assets/watercolor-1.jpg'
import Background2 from ':/lib/assets/watercolor-2.jpg'
import Background3 from ':/lib/assets/watercolor-3.jpg'
import Background4 from ':/lib/assets/watercolor-4.jpg'

const Parser = new DOMParser()

export const Cards = [
    {
        id: 'react',
        title: 'React',
        description: 'The batteries not included in React.',
        background: Background3,
    },
    {
        id: 'std',
        title: 'JavaScript',
        description: 'Cool patterns and utilities for JavaScript and TypeScript.',
        background: Background1,
    },
    {
        id: 'style',
        title: 'CSS',
        description: 'A ready to use design system, with themes and props.',
        background: Background4,
    },
    {
        id: 'web',
        title: 'Web',
        description: 'The Web unleashed.',
        background: Background2,
    },
    {
        id: 'vue',
        title: 'Vue',
        description: 'Vue 3 fireworks, coming this fall!',
        // background: Background2,
        disabled: true,
    },
]

export function createDoc(text: string): null | Document {
    return tryOrNull(() => {
        return Parser.parseFromString(text, 'application/xml')
    }, console.error)
}

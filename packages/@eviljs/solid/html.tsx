import type {JSX} from 'solid-js'
import {Show, splitProps} from 'solid-js'
import {Dynamic} from 'solid-js/web'
import {classes} from './classes.js'

export function Html(props: HtmlProps): JSX.Element {
    const [_, otherProps] = splitProps(props, ['tag'])

    return (
        <Show when={props.children}>
            <Dynamic
                {...otherProps}
                component={props.tag ?? 'div'}
                class={classes('Html-2c6a', props.class)}
                innerHTML={String(props.children ?? '')}
            />
        </Show>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface HtmlProps extends JSX.HTMLAttributes<HTMLElement> {
    tag?: undefined | keyof JSX.IntrinsicElements
    children: undefined | number | string
}

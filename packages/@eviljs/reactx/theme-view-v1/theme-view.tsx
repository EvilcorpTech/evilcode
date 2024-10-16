import {classes} from '@eviljs/react/classes'
import {colorHslFromRgbHexString, colorRgbHexStringFromHsl, type ColorHslDict} from '@eviljs/std/color'
import {times} from '@eviljs/std/iter'
import {Fragment, useEffect, useRef, useState} from 'react'
import {ExampleIcon as Icon} from '../icon-example/icon-example-v2.js'

export function ThemeView(props: ThemeViewProps): JSX.Element {
    const {className, head, children, ...otherProps} = props
    const [primaryAccent, setPrimaryAccent] = useState<ColorHslDict>({h: 0, s: 0, l: 0})
    const [secondaryAccent, setSecondaryAccent] = useState<ColorHslDict>({h: 0, s: 0, l: 0})
    const [theme, setTheme] = useState<'light' | 'dark'>('light')

    return (
        <div
            {...otherProps}
            className={classes('ThemeView-t2eb', `std-root std-theme-${theme} std-text std-color-theme std-background-theme std-width-xl`, className)}
            style={{
                '--std-color-primary-h': primaryAccent.h * 360 + 'deg',
                '--std-color-primary-s': primaryAccent.s * 100 + '%',
                '--std-color-primary-l': primaryAccent.l * 100 + '%',
                '--std-color-secondary-h': secondaryAccent.h * 360 + 'deg',
                '--std-color-secondary-s': secondaryAccent.s * 100 + '%',
                '--std-color-secondary-l': secondaryAccent.l * 100 + '%',
                ...otherProps.style,
            } as React.CSSProperties}
        >
            {head}

            <Picker
                onPrimaryChange={setPrimaryAccent}
                onSecondaryChange={setSecondaryAccent}
                onThemeChange={setTheme}
            />

            <i className="std-space-v5"/>

            <div className="grid-1c73 std-flex std-flex-justify-center std-flex-wrap">
                <Gutters/>
                <Colors/>
                <Typography/>
                <TextHeight/>
                <TextSpace/>
                <Icons/>
                <Contrast theme={theme}/>
                <Radiuses/>
                <Shadows/>
                <Transitions/>
                <Buttons/>
            </div>

            {children}
        </div>
    )
}

export function Picker(props: PickerProps): JSX.Element {
    const {onPrimaryChange, onSecondaryChange, onThemeChange} = props
    const primaryRef = useRef<HTMLInputElement | null>(null)
    const secondaryRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        const primaryAccent = readThemeColor('std-color-primary')
        const secondaryAccent = readThemeColor('std-color-secondary')
        primaryRef.current!.value = colorRgbHexStringFromHsl(primaryAccent)
        secondaryRef.current!.value = colorRgbHexStringFromHsl(secondaryAccent)

        onPrimaryChange(primaryAccent)
        onSecondaryChange(secondaryAccent)
    }, [])

    return (
        <h1 className="std-flex std-flex-align-center std-text-overline">
            <input
                ref={primaryRef}
                className="picker-t8c2"
                type="color"
                onChange={event => onPrimaryChange(colorHslFromRgbHexString(event.target.value))}
            />
            <i className="std-space-h5"/>
            <label>Theme</label>
            <i className="std-space-h5"/>
            <input
                ref={secondaryRef}
                className="picker-t8c2"
                type="color"
                onChange={event => onSecondaryChange(colorHslFromRgbHexString(event.target.value))}
            />

            <i className="std-space-h5"/>

            <label className="std-flex std-flex-column std-flex-align-center">
                <input
                    type="checkbox"
                    onChange={event => onThemeChange(
                        event.target.checked
                            ? 'dark'
                            : 'light'
                    )}
                />
                <i className="std-space-v1"/>
                <b>Dark</b>
            </label>
        </h1>
    )
}

export function Colors(): JSX.Element {
    return (
        <div className="std-flex std-flex-column std-flex-justify-center">
            <div className="std-flex">
                <label className="std-text-h6 std-color-primary-accent">Primary</label>
                <div className="std-grow"/>
            </div>

            <i className="std-space-v4"/>

            <div className="std-flex">
                <label>Accent</label>
                <div className="std-grow"/>
                <span
                    className="color-t75a"
                    title="Primary accent"
                    style={{backgroundColor: 'var(--std-color-primary-accent)'}}
                />
            </div>

            <i className="std-space-v4"/>

            <div className="std-flex">
                <label>Tint</label>
                <div className="std-grow"/>
                <div className="std-flex std-flex-row-reverse">
                    {times(6).map(idx => (
                        <span
                            key={idx}
                            className="color-t75a"
                            title={`Primary tint ${idx+1}`}
                            style={{backgroundColor: `var(--std-color-primary-tint${idx+1})`}}
                        />
                    ))}
                </div>
            </div>

            <div className="std-space-v4"/>

            <div className="std-flex">
                <label>Shade</label>
                <div className="std-grow"/>
                <div className="std-flex std-flex-row-reverse">
                    {times(6).map(idx => (
                        <span
                            key={idx}
                            className="color-t75a"
                            title={`Primary shade ${idx+1}`}
                            style={{backgroundColor: `var(--std-color-primary-shade${idx+1})`}}
                        />
                    ))}
                </div>
            </div>

            <div className="std-space-v4"/>

            <div className="std-flex">
                <label>Tone</label>
                <div className="std-grow"/>
                <div className="std-flex std-flex-row-reverse">
                    {times(6).map(idx => (
                        <span
                            key={idx}
                            className="color-t75a"
                            title={`Primary tone ${idx+1}`}
                            style={{backgroundColor: `var(--std-color-primary-tone${idx+1})`}}
                        />
                    ))}
                </div>
            </div>

            <div className="std-space-v4"/>

            <div className="std-flex">
                <label>Fg</label>
                <div className="std-grow"/>
                <div className="std-flex std-flex-row-reverse">
                    {times(3).map(idx => (
                        <span
                            key={idx}
                            className="color-t75a"
                            title={`Primary fg ${idx+1}`}
                            style={{backgroundColor: `var(--std-color-primary-fg${idx+1})`}}
                        />
                    ))}
                </div>
            </div>

            <i className="std-space-v5"/>

            <div className="std-flex">
                <label className="std-text-h6 std-color-secondary-accent">Secondary</label>
                <div className="std-grow"/>
            </div>

            <div className="std-space-v4"/>

            <div className="std-flex">
                <label>Accent</label>
                <div className="std-grow"/>
                <span
                    className="color-t75a"
                    title="Secondary Accent"
                    style={{backgroundColor: 'var(--std-color-secondary-accent)'}}
                />
            </div>

            <div className="std-space-v4"/>

            <div className="std-flex">
                <label>Tint</label>
                <div className="std-grow"/>
                <div className="std-flex std-flex-row-reverse">
                    {times(6).map(idx => (
                        <span
                            key={idx}
                            className="color-t75a"
                            title={`Primary tint ${idx+1}`}
                            style={{backgroundColor: `var(--std-color-secondary-tint${idx+1})`}}
                        />
                    ))}
                </div>
            </div>

            <div className="std-space-v4"/>

            <div className="std-flex">
                <label>Shade</label>
                <div className="std-grow"/>
                <div className="std-flex std-flex-row-reverse">
                    {times(6).map(idx => (
                        <span
                            key={idx}
                            className="color-t75a"
                            title={`Primary shade ${idx+1}`}
                            style={{backgroundColor: `var(--std-color-secondary-shade${idx+1})`}}
                        />
                    ))}
                </div>
            </div>

            <div className="std-space-v4"/>

            <div className="std-flex">
                <label>Tone</label>
                <div className="std-grow"/>
                <div className="std-flex std-flex-row-reverse">
                    {times(6).map(idx => (
                        <span
                            key={idx}
                            className="color-t75a"
                            title={`Primary tone ${idx+1}`}
                            style={{backgroundColor: `var(--std-color-secondary-tone${idx+1})`}}
                        />
                    ))}
                </div>
            </div>

            <div className="std-space-v4"/>

            <div className="std-flex">
                <label>Fg</label>
                <div className="std-grow"/>
                <div className="std-flex std-flex-row-reverse">
                    {times(3).map(idx => (
                        <span
                            key={idx}
                            className="color-t75a"
                            title={`Secondary fg ${idx+1}`}
                            style={{backgroundColor: `var(--std-color-secondary-fg${idx+1})`}}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export function Typography(): JSX.Element {
    return (
        <div className="std-flex std-flex-column std-flex-align-start">
            {times(13).reverse().map(idx =>
                <label
                    key={idx}
                    className={classes('text-8fa3', `std-text-size${idx+1}`)}
                >
                    Text Size {idx + 1}
                </label>

            )}
        </div>
    )
}

export function TextHeight(): JSX.Element {
    return (
        <div className="std-flex std-flex-justify-center std-flex-wrap std-gap3">
            {times(7).map(it =>
                <Fragment key={it}>
                    <p className={`std-text-height${it}`} style={{maxWidth: '10rem'}}>
                        Text height <b>{it}</b>
                        <br/>
                        Lorem ipsum is simply dummy text of the printing and typesetting industry.
                        Loren Ipsum has been the industries standard dummy text ever since the 1500s,
                        when an unknown printer took a galley of type and scrambled it to make a type
                        specimen book.
                    </p>
                </Fragment>
            )}
        </div>
    )
}

export function TextSpace(): JSX.Element {
    return (
        <div className="std-flex std-flex-column std-flex-justify-center std-gap3">
            {['-2', '-1', '', '1', '2'].map((it, idx) =>
                <Fragment key={it}>
                    <label className={`std-text-space${it} std-text-size5`}>
                        Letter Spacing Example <b>{it}</b>
                    </label>
                </Fragment>
            )}
        </div>
    )
}

export function Gutters(): JSX.Element {
    return (
        <div className="std-flex std-flex-column std-flex-justify-center">
            {times(10).map(it =>
                <Fragment key={it}>
                    <label className="gutter-t1d3 std-flex std-flex-column">
                        <span>Gap {it + 1}</span>
                        <i className={`std-space-h${it + 1}`}/>
                    </label>
                    <i className="std-space-v3"/>
                </Fragment>
            )}
        </div>
    )
}

export function Contrast(props: {theme: 'dark' | 'light'}): JSX.Element {
    return (
        <div
            className="layout-1e33 std-flex std-gap6"
            style={{
                padding: 'var(--std-gutter5)',
                backgroundColor: 'floralwhite',
            }}
        >
            <div
                className="std-flex std-gap4"
                style={{
                    padding: 'var(--std-gutter5)',
                    backgroundColor: 'hsl(0deg 0% var(--std-bg-l))',
                } as React.CSSProperties}
            >
                {[0, 1, 2].map(it =>
                    <div
                        key={it}
                        className={classes('std-flex std-flex-column std-gap4', `std-background-z${it}`, `std-root std-theme-${props.theme}`)}
                    >
                        <h6 className="std-text-uppercase">Bg Z {it}</h6>

                        <label className="contrast-td08 std-background-bg1">
                            <div className="std-color-fg1 std-text-h6 std-text-weight1 std-text-uppercase">Bg 1</div>
                            <div className="std-color-fg1 std-text-subtitle1 std-text-weight1">Fg 1</div>
                            <div className="std-color-fg2 std-text-subtitle1 std-text-weight1">Fg 2</div>
                            <div className="std-color-fg3 std-text-subtitle1 std-text-weight1">Fg 3</div>
                        </label>
                        <label className="contrast-td08 std-background-bg2">
                            <div className="std-color-fg1 std-text-h6 std-text-weight1 std-text-uppercase">Bg 2</div>
                            <div className="std-color-fg1 std-text-subtitle1 std-text-weight1">Fg 1</div>
                            <div className="std-color-fg2 std-text-subtitle1 std-text-weight1">Fg 2</div>
                            <div className="std-color-fg3 std-text-subtitle1 std-text-weight1">Fg 3</div>
                        </label>
                        <label className="contrast-td08 std-background-bg3">
                            <div className="std-color-fg1 std-text-h6 std-text-weight1 std-text-uppercase">Bg 3</div>
                            <div className="std-color-fg1 std-text-subtitle1 std-text-weight1">Fg 1</div>
                            <div className="std-color-fg2 std-text-subtitle1 std-text-weight1">Fg 2</div>
                            <div className="std-color-fg3 std-text-subtitle1 std-text-weight1">Fg 3</div>
                        </label>
                        <label className="contrast-td08 std-background-bg4">
                            <div className="std-color-fg1 std-text-h6 std-text-weight1 std-text-uppercase">Bg 4</div>
                            <div className="std-color-fg1 std-text-subtitle1 std-text-weight1">Fg 1</div>
                            <div className="std-color-fg2 std-text-subtitle1 std-text-weight1">Fg 2</div>
                            <div className="std-color-fg3 std-text-subtitle1 std-text-weight1">Fg 3</div>
                        </label>
                    </div>
                )}
            </div>

            <div
                className="std-grow std-flex std-gap4"
                style={{
                    padding: 'var(--std-gutter5)',
                    backgroundColor: 'hsl(0deg 0% var(--std-bg-l))',
                } as React.CSSProperties}
            >
                <div className="std-flex std-flex-column std-gap4">
                    <label className="contrast-td08 std-background-bg1">
                        <div className="std-color-fg1 std-text-h6 std-text-weight1 std-text-uppercase">Bg 1</div>
                        <div className="std-color-primary-fg1 std-text-subtitle1 std-text-weight1">Primary Fg 1</div>
                        <div className="std-color-primary-fg2 std-text-subtitle1 std-text-weight1">Primary Fg 2</div>
                        <div className="std-color-primary-fg3 std-text-subtitle1 std-text-weight1">Primary Fg 3</div>
                    </label>
                    <label className="contrast-td08 std-background-bg2">
                        <div className="std-color-fg1 std-text-h6 std-text-weight1 std-text-uppercase">Bg 2</div>
                        <div className="std-color-primary-fg1 std-text-subtitle1 std-text-weight1">Primary Fg 1</div>
                        <div className="std-color-primary-fg2 std-text-subtitle1 std-text-weight1">Primary Fg 2</div>
                        <div className="std-color-primary-fg3 std-text-subtitle1 std-text-weight1">Primary Fg 3</div>
                    </label>
                    <label className="contrast-td08 std-background-bg3">
                        <div className="std-color-fg1 std-text-h6 std-text-weight1 std-text-uppercase">Bg 3</div>
                        <div className="std-color-primary-fg1 std-text-subtitle1 std-text-weight1">Primary Fg 1</div>
                        <div className="std-color-primary-fg2 std-text-subtitle1 std-text-weight1">Primary Fg 2</div>
                        <div className="std-color-primary-fg3 std-text-subtitle1 std-text-weight1">Primary Fg 3</div>
                    </label>
                    <label className="contrast-td08 std-background-bg4">
                        <div className="std-color-fg1 std-text-h6 std-text-weight1 std-text-uppercase">Bg 4</div>
                        <div className="std-color-primary-fg1 std-text-subtitle1 std-text-weight1">Primary Fg 1</div>
                        <div className="std-color-primary-fg2 std-text-subtitle1 std-text-weight1">Primary Fg 2</div>
                        <div className="std-color-primary-fg3 std-text-subtitle1 std-text-weight1">Primary Fg 3</div>
                    </label>
                </div>

                <div className="std-flex std-flex-column std-gap4">
                    <label className="contrast-td08 std-background-bg1">
                        <div className="std-color-fg1 std-text-h6 std-text-weight1 std-text-uppercase">Bg 1</div>
                        <div className="std-color-secondary-fg1 std-text-subtitle1 std-text-weight1">Secondary Fg 1</div>
                        <div className="std-color-secondary-fg2 std-text-subtitle1 std-text-weight1">Secondary Fg 2</div>
                        <div className="std-color-secondary-fg3 std-text-subtitle1 std-text-weight1">Secondary Fg 3</div>
                    </label>
                    <label className="contrast-td08 std-background-bg2">
                        <div className="std-color-fg1 std-text-h6 std-text-weight1 std-text-uppercase">Bg 2</div>
                        <div className="std-color-secondary-fg1 std-text-subtitle1 std-text-weight1">Secondary Fg 1</div>
                        <div className="std-color-secondary-fg2 std-text-subtitle1 std-text-weight1">Secondary Fg 2</div>
                        <div className="std-color-secondary-fg3 std-text-subtitle1 std-text-weight1">Secondary Fg 3</div>
                    </label>
                    <label className="contrast-td08 std-background-bg3">
                        <div className="std-color-fg1 std-text-h6 std-text-weight1 std-text-uppercase">Bg 3</div>
                        <div className="std-color-secondary-fg1 std-text-subtitle1 std-text-weight1">Secondary Fg 1</div>
                        <div className="std-color-secondary-fg2 std-text-subtitle1 std-text-weight1">Secondary Fg 2</div>
                        <div className="std-color-secondary-fg3 std-text-subtitle1 std-text-weight1">Secondary Fg 3</div>
                    </label>
                    <label className="contrast-td08 std-background-bg4">
                        <div className="std-color-fg1 std-text-h6 std-text-weight1 std-text-uppercase">Bg 4</div>
                        <div className="std-color-secondary-fg1 std-text-subtitle1 std-text-weight1">Secondary Fg 1</div>
                        <div className="std-color-secondary-fg2 std-text-subtitle1 std-text-weight1">Secondary Fg 2</div>
                        <div className="std-color-secondary-fg3 std-text-subtitle1 std-text-weight1">Secondary Fg 3</div>
                    </label>
                </div>
            </div>
        </div>
    )
}

export function Buttons(): JSX.Element {
    return (
        <div className="buttons-45cb std-flex std-flex-column std-flex-justify-center std-flex-align-center std-flex-wrap">
            <div>
                <button className="std-text-button std-button std-button-dye">Dye</button>
                <button className="std-text-button std-button std-button-flat">Flat</button>
                <button className="std-text-button std-button std-button-plain std-button-halo">Halo</button>
                <button className="std-text-button std-button std-button-plain">Plain</button>
            </div>

            <div className="std-space-v3"/>

            <div>
                <button className="std-text-button std-button std-button-dye" disabled>Dye</button>
                <button className="std-text-button std-button std-button-flat" disabled>Flat</button>
                <button className="std-text-button std-button std-button-plain std-button-halo" disabled>Halo</button>
                <button className="std-text-button std-button std-button-plain" disabled>Plain</button>
            </div>
        </div>
    )
}

export function Transitions(): JSX.Element {
    return (
        <div className="std-flex std-flex-justify-center std-flex-align-center std-flex-wrap">
            {times(5).map(it =>
                <label
                    key={it}
                    className="duration-t347"
                    style={{transitionDuration: `var(--std-duration${it + 1})`}}
                >
                    Duration {it + 1}
                </label>
            )}
        </div>
    )
}

export function Icons(): JSX.Element {
    return (
        <div className="std-flex std-flex-row std-flex-justify-center std-flex-align-end std-flex-aligned-center std-flex-wrap">
            {times(10).map(it =>
                <div key={it} className="icon-e43c">
                    <Icon className={`std-icon-size${it + 1}`}/>
                    <div className="std-space-h3"/>
                    <label>{it + 1}</label>
                </div>
            )}
        </div>
    )
}

export function Radiuses(): JSX.Element {
    return (
        <div className="std-flex std-flex-justify-center std-flex-align-center std-flex-wrap">
            {times(4).map(it =>
                <label
                    key={it}
                    className={`radius-75ca std-radius${it + 1}`}
                >
                    Radius {it + 1}
                </label>
            )}
        </div>
    )
}

export function Shadows(): JSX.Element {
    return (
        <div className="std-flex std-flex-center std-flex-align-center std-flex-wrap std-width-m">
            <label className="shadow-t9a2 std-shadow-soft">Soft</label>
            {times(12).map(idx => (
                <label
                    key={idx}
                    className={`shadow-t9a2 std-shadow${idx}`}
                >
                    {idx}
                </label>
            ))}
            {times(25).map((nil, idx) => idx).slice(12).map(idx => (
                <label
                    key={idx}
                    className={`shadow-t9a2 std-shadow${idx} std-shadow-primary`}
                >
                    {idx}
                </label>
            ))}
        </div>
    )
}

export function readThemeColor(type: string): ColorHslDict {
    const el = document.body
    const hProp = window.getComputedStyle(el).getPropertyValue(`--${type}-h`)
    const sProp = window.getComputedStyle(el).getPropertyValue(`--${type}-s`)
    const lProp = window.getComputedStyle(el).getPropertyValue(`--${type}-l`)
    const h = Number(hProp.replace('deg', '')) / 360
    const s = Number(sProp.replace('%', '')) / 100
    const l = Number(lProp.replace('%', '')) / 100
    return {h, s, l}
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ThemeViewProps extends React.HTMLAttributes<HTMLDivElement> {
    head?: undefined | React.ReactNode
}

export interface PickerProps {
    onPrimaryChange(hsl: ColorHslDict): void
    onSecondaryChange(hsl: ColorHslDict): void
    onThemeChange(theme: 'light' | 'dark'): void
}

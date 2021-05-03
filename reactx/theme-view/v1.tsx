import {hslFromRgb, rgbFromHexString, rgbFromHsl, rgbToHexString, Hsl} from '@eviljs/std-lib/color.js'
import {classes, times} from '@eviljs/std-react/react.js'
import React, {CSSProperties} from 'react'
import {ExampleIcon as Icon} from '../icon-example/v2.js'
const {useEffect, useRef, useState} = React

import './v1.css'

export function ThemeView(props: ThemeViewProps) {
    const {className, head, children} = props
    const [primaryAccent, setPrimaryAccent] = useState<Hsl>([0, 0, 0])
    const [secondaryAccent, setSecondaryAccent] = useState<Hsl>([0, 0, 0])
    const [theme, setTheme] = useState<'light' | 'dark'>('light')

    return (
        <div
            {...props}
            className={classes('ThemeView-t2eb std-theme back', className, theme)}
            style={{
                '--std-color-primary-h': primaryAccent[0] * 360,
                '--std-color-primary-s': primaryAccent[1] * 100 + '%',
                '--std-color-primary-l': primaryAccent[2] * 100 + '%',
                '--std-color-secondary-h': secondaryAccent[0] * 360,
                '--std-color-secondary-s': secondaryAccent[1] * 100 + '%',
                '--std-color-secondary-l': secondaryAccent[2] * 100 + '%',
            } as CSSProperties}
        >
            {head}

            <Picker
                onPrimaryChange={(it) => setPrimaryAccent(it)}
                onSecondaryChange={(it) => setSecondaryAccent(it)}
                onThemeChange={(it) => setTheme(it)}
            />

            <i className="std-space-v m"/>

            <div className="grid-1c73 std-flex center wrap">
                <Colors/>
                <Typography/>
                <Gutters/>
                <Contrast/>
                <Icons/>
                <Radiuses/>
                <Shadows/>
                <Transitions/>
                <Buttons/>
            </div>

            {children}
        </div>
    )
}

export function Picker(props: PickerProps) {
    const {onPrimaryChange, onSecondaryChange, onThemeChange} = props
    const primaryRef = useRef<HTMLInputElement | null>(null)
    const secondaryRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        const primaryAccent = readThemeColor('std-color-primary')
        const secondaryAccent = readThemeColor('std-color-secondary')
        primaryRef.current!.value = computeHexFromHslColor(primaryAccent)
        secondaryRef.current!.value = computeHexFromHslColor(secondaryAccent)

        onPrimaryChange(primaryAccent)
        onSecondaryChange(secondaryAccent)
    }, [])

    return (
        <h1 className="std-flex align-center std-text-overline">
            <input
                ref={primaryRef}
                className="picker-t8c2"
                type="color"
                onChange={(event) => onPrimaryChange(computeHslFromHexColor(event.target.value))}
            />
            <i className="std-space-h m"/>
            <label>Theme</label>
            <i className="std-space-h m"/>
            <input
                ref={secondaryRef}
                className="picker-t8c2"
                type="color"
                onChange={(event) => onSecondaryChange(computeHslFromHexColor(event.target.value))}
            />

            <i className="std-space-h m"/>

            <label className="std-flex column align-center">
                <input
                    type="checkbox"
                    onChange={(event) => onThemeChange(
                        event.target.checked
                            ? 'dark'
                            : 'light'
                    )}
                />
                <i className="std-space-v xxs"/>
                <b>Dark</b>
            </label>
        </h1>
    )
}

export function Colors() {
    return (
        <div className="std-flex column center">
            <div className="std-flex">
                <label className="std-text-h6 std-color-primary-accent">Primary</label>
                <div className="std-spacer"/>
            </div>

            <i className="std-space-v s"/>

            <div className="std-flex">
                <label>Accent</label>
                <div className="std-spacer"/>
                <span
                    className="color-t75a"
                    title="Primary accent"
                    style={{backgroundColor: 'var(--std-color-primary-accent)'}}
                />
            </div>

            <i className="std-space-v s"/>

            <div className="std-flex">
                <label>Tint</label>
                <div className="std-spacer"/>
                <div className="std-flex row-reverse">
                    {times(6).map((idx) => (
                        <span
                            key={idx}
                            className="color-t75a"
                            title={`Primary tint ${idx+1}`}
                            style={{backgroundColor: `var(--std-color-primary-tint${idx+1})`}}
                        />
                    ))}
                </div>
            </div>

            <div className="std-space-v s"/>

            <div className="std-flex">
                <label>Shade</label>
                <div className="std-spacer"/>
                <div className="std-flex row-reverse">
                    {times(6).map((idx) => (
                        <span
                            key={idx}
                            className="color-t75a"
                            title={`Primary shade ${idx+1}`}
                            style={{backgroundColor: `var(--std-color-primary-shade${idx+1})`}}
                        />
                    ))}
                </div>
            </div>

            <div className="std-space-v s"/>

            <div className="std-flex">
                <label>Tone</label>
                <div className="std-spacer"/>
                <div className="std-flex row-reverse">
                    {times(6).map((idx) => (
                        <span
                            key={idx}
                            className="color-t75a"
                            title={`Primary tone ${idx+1}`}
                            style={{backgroundColor: `var(--std-color-primary-tone${idx+1})`}}
                        />
                    ))}
                </div>
            </div>

            <div className="std-space-v s"/>

            <div className="std-flex">
                <label>Front</label>
                <div className="std-spacer"/>
                <div className="std-flex row-reverse">
                    {times(5).map((idx) => (
                        <span
                            key={idx}
                            className="color-t75a"
                            title={`Primary text ${idx+1}`}
                            style={{backgroundColor: `var(--std-color-primary-front${idx+1})`}}
                        />
                    ))}
                </div>
            </div>

            <div className="std-space-v s"/>

            <div className="std-flex">
                <label>Back</label>
                <div className="std-spacer"/>
                <div className="std-flex row-reverse">
                    {times(4).map((idx) => (
                        <span
                            key={idx}
                            className="color-t75a"
                            title={`Primary back ${idx+1}`}
                            style={{backgroundColor: `var(--std-color-primary-back${idx+1})`}}
                        />
                    ))}
                </div>
            </div>

            <i className="std-space-v m"/>

            <div className="std-flex">
                <label className="std-text-h6 std-color-secondary-accent">Secondary</label>
                <div className="std-spacer"/>
            </div>

            <div className="std-space-v s"/>

            <div className="std-flex">
                <label>Accent</label>
                <div className="std-spacer"/>
                <span
                    className="color-t75a"
                    title="Primary accent"
                    style={{backgroundColor: 'var(--std-color-secondary-accent)'}}
                />
            </div>

            <div className="std-space-v s"/>

            <div className="std-flex">
                <label>Tint</label>
                <div className="std-spacer"/>
                <div className="std-flex row-reverse">
                    {times(6).map((idx) => (
                        <span
                            key={idx}
                            className="color-t75a"
                            title={`Primary tint ${idx+1}`}
                            style={{backgroundColor: `var(--std-color-secondary-tint${idx+1})`}}
                        />
                    ))}
                </div>
            </div>

            <div className="std-space-v s"/>

            <div className="std-flex">
                <label>Shade</label>
                <div className="std-spacer"/>
                <div className="std-flex row-reverse">
                    {times(6).map((idx) => (
                        <span
                            key={idx}
                            className="color-t75a"
                            title={`Primary shade ${idx+1}`}
                            style={{backgroundColor: `var(--std-color-secondary-shade${idx+1})`}}
                        />
                    ))}
                </div>
            </div>

            <div className="std-space-v s"/>

            <div className="std-flex">
                <label>Tone</label>
                <div className="std-spacer"/>
                <div className="std-flex row-reverse">
                    {times(6).map((idx) => (
                        <span
                            key={idx}
                            className="color-t75a"
                            title={`Primary tone ${idx+1}`}
                            style={{backgroundColor: `var(--std-color-secondary-tone${idx+1})`}}
                        />
                    ))}
                </div>
            </div>

            <div className="std-space-v s"/>

            <div className="std-flex">
                <label>Front</label>
                <div className="std-spacer"/>
                <div className="std-flex row-reverse">
                    {times(5).map((idx) => (
                        <span
                            key={idx}
                            className="color-t75a"
                            title={`Secondary text ${idx+1}`}
                            style={{backgroundColor: `var(--std-color-secondary-front${idx+1})`}}
                        />
                    ))}
                </div>
            </div>

            <div className="std-space-v s"/>

            <div className="std-flex">
                <label>Back</label>
                <div className="std-spacer"/>
                <div className="std-flex row-reverse">
                    {times(4).map((idx) => (
                        <span
                            key={idx}
                            className="color-t75a"
                            title={`Secondary back ${idx+1}`}
                            style={{backgroundColor: `var(--std-color-secondary-back${idx+1})`}}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export function Typography() {
    return (
        <div className="std-flex column align-start">
            <label className="text-8fa3 std-text-display1 std-color-primary-front1">Display 1</label>
            <label className="text-8fa3 std-text-display2 std-color-primary-front2">Display 2</label>
            <label className="text-8fa3 std-text-h1 std-color-primary-front3">Headline 1</label>
            <label className="text-8fa3 std-text-h2 std-color-primary-front4">Headline 2</label>
            <label className="text-8fa3 std-text-h3 std-color-primary-front5">Headline 3</label>
            <label className="text-8fa3 std-text-h4 std-color-secondary-front1">Headline 4</label>
            <label className="text-8fa3 std-text-h5 std-color-secondary-front2">Headline 5</label>
            <label className="text-8fa3 std-text-h6 std-color-secondary-front3">Headline 6</label>
            <label className="text-8fa3 std-text-subtitle1 std-color-secondary-front4">Subtitle 1</label>
            <label className="text-8fa3 std-text-subtitle2 std-color-secondary-front5">Subtitle 2</label>
            <label className="text-8fa3 std-text-body1">Body 1</label>
            <label className="text-8fa3 std-text-body2">Body 2</label>
            <label className="text-8fa3 std-text-small">Small</label>
            <label className="text-8fa3 std-text-caption">Caption</label>
            <label className="text-8fa3 std-text-overline">Overline</label>
            <label className="text-8fa3 std-text-button">Button</label>
        </div>
    )
}

export function Gutters() {
    return (
        <div className="std-flex center column">
            <label className="gutter-t1d3 std-flex column"><span>Mini</span><i className="std-space-h mini"/></label>
            <i className="std-space-v xs"/>
            <label className="gutter-t1d3 std-flex column"><span>XXS</span><i className="std-space-h xxs"/></label>
            <i className="std-space-v xs"/>
            <label className="gutter-t1d3 std-flex column"><span>XS</span><i className="std-space-h xs"/></label>
            <i className="std-space-v xs"/>
            <label className="gutter-t1d3 std-flex column"><span>S</span><i className="std-space-h s"/></label>
            <i className="std-space-v xs"/>
            <label className="gutter-t1d3 std-flex column"><span>M</span><i className="std-space-h m"/></label>
            <i className="std-space-v xs"/>
            <label className="gutter-t1d3 std-flex column"><span>L</span><i className="std-space-h l"/></label>
            <i className="std-space-v xs"/>
            <label className="gutter-t1d3 std-flex column"><span>XL</span><i className="std-space-h xl"/></label>
            <i className="std-space-v xs"/>
            <label className="gutter-t1d3 std-flex column"><span>XXL</span><i className="std-space-h xxl"/></label>
            <i className="std-space-v xs"/>
            <label className="gutter-t1d3 std-flex column"><span>Maxi</span><i className="std-space-h maxi"/></label>
            <i className="std-space-v xs"/>
        </div>
    )
}

export function Contrast() {
    return (
        <div className="std-flex column center align-center">
            <div className="std-flex wrap">
                <label className="contrast-td08 std-color-back1">
                    <div className="std-color-front1">Back 1</div>
                    <div className="std-color-front1">Front 1</div>
                    <div className="std-color-front2">Front 2</div>
                    <div className="std-color-front3">Front 3</div>
                </label>
                <label className="contrast-td08 std-color-back2">
                    <div className="std-color-front1">Back 2</div>
                    <div className="std-color-front1">Front 1</div>
                    <div className="std-color-front2">Front 2</div>
                    <div className="std-color-front3">Front 3</div>
                </label>
                <label className="contrast-td08 std-color-back3">
                    <div className="std-color-front1">Back 3</div>
                    <div className="std-color-front1">Front 1</div>
                    <div className="std-color-front2">Front 2</div>
                    <div className="std-color-front3">Front 3</div>
                </label>
                <label className="contrast-td08 std-color-back4">
                    <div className="std-color-front1">Back 4</div>
                    <div className="std-color-front1">Front 1</div>
                    <div className="std-color-front2">Front 2</div>
                    <div className="std-color-front3">Front 3</div>
                </label>
            </div>

            <i className="std-space-v s"/>

            <div className="std-flex wrap">
                <label className="contrast-td08 std-color-primary-back1">
                    <div className="std-color-front1">Primary Back 1</div>
                    <div className="std-color-primary-front1">Primary Front 1</div>
                    <div className="std-color-primary-front2">Primary Front 2</div>
                    <div className="std-color-primary-front3">Primary Front 3</div>
                    <div className="std-color-primary-front4">Primary Front 4</div>
                    <div className="std-color-primary-front5">Primary Front 5</div>
                </label>
                <label className="contrast-td08 std-color-primary-back2">
                    <div className="std-color-front1">Primary Back 2</div>
                    <div className="std-color-primary-front1">Primary Front 1</div>
                    <div className="std-color-primary-front2">Primary Front 2</div>
                    <div className="std-color-primary-front3">Primary Front 3</div>
                    <div className="std-color-primary-front4">Primary Front 4</div>
                    <div className="std-color-primary-front5">Primary Front 5</div>
                </label>
                <label className="contrast-td08 std-color-primary-back3">
                    <div className="std-color-front1">Primary Back 3</div>
                    <div className="std-color-primary-front1">Primary Front 1</div>
                    <div className="std-color-primary-front2">Primary Front 2</div>
                    <div className="std-color-primary-front3">Primary Front 3</div>
                    <div className="std-color-primary-front4">Primary Front 4</div>
                    <div className="std-color-primary-front5">Primary Front 5</div>
                </label>
                <label className="contrast-td08 std-color-primary-back4">
                    <div className="std-color-front1">Primary Back 4</div>
                    <div className="std-color-primary-front1">Primary Front 1</div>
                    <div className="std-color-primary-front2">Primary Front 2</div>
                    <div className="std-color-primary-front3">Primary Front 3</div>
                    <div className="std-color-primary-front4">Primary Front 4</div>
                    <div className="std-color-primary-front5">Primary Front 5</div>
                </label>
            </div>

            <i className="std-space-v s"/>

            <div className="std-flex wrap">
                <label className="contrast-td08 std-color-secondary-back1">
                    <div className="std-color-front1">Secondary Back 1</div>
                    <div className="std-color-secondary-front1">Secondary Front 1</div>
                    <div className="std-color-secondary-front2">Secondary Front 2</div>
                    <div className="std-color-secondary-front3">Secondary Front 3</div>
                    <div className="std-color-secondary-front4">Secondary Front 4</div>
                    <div className="std-color-secondary-front5">Secondary Front 5</div>
                </label>
                <label className="contrast-td08 std-color-secondary-back2">
                    <div className="std-color-front1">Secondary Back 2</div>
                    <div className="std-color-secondary-front1">Secondary Front 1</div>
                    <div className="std-color-secondary-front2">Secondary Front 2</div>
                    <div className="std-color-secondary-front3">Secondary Front 3</div>
                    <div className="std-color-secondary-front4">Secondary Front 4</div>
                    <div className="std-color-secondary-front5">Secondary Front 5</div>
                </label>
                <label className="contrast-td08 std-color-secondary-back3">
                    <div className="std-color-front1">Secondary Back 3</div>
                    <div className="std-color-secondary-front1">Secondary Front 1</div>
                    <div className="std-color-secondary-front2">Secondary Front 2</div>
                    <div className="std-color-secondary-front3">Secondary Front 3</div>
                    <div className="std-color-secondary-front4">Secondary Front 4</div>
                    <div className="std-color-secondary-front5">Secondary Front 5</div>
                </label>
                <label className="contrast-td08 std-color-secondary-back4">
                    <div className="std-color-front1">Secondary Back 4</div>
                    <div className="std-color-secondary-front1">Secondary Front 1</div>
                    <div className="std-color-secondary-front2">Secondary Front 2</div>
                    <div className="std-color-secondary-front3">Secondary Front 3</div>
                    <div className="std-color-secondary-front4">Secondary Front 4</div>
                    <div className="std-color-secondary-front5">Secondary Front 5</div>
                </label>
            </div>
        </div>
    )
}

export function Buttons() {
    return (
        <div className="buttons-45cb std-flex column center align-center wrap">
            <div>
                <button className="std-text-button std-button dye">Dye</button>
                <button className="std-text-button std-button flat">Flat</button>
                <button className="std-text-button std-button halo">Halo</button>
                <button className="std-text-button std-button plain">Plain</button>
            </div>

            <div className="std-space-v xs"/>

            <div>
                <button className="std-text-button std-button dye" disabled>Dye</button>
                <button className="std-text-button std-button flat" disabled>Flat</button>
                <button className="std-text-button std-button halo" disabled>Halo</button>
                <button className="std-text-button std-button plain" disabled>Plain</button>
            </div>
        </div>
    )
}

export function Transitions() {
    return (
        <div className="std-flex center align-center wrap">
            <label className="duration-t347" style={{transitionDuration: 'var(--std-duration-flash)'}}>Flash</label>
            <label className="duration-t347" style={{transitionDuration: 'var(--std-duration-fast)'}}>Fast</label>
            <label className="duration-t347" style={{transitionDuration: 'var(--std-duration-normal)'}}>Normal</label>
            <label className="duration-t347" style={{transitionDuration: 'var(--std-duration-slow)'}}>Slow</label>
            <label className="duration-t347" style={{transitionDuration: 'var(--std-duration-slower)'}}>Slower</label>
        </div>
    )
}

export function Icons() {
    return (
        <div className="std-flex center align-end wrap">
            <div className="icon-e43c">
                <Icon className="std-icon maxi"/>
                <div className="std-space-h s"/>
                <label>Maxi</label>
            </div>
            <div className="icon-e43c">
                <Icon className="std-icon xxl"/>
                <div className="std-space-h xs"/>
                <label>XXL</label>
            </div>
            <div className="icon-e43c">
                <Icon className="std-icon xl"/>
                <div className="std-space-h xs"/>
                <label>XL</label>
            </div>
            <div className="icon-e43c">
                <Icon className="std-icon l"/>
                <div className="std-space-h xs"/>
                <label>L</label>
            </div>
            <div className="icon-e43c">
                <Icon className="std-icon m"/>
                <div className="std-space-h xs"/>
                <label>M</label>
            </div>
            <div className="icon-e43c">
                <Icon className="std-icon s"/>
                <div className="std-space-h xs"/>
                <label>S</label>
            </div>
            <div className="icon-e43c">
                <Icon className="std-icon xs"/>
                <div className="std-space-h xs"/>
                <label>XS</label>
            </div>
            <div className="icon-e43c">
                <Icon className="std-icon xxs"/>
                <div className="std-space-h xs"/>
                <label>XXS</label>
            </div>
            <div className="icon-e43c">
                <Icon className="std-icon mini"/>
                <div className="std-space-h xs"/>
                <label>Mini</label>
            </div>
        </div>
    )
}

export function Radiuses() {
    return (
        <div className="std-flex center align-center wrap">
            <label className="radius-75ca std-radius-maxi">Maxi</label>
            <label className="radius-75ca std-radius-xl">XL</label>
            <label className="radius-75ca std-radius-l">L</label>
            <label className="radius-75ca std-radius-m">M</label>
            <label className="radius-75ca std-radius-s">S</label>
            <label className="radius-75ca std-radius-xs">XS</label>
            <label className="radius-75ca std-radius-mini">Mini</label>
        </div>
    )
}

export function Shadows() {
    return (
        <div className="std-flex center align-center wrap std-viewport m">
            <label className="shadow-t9a2 std-shadow soft">Soft</label>
            {times(12).map((idx) => (
                <label key={idx} className={`shadow-t9a2 std-shadow z${idx}`}>{idx}</label>
            ))}
            {times(25).map((nil, idx) => idx).slice(12).map(idx => (
                <label key={idx} className={`shadow-t9a2 std-shadow primary-accent z${idx}`}>{idx}</label>
            ))}
        </div>
    )
}

export function readThemeColor(type: string): Hsl {
    const el = document.body
    const hProp = window.getComputedStyle(el).getPropertyValue(`--${type}-h`)
    const sProp = window.getComputedStyle(el).getPropertyValue(`--${type}-s`)
    const lProp = window.getComputedStyle(el).getPropertyValue(`--${type}-l`)
    const h = Number(hProp) / 360
    const s = Number(sProp.replace('%', '')) / 100
    const l = Number(lProp.replace('%', '')) / 100
    return [h, s, l]
}

export function computeHslFromHexColor(hex: string) {
    const rgb = rgbFromHexString(hex)
    const hsl = hslFromRgb(...rgb)
    return hsl
}

export function computeHexFromHslColor(hsl: Hsl) {
    const rgb = rgbFromHsl(...hsl)
    const hex = rgbToHexString(...rgb)
    return hex
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ThemeViewProps extends React.HTMLAttributes<HTMLDivElement> {
    head?: React.ReactNode
}

export interface PickerProps {
    onPrimaryChange(hsl: Hsl): void
    onSecondaryChange(hsl: Hsl): void
    onThemeChange(theme: 'light' | 'dark'): void
}
